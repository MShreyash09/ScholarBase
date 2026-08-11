import { Injectable } from "@nestjs/common";
import { DownloadUrlDto, FileViewUrlDto } from "@scholarbase/shared-types";
import { StorageService } from "./storage.service";

/**
 * The subset of a stored-file row that presigning needs. Papers and notes
 * (and any future file-backed model) already have these three columns —
 * depending on this instead of a concrete Prisma model is what lets this
 * service serve all of them without knowing any of them exist.
 */
export interface StoredFileRecord {
  fileKey: string;
  fileName: string;
  mimeType: string;
}

/**
 * Turns a stored-file row into a download or inline-view URL.
 *
 * Every file-backed resource (papers, notes, and whatever comes next) needs
 * exactly this: fetch its own row, then hand it here. Before this existed,
 * PapersService and NotesService each had their own copy of the presign call
 * and DTO-shaping — identical except for which bucket constant they closed
 * over. A third resource would have made it a third copy, and a fix to how
 * URLs are built (like the `inline` vs `attachment` disposition split) would
 * have needed finding and repeating in every copy instead of landing once
 * here.
 *
 * Deliberately NOT responsible for looking the row up or authorizing the
 * request — those differ per resource (papers are public, notes require
 * login) and belong in each resource's own service, not here.
 */
@Injectable()
export class StoredFileUrlService {
  constructor(private readonly storage: StorageService) {}

  async getDownloadUrl(bucket: string, record: StoredFileRecord): Promise<DownloadUrlDto> {
    const { url, expiresAt } = await this.storage.getPresignedDownloadUrl(
      bucket,
      record.fileKey,
      record.fileName,
    );
    return { url, expiresAt: expiresAt.toISOString() };
  }

  async getViewUrl(bucket: string, record: StoredFileRecord): Promise<FileViewUrlDto> {
    const { url, expiresAt } = await this.storage.getPresignedViewUrl(
      bucket,
      record.fileKey,
      record.fileName,
      record.mimeType,
    );
    return {
      url,
      expiresAt: expiresAt.toISOString(),
      fileName: record.fileName,
      mimeType: record.mimeType,
    };
  }
}
