/**
 * IT-RES — PapersService / NotesService upload + URL issuance.
 *
 * Covers the file-handling boundary: what the API accepts as an upload, how the
 * storage key is derived from user-controlled input, and that a missing row
 * produces 404 rather than a broken presigned URL.
 */
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { PapersService } from "../../src/modules/papers/papers.service";
import { NotesService } from "../../src/modules/notes/notes.service";
import { PrismaService } from "../../src/prisma/prisma.service";
import type { StorageService } from "../../src/modules/storage/storage.service";
import type { StoredFileUrlService } from "../../src/modules/storage/stored-file-url.service";

function makeDeps() {
  const prisma = {
    questionPaper: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), delete: jest.fn() },
    note: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), delete: jest.fn() },
  } as unknown as PrismaService;

  const storage = {
    uploadObject: jest.fn().mockResolvedValue(undefined),
    deleteObject: jest.fn().mockResolvedValue(undefined),
  } as unknown as StorageService;

  const fileUrls = {
    getDownloadUrl: jest.fn().mockResolvedValue({ url: "u", expiresAt: "e" }),
    getViewUrl: jest.fn().mockResolvedValue({ url: "u", expiresAt: "e", fileName: "f", mimeType: "m" }),
  } as unknown as StoredFileUrlService;

  return {
    prisma,
    storage,
    fileUrls,
    papers: new PapersService(prisma, storage, fileUrls),
    notes: new NotesService(prisma, storage, fileUrls),
  };
}

function file(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    originalname: "CN UT.pdf",
    mimetype: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 fake pdf bytes"),
    size: 23,
    ...overrides,
  } as Express.Multer.File;
}

const PAPER_META = {
  subjectId: "3f7c1e2a-0b5d-4c6e-9a1b-2c3d4e5f6a7b",
  examTypeId: "4f7c1e2a-0b5d-4c6e-9a1b-2c3d4e5f6a7b",
  academicYear: 2026,
};

describe("IT-RES papers upload", () => {
  it("IT-RES-001: rejects a request with no file attached", async () => {
    const { papers } = makeDeps();
    await expect(
      papers.create(PAPER_META, undefined as unknown as Express.Multer.File, "admin-1"),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("IT-RES-002: rejects a non-PDF declared content type", async () => {
    const { papers, storage } = makeDeps();
    await expect(
      papers.create(PAPER_META, file({ mimetype: "image/png" }), "admin-1"),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(storage.uploadObject).not.toHaveBeenCalled();
  });

  it("IT-RES-003: SECURITY — accepts HTML bytes when the client declares application/pdf", async () => {
    const { papers, prisma, storage } = makeDeps();
    (prisma.questionPaper.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.questionPaper.create as jest.Mock).mockImplementation(({ data }) => ({
      ...data,
      id: "p1",
      createdAt: new Date(),
      updatedAt: new Date(),
      ingestionStatus: "not_ingested",
    }));

    // Content type is taken from the client's multipart header and never
    // checked against the actual bytes (no magic-number sniffing).
    const evil = file({
      mimetype: "application/pdf",
      originalname: "notes.pdf",
      buffer: Buffer.from("<html><script>alert(1)</script></html>"),
    });

    await expect(papers.create(PAPER_META, evil, "admin-1")).resolves.toBeDefined();
    expect(storage.uploadObject).toHaveBeenCalled();
    // The bogus type is then persisted and later forced onto the view URL.
    expect((prisma.questionPaper.create as jest.Mock).mock.calls[0][0].data.mimeType).toBe(
      "application/pdf",
    );
  });

  it("IT-RES-004: refuses a byte-identical duplicate via checksum", async () => {
    const { papers, prisma } = makeDeps();
    (prisma.questionPaper.findUnique as jest.Mock).mockResolvedValue({ id: "existing" });

    await expect(papers.create(PAPER_META, file(), "admin-1")).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("IT-RES-005: derives a namespaced storage key with a random component", async () => {
    const { papers, prisma, storage } = makeDeps();
    (prisma.questionPaper.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.questionPaper.create as jest.Mock).mockImplementation(({ data }) => ({
      ...data,
      id: "p1",
      createdAt: new Date(),
      updatedAt: new Date(),
      ingestionStatus: "not_ingested",
    }));

    await papers.create(PAPER_META, file(), "admin-1");
    const key = (storage.uploadObject as jest.Mock).mock.calls[0][1] as string;

    expect(key.startsWith(`${PAPER_META.subjectId}/${PAPER_META.academicYear}/`)).toBe(true);
    // A UUID prefix means two uploads of the same filename cannot collide.
    expect(key).toMatch(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-CN UT\.pdf$/,
    );
  });

  it("IT-RES-006: SECURITY — traversal sequences in the filename survive into the storage key", async () => {
    const { papers, prisma, storage } = makeDeps();
    (prisma.questionPaper.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.questionPaper.create as jest.Mock).mockImplementation(({ data }) => ({
      ...data,
      id: "p1",
      createdAt: new Date(),
      updatedAt: new Date(),
      ingestionStatus: "not_ingested",
    }));

    await papers.create(PAPER_META, file({ originalname: "../../etc/passwd.pdf" }), "admin-1");
    const key = (storage.uploadObject as jest.Mock).mock.calls[0][1] as string;

    // S3-compatible stores treat the key as an opaque string, so this does not
    // escape the bucket — but the sequence is stored unsanitized, which would
    // matter for any consumer that maps keys onto a filesystem path.
    expect(key).toContain("../../etc/passwd.pdf");
  });
});

describe("IT-RES notes upload", () => {
  it("IT-RES-007: accepts the documented office formats", async () => {
    const { notes, prisma } = makeDeps();
    (prisma.note.create as jest.Mock).mockImplementation(({ data }) => ({
      ...data,
      id: "n1",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    for (const mimetype of [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ]) {
      await expect(
        notes.create(
          { subjectId: PAPER_META.subjectId, title: "Unit 2" },
          file({ mimetype }),
          "admin-1",
        ),
      ).resolves.toBeDefined();
    }
  });

  it("IT-RES-008: rejects an unsupported type for notes", async () => {
    const { notes, storage } = makeDeps();
    await expect(
      notes.create(
        { subjectId: PAPER_META.subjectId, title: "Unit 2" },
        file({ mimetype: "image/svg+xml" }),
        "admin-1",
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(storage.uploadObject).not.toHaveBeenCalled();
  });
});

describe("IT-RES URL issuance", () => {
  it("IT-RES-009: papers download/view 404 when the row does not exist", async () => {
    const { papers, prisma } = makeDeps();
    (prisma.questionPaper.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(papers.getDownloadUrl("missing")).rejects.toBeInstanceOf(NotFoundException);
    await expect(papers.getViewUrl("missing")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("IT-RES-010: notes download/view 404 when the row does not exist", async () => {
    const { notes, prisma } = makeDeps();
    (prisma.note.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(notes.getDownloadUrl("missing")).rejects.toBeInstanceOf(NotFoundException);
    await expect(notes.getViewUrl("missing")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("IT-RES-011: each resource presigns against its own bucket", async () => {
    const { papers, notes, prisma, fileUrls } = makeDeps();
    const row = { fileKey: "k", fileName: "f.pdf", mimeType: "application/pdf" };
    (prisma.questionPaper.findUnique as jest.Mock).mockResolvedValue(row);
    (prisma.note.findUnique as jest.Mock).mockResolvedValue(row);

    await papers.getViewUrl("p1");
    expect((fileUrls.getViewUrl as jest.Mock).mock.calls.at(-1)?.[0]).toBe("papers");

    await notes.getViewUrl("n1");
    expect((fileUrls.getViewUrl as jest.Mock).mock.calls.at(-1)?.[0]).toBe("notes");
  });
});
