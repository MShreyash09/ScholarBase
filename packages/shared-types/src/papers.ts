import { IngestionStatus, UploadStatus } from "./enums";

export interface QuestionPaperDto {
  id: string;
  subjectId: string;
  examTypeId: string;
  academicYear: number;
  fileName: string;
  fileSizeBytes: number;
  uploadStatus: UploadStatus;
  ingestionStatus: IngestionStatus;
  createdAt: string;
}

export interface CreateQuestionPaperMetaDto {
  subjectId: string;
  examTypeId: string;
  academicYear: number;
}

export interface DownloadUrlDto {
  url: string;
  expiresAt: string;
}
