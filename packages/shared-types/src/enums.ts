export enum UserRole {
  STUDENT = "student",
  ADMIN = "admin",
}

export enum StudyRoomVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
}

export enum UploadStatus {
  PENDING = "pending",
  READY = "ready",
  FAILED = "failed",
}

export enum IngestionStatus {
  NOT_INGESTED = "not_ingested",
  QUEUED = "queued",
  INGESTED = "ingested",
  FAILED = "failed",
}
