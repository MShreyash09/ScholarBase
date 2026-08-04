import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Note, UploadStatus as PrismaUploadStatus } from "@prisma/client";
import { DownloadUrlDto, NoteDto, UploadStatus } from "@scholarbase/shared-types";
import { PrismaService } from "../../prisma/prisma.service";
import { NOTES_BUCKET, StorageService } from "../storage/storage.service";
import { NOTES_MIME_TYPES } from "../../common/constants/uploads";
import { CreateNoteBodyDto } from "./dto/create-note.dto";
import { FindNotesQueryDto } from "./dto/find-notes-query.dto";

@Injectable()
export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async findAll(query: FindNotesQueryDto): Promise<NoteDto[]> {
    const rows = await this.prisma.note.findMany({
      where: { subjectId: query.subjectId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(this.toDto);
  }

  async findOne(id: string): Promise<NoteDto> {
    const row = await this.prisma.note.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Note not found");
    return this.toDto(row);
  }

  async create(
    dto: CreateNoteBodyDto,
    file: Express.Multer.File,
    uploadedById: string,
  ): Promise<NoteDto> {
    if (!file) {
      throw new BadRequestException("A file is required");
    }
    if (!NOTES_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException("Unsupported file type for notes");
    }

    const fileKey = `${dto.subjectId}/${randomUUID()}-${file.originalname}`;
    await this.storage.uploadObject(NOTES_BUCKET, fileKey, file.buffer, file.mimetype);

    const row = await this.prisma.note.create({
      data: {
        subjectId: dto.subjectId,
        title: dto.title,
        unitTopic: dto.unitTopic ?? null,
        fileKey,
        fileName: file.originalname,
        fileSizeBytes: file.size,
        mimeType: file.mimetype,
        uploadedById,
        uploadStatus: PrismaUploadStatus.ready,
      },
    });

    return this.toDto(row);
  }

  /** Only reachable behind JwtAuthGuard — notes downloads require a logged-in student. */
  async getDownloadUrl(id: string): Promise<DownloadUrlDto> {
    const row = await this.prisma.note.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Note not found");

    const { url, expiresAt } = await this.storage.getPresignedDownloadUrl(
      NOTES_BUCKET,
      row.fileKey,
      row.fileName,
    );
    return { url, expiresAt: expiresAt.toISOString() };
  }

  async remove(id: string): Promise<void> {
    const row = await this.prisma.note.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Note not found");

    await this.storage.deleteObject(NOTES_BUCKET, row.fileKey);
    await this.prisma.note.delete({ where: { id } });
  }

  private toDto(row: Note): NoteDto {
    return {
      id: row.id,
      subjectId: row.subjectId,
      title: row.title,
      unitTopic: row.unitTopic,
      fileName: row.fileName,
      fileSizeBytes: row.fileSizeBytes,
      uploadStatus: row.uploadStatus as unknown as UploadStatus,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
