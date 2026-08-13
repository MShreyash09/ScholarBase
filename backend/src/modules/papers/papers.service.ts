import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { createHash, randomUUID } from "crypto";
import {
  IngestionStatus as PrismaIngestionStatus,
  QuestionPaper,
  UploadStatus as PrismaUploadStatus,
} from "@prisma/client";
import {
  DownloadUrlDto,
  FileViewUrlDto,
  IngestionStatus,
  QuestionPaperDto,
  UploadStatus,
} from "@scholarbase/shared-types";
import { PrismaService } from "../../prisma/prisma.service";
import { PAPERS_BUCKET, StorageService } from "../storage/storage.service";
import { StoredFileUrlService } from "../storage/stored-file-url.service";
import { PDF_MIME_TYPES } from "../../common/constants/uploads";
import { CreateQuestionPaperBodyDto } from "./dto/create-question-paper.dto";
import { FindPapersQueryDto } from "./dto/find-papers-query.dto";

@Injectable()
export class PapersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly fileUrls: StoredFileUrlService,
  ) {}

  /**
   * The one paper per semester that a signed-out visitor may open, as a set of
   * ids.
   *
   * "Semester" here means a (department, semester number) pair — the same thing
   * SemesterPage shows — so each semester page has exactly one openable paper
   * and everything else prompts a login.
   *
   * Ordering is deterministic (newest academic year first, id as tiebreak) so
   * the same paper is free on every request and for every visitor. It has to be
   * computed centrally rather than "whichever the UI lists first", otherwise
   * the lock the client draws and the lock the API enforces could disagree.
   *
   * This reads the whole table. That is fine at the scale this serves (tens to
   * low hundreds of papers) and keeps the rule in one obvious place; if the
   * archive ever grows enough for it to matter, cache it or push the grouping
   * into SQL with DISTINCT ON.
   */
  private async freePaperIds(): Promise<Set<string>> {
    const rows = await this.prisma.questionPaper.findMany({
      select: {
        id: true,
        subject: { select: { department: true, semester: true } },
      },
      orderBy: [{ academicYear: "desc" }, { id: "asc" }],
    });

    const free = new Set<string>();
    const claimed = new Set<string>();
    for (const row of rows) {
      const key = `${row.subject.department ?? "?"}::${row.subject.semester ?? "?"}`;
      if (claimed.has(key)) continue;
      claimed.add(key);
      free.add(row.id);
    }
    return free;
  }

  /** Null when the caller is logged in — nothing is locked for them. */
  private async lockedResolver(isAuthenticated: boolean): Promise<Set<string> | null> {
    return isAuthenticated ? null : await this.freePaperIds();
  }

  async findAll(query: FindPapersQueryDto, isAuthenticated = false): Promise<QuestionPaperDto[]> {
    const rows = await this.prisma.questionPaper.findMany({
      where: {
        subjectId: query.subjectId,
        examTypeId: query.examTypeId,
        academicYear: query.academicYear,
      },
      orderBy: { academicYear: "desc" },
    });
    const free = await this.lockedResolver(isAuthenticated);
    return rows.map((row) => this.toDto(row, free !== null && !free.has(row.id)));
  }

  async findOne(id: string, isAuthenticated = false): Promise<QuestionPaperDto> {
    const row = await this.prisma.questionPaper.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Question paper not found");
    const free = await this.lockedResolver(isAuthenticated);
    return this.toDto(row, free !== null && !free.has(row.id));
  }

  /**
   * Throws unless the caller is entitled to open this specific paper. This is
   * the actual gate — the greyed-out buttons in the UI are only a courtesy, and
   * anyone can call the endpoint directly.
   */
  private async assertCanOpen(id: string, isAuthenticated: boolean): Promise<void> {
    if (isAuthenticated) return;
    const free = await this.freePaperIds();
    if (!free.has(id)) {
      throw new UnauthorizedException(
        "Log in to open this paper. Signed-out visitors get one free paper per semester.",
      );
    }
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

    // Uploads are admin-only, so the uploader is by definition logged in.
    return this.toDto(row, false);
  }

  async getDownloadUrl(id: string, isAuthenticated = false): Promise<DownloadUrlDto> {
    const row = await this.prisma.questionPaper.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Question paper not found");
    await this.assertCanOpen(id, isAuthenticated);
    return this.fileUrls.getDownloadUrl(PAPERS_BUCKET, row);
  }

  async getViewUrl(id: string, isAuthenticated = false): Promise<FileViewUrlDto> {
    const row = await this.prisma.questionPaper.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Question paper not found");
    await this.assertCanOpen(id, isAuthenticated);
    return this.fileUrls.getViewUrl(PAPERS_BUCKET, row);
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

  private toDto(row: QuestionPaper, locked: boolean): QuestionPaperDto {
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
      locked,
    };
  }
}
