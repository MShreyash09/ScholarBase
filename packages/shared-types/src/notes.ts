import { UploadStatus } from "./enums";

export interface NoteDto {
  id: string;
  subjectId: string;
  title: string;
  unitTopic: string | null;
  fileName: string;
  fileSizeBytes: number;
  uploadStatus: UploadStatus;
  createdAt: string;
}

export interface CreateNoteMetaDto {
  subjectId: string;
  title: string;
  unitTopic?: string | null;
}
