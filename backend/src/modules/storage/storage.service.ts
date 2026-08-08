import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client } from "minio";

export const PAPERS_BUCKET = "papers";
export const NOTES_BUCKET = "notes";
export const AVATARS_BUCKET = "avatars";

const DEFAULT_DOWNLOAD_EXPIRY_SECONDS = 5 * 60;

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: Client;
  private readonly bucketNames: Record<string, string>;

  constructor(private readonly config: ConfigService) {
    this.client = new Client({
      endPoint: this.config.getOrThrow<string>("MINIO_ENDPOINT"),
      port: Number(this.config.get<string>("MINIO_PORT", "9000")),
      useSSL: this.config.get<string>("MINIO_USE_SSL", "false") === "true",
      accessKey: this.config.getOrThrow<string>("MINIO_ROOT_USER"),
      secretKey: this.config.getOrThrow<string>("MINIO_ROOT_PASSWORD"),
    });

    this.bucketNames = {
      [PAPERS_BUCKET]: this.config.get<string>("MINIO_BUCKET_PAPERS", PAPERS_BUCKET),
      [NOTES_BUCKET]: this.config.get<string>("MINIO_BUCKET_NOTES", NOTES_BUCKET),
      [AVATARS_BUCKET]: this.config.get<string>("MINIO_BUCKET_AVATARS", AVATARS_BUCKET),
    };
  }

  /**
   * Best-effort bucket bootstrap. Object storage being unreachable or a key
   * lacking createBucket rights must NOT prevent the app from booting — this
   * used to throw out of onModuleInit, which Nest turns into an unhandled
   * rejection that kills the process *after* routes are mapped, taking chat and
   * study rooms down with it over a storage problem they don't depend on.
   *
   * Bucket auto-creation is also off by default now: on a hosted S3 provider
   * (B2/R2) buckets are created out-of-band, and a bucket-scoped application key
   * returns 403 from bucketExists — which we can't distinguish from "missing" —
   * and then makeBucket fails. Set STORAGE_MANAGE_BUCKETS=true for local MinIO.
   */
  async onModuleInit() {
    if (this.config.get<string>("STORAGE_MANAGE_BUCKETS", "false") !== "true") {
      return;
    }

    for (const bucket of Object.values(this.bucketNames)) {
      try {
        const exists = await this.client.bucketExists(bucket).catch(() => false);
        if (!exists) {
          await this.client.makeBucket(bucket);
          this.logger.log(`Created bucket "${bucket}"`);
        }
      } catch (err) {
        this.logger.error(
          `Could not ensure bucket "${bucket}" exists — uploads and downloads for it will fail until this is fixed. ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }
  }

  private resolveBucket(bucket: string): string {
    return this.bucketNames[bucket] ?? bucket;
  }

  async uploadObject(
    bucket: string,
    key: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<void> {
    await this.client.putObject(this.resolveBucket(bucket), key, buffer, buffer.length, {
      "Content-Type": mimeType,
    });
  }

  async getPresignedDownloadUrl(
    bucket: string,
    key: string,
    fileName: string,
    expirySeconds: number = DEFAULT_DOWNLOAD_EXPIRY_SECONDS,
  ): Promise<{ url: string; expiresAt: Date }> {
    const url = await this.client.presignedGetObject(
      this.resolveBucket(bucket),
      key,
      expirySeconds,
      { "response-content-disposition": `attachment; filename="${fileName}"` },
    );
    return { url, expiresAt: new Date(Date.now() + expirySeconds * 1000) };
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    await this.client.removeObject(this.resolveBucket(bucket), key);
  }
}
