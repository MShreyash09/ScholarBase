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
  /**
   * True when the caller must log in before the file can be opened. Signed-out
   * visitors get exactly one free paper per semester; everything else is
   * locked. Always false for a logged-in user.
   *
   * The server decides this rather than the client, so the lock the UI draws
   * and the lock the API enforces can never drift apart.
   */
  locked: boolean;
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

/**
 * Same presigned object, but requested with an `inline` content disposition so
 * the browser renders it instead of saving it. Carries the metadata the viewer
 * needs to decide whether it can preview the file at all.
 */
export interface FileViewUrlDto {
  url: string;
  expiresAt: string;
  fileName: string;
  mimeType: string;
}

/** Types the in-app viewer can render in an iframe; anything else downloads. */
export const VIEWABLE_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export function isViewableMimeType(mimeType: string): boolean {
  return (VIEWABLE_MIME_TYPES as readonly string[]).includes(mimeType);
}
