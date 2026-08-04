import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { createHash, randomUUID } from "crypto";
import {
  IngestionStatus as PrismaIngestionStatus,
  QuestionPaper,
  UploadStatus as PrismaUploadStatus,
} from "@prisma/client";
import {
  DownloadUrlDto,
  IngestionStatus,
  QuestionPaperDto,
  UploadStatus,
} from "@scholarbase/shared-types";
import { PrismaService } from "../../prisma/prisma.service";
import { PAPERS_BUCKET, StorageService } from "../storage/storage.service";
import { PDF_MIME_TYPES } from "../../common/constants/uploads";
import { CreateQuestionPaperBodyDto } from "./dto/create-question-paper.dto";
import { FindPapersQueryDto } from "./dto/find-papers-query.dto";

@Injectable()
export class PapersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async findAll(query: FindPapersQueryDto): Promise<QuestionPaperDto[]> {
    const rows = await this.prisma.questionPaper.findMany({
      where: {
        subjectId: query.subjectId,
        examTypeId: query.examTypeId,
        academicYear: query.academicYear,
      },
      orderBy: { academicYear: "desc" },
    });
    return rows.map((row) => this.toDto(row));
  }

  async findOne(id: string): Promise<QuestionPaperDto> {
    const row = await this.prisma.questionPaper.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Question paper not found");
    return this.toDto(row);
  }

  async create(
    dto: CreateQuestionPaperBodyDto,
    file: Express.Multer.File,
    uploadedById: string,
  ): Promise<QuestionPaperDto> {
    if (!file) {
      throw new BadRequestException("A PDF file is required");
    }
    if (!PDF_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException("Only PDF files are accepted for question papers");
    }

    const checksum = createHash("sha256").update(file.buffer).digest("hex");
    const existing = await this.prisma.questionPaper.findUnique({ where: { checksum } });
    if (existing) {
      throw new ConflictException("An identical question paper has already been uploaded");
    }

    const fileKey = `${dto.subjectId}/${dto.academicYear}/${randomUUID()}-${file.originalname}`;
    await this.storage.uploadObject(PAPERS_BUCKET, fileKey, file.buffer, file.mimetype);

    const row = await this.prisma.questionPaper.create({
      data: {
        subjectId: dto.subjectId,
        examTypeId: dto.examTypeId,
        academicYear: dto.academicYear,
        fileKey,
        fileName: file.originalname,
        fileSizeBytes: file.size,
        mimeType: file.mimetype,
        checksum,
        uploadedById,
        uploadStatus: PrismaUploadStatus.ready,
      },
    });

    return this.toDto(row);
  }

  async getDownloadUrl(id: string): Promise<DownloadUrlDto> {
    const row = await this.prisma.questionPaper.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Question paper not found");

    const { url, expiresAt } = await this.storage.getPresignedDownloadUrl(
      PAPERS_BUCKET,
      row.fileKey,
      row.fileName,
    );
    return { url, expiresAt: expiresAt.toISOString() };
  }

  async remove(id: string): Promise<void> {
    const row = await this.prisma.questionPaper.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Question paper not found");

    await this.storage.deleteObject(PAPERS_BUCKET, row.fileKey);
    await this.prisma.questionPaper.delete({ where: { id } });
  }

  private toUploadStatus(status: PrismaUploadStatus): UploadStatus {
    return status as unknown as UploadStatus;
  }

  private toIngestionStatus(status: PrismaIngestionStatus): IngestionStatus {
    return status as unknown as IngestionStatus;
  }

  private toDto(row: QuestionPaper): QuestionPaperDto {
    return {
      id: row.id,
      subjectId: row.subjectId,
      examTypeId: row.examTypeId,
      academicYear: row.academicYear,
      fileName: row.fileName,
      fileSizeBytes: row.fileSizeBytes,
      uploadStatus: this.toUploadStatus(row.uploadStatus),
      ingestionStatus: this.toIngestionStatus(row.ingestionStatus),
      createdAt: row.createdAt.toISOString(),
    };
  }
}
