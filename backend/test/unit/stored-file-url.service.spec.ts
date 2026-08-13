/**
 * UT-SFU — StoredFileUrlService
 *
 * The shared presign/DTO-shaping layer that papers and notes both delegate to.
 * Its contract is that the bucket and the record's own fields are forwarded
 * unchanged, and that dates are serialized as ISO strings for the wire.
 */
import { StoredFileUrlService } from "../../src/modules/storage/stored-file-url.service";
import type { StorageService } from "../../src/modules/storage/storage.service";

const EXPIRES = new Date("2026-01-01T00:30:00.000Z");

function makeStorage() {
  return {
    getPresignedDownloadUrl: jest
      .fn()
      .mockResolvedValue({ url: "https://example.test/dl", expiresAt: EXPIRES }),
    getPresignedViewUrl: jest
      .fn()
      .mockResolvedValue({ url: "https://example.test/view", expiresAt: EXPIRES }),
  } as unknown as StorageService;
}

const RECORD = {
  fileKey: "subject-id/2026/uuid-CN UT.pdf",
  fileName: "CN UT.pdf",
  mimeType: "application/pdf",
};

describe("UT-SFU StoredFileUrlService", () => {
  it("UT-SFU-001: forwards bucket and file key to the storage layer for downloads", async () => {
    const storage = makeStorage();
    const svc = new StoredFileUrlService(storage);

    await svc.getDownloadUrl("papers", RECORD);

    expect(storage.getPresignedDownloadUrl).toHaveBeenCalledWith(
      "papers",
      RECORD.fileKey,
      RECORD.fileName,
    );
  });

  it("UT-SFU-002: forwards the mime type for views (required to render inline)", async () => {
    const storage = makeStorage();
    const svc = new StoredFileUrlService(storage);

    await svc.getViewUrl("notes", RECORD);

    expect(storage.getPresignedViewUrl).toHaveBeenCalledWith(
      "notes",
      RECORD.fileKey,
      RECORD.fileName,
      RECORD.mimeType,
    );
  });

  it("UT-SFU-003: serializes expiry as an ISO string in the download DTO", async () => {
    const svc = new StoredFileUrlService(makeStorage());
    const dto = await svc.getDownloadUrl("papers", RECORD);

    expect(dto).toEqual({
      url: "https://example.test/dl",
      expiresAt: "2026-01-01T00:30:00.000Z",
    });
    // Download DTO must NOT leak the storage key.
    expect(JSON.stringify(dto)).not.toContain(RECORD.fileKey);
  });

  it("UT-SFU-004: view DTO carries the metadata the viewer needs, and no storage key", async () => {
    const svc = new StoredFileUrlService(makeStorage());
    const dto = await svc.getViewUrl("papers", RECORD);

    expect(dto).toEqual({
      url: "https://example.test/view",
      expiresAt: "2026-01-01T00:30:00.000Z",
      fileName: "CN UT.pdf",
      mimeType: "application/pdf",
    });
    expect(JSON.stringify(dto)).not.toContain(RECORD.fileKey);
  });

  it("UT-SFU-005: is agnostic to the record's concrete model (structural typing)", async () => {
    const storage = makeStorage();
    const svc = new StoredFileUrlService(storage);

    // A row carrying extra columns (as a real Prisma model does) is accepted,
    // and the extra columns must not leak into the response DTO.
    const noteRow = { ...RECORD, id: "n1", title: "Unit 2", uploadedById: "u1" };
    const dto = await svc.getViewUrl("notes", noteRow);

    expect(Object.keys(dto).sort()).toEqual(["expiresAt", "fileName", "mimeType", "url"]);
  });
});
