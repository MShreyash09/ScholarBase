/**
 * UT-STO — StorageService presigned-URL construction
 *
 * These are security-relevant: the file name is attacker-influenced (it is the
 * uploader's original filename, stored verbatim) and gets interpolated into a
 * Content-Disposition header value. A quote or CRLF that survived would let the
 * uploader break out of the quoted string / inject a header.
 *
 * The minio client is mocked so no network or object storage is required.
 */
const mockPresignedGetObject = jest.fn().mockResolvedValue("https://example.test/signed");
const mockPutObject = jest.fn().mockResolvedValue(undefined);
const mockRemoveObject = jest.fn().mockResolvedValue(undefined);

jest.mock("minio", () => ({
  Client: jest.fn().mockImplementation(() => ({
    presignedGetObject: mockPresignedGetObject,
    putObject: mockPutObject,
    removeObject: mockRemoveObject,
    bucketExists: jest.fn().mockResolvedValue(true),
    makeBucket: jest.fn().mockResolvedValue(undefined),
  })),
}));

import { ConfigService } from "@nestjs/config";
import { StorageService, PAPERS_BUCKET } from "../../src/modules/storage/storage.service";

function makeService(overrides: Record<string, string> = {}) {
  const values: Record<string, string> = {
    MINIO_ENDPOINT: "localhost",
    MINIO_PORT: "9000",
    MINIO_USE_SSL: "false",
    MINIO_ROOT_USER: "test-user",
    MINIO_ROOT_PASSWORD: "test-password",
    ...overrides,
  };
  const config = {
    get: (key: string, def?: string) => values[key] ?? def,
    getOrThrow: (key: string) => {
      if (values[key] === undefined) throw new Error(`missing ${key}`);
      return values[key];
    },
  } as unknown as ConfigService;
  return new StorageService(config);
}

/** Pulls the response-header override object passed to presignedGetObject. */
function lastHeaders(): Record<string, string> {
  const call = mockPresignedGetObject.mock.calls.at(-1);
  return call?.[3] as Record<string, string>;
}

describe("UT-STO StorageService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("UT-STO-001: download URL requests an attachment disposition", async () => {
    const svc = makeService();
    await svc.getPresignedDownloadUrl(PAPERS_BUCKET, "key.pdf", "DBMS UT.pdf");
    expect(lastHeaders()["response-content-disposition"]).toBe(
      'attachment; filename="DBMS UT.pdf"',
    );
  });

  it("UT-STO-002: view URL requests an inline disposition and pins the content type", async () => {
    const svc = makeService();
    await svc.getPresignedViewUrl(PAPERS_BUCKET, "key.pdf", "DBMS UT.pdf", "application/pdf");
    expect(lastHeaders()["response-content-disposition"]).toBe('inline; filename="DBMS UT.pdf"');
    expect(lastHeaders()["response-content-type"]).toBe("application/pdf");
  });

  it("UT-STO-003: neutralizes a double quote so the filename cannot escape the quoted string", async () => {
    const svc = makeService();
    await svc.getPresignedViewUrl(
      PAPERS_BUCKET,
      "key.pdf",
      'evil".pdf',
      "application/pdf",
    );
    const disposition = lastHeaders()["response-content-disposition"];
    // Exactly two quotes: the opening and closing delimiters, none from input.
    expect(disposition.match(/"/g)).toHaveLength(2);
    expect(disposition).toBe('inline; filename="evil_.pdf"');
  });

  it("UT-STO-004: neutralizes CR and LF so a header cannot be injected", async () => {
    const svc = makeService();
    await svc.getPresignedDownloadUrl(
      PAPERS_BUCKET,
      "key.pdf",
      "a.pdf\r\nX-Injected: yes",
    );
    const disposition = lastHeaders()["response-content-disposition"];
    expect(disposition).not.toMatch(/[\r\n]/);
    expect(disposition).not.toContain("X-Injected: yes\r");
    expect(disposition).toBe('attachment; filename="a.pdf__X-Injected: yes"');
  });

  it("UT-STO-005: neutralizes backslash escapes", async () => {
    const svc = makeService();
    await svc.getPresignedDownloadUrl(PAPERS_BUCKET, "key.pdf", 'a\\".pdf');
    expect(lastHeaders()["response-content-disposition"]).toBe('attachment; filename="a__.pdf"');
  });

  it("UT-STO-006: does NOT encode non-ASCII filenames (documents known defect QA-004)", async () => {
    const svc = makeService();
    await svc.getPresignedDownloadUrl(PAPERS_BUCKET, "key.pdf", "物理学ノート.pdf");
    const disposition = lastHeaders()["response-content-disposition"];
    // HTTP header values are ISO-8859-1; these code points are passed through
    // raw rather than RFC 5987 encoded (filename*=UTF-8''...).
    expect(disposition).toContain("物理学ノート.pdf");
    // eslint-disable-next-line no-control-regex
    expect(/^[\x00-\xFF]*$/.test(disposition)).toBe(false);
  });

  it("UT-STO-007: applies the documented default expiries (5 min download, 30 min view)", async () => {
    const svc = makeService();
    const dl = await svc.getPresignedDownloadUrl(PAPERS_BUCKET, "k", "f.pdf");
    expect(mockPresignedGetObject.mock.calls.at(-1)?.[2]).toBe(300);
    const view = await svc.getPresignedViewUrl(PAPERS_BUCKET, "k", "f.pdf", "application/pdf");
    expect(mockPresignedGetObject.mock.calls.at(-1)?.[2]).toBe(1800);

    // expiresAt must line up with the requested window, not the default.
    expect(dl.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(view.expiresAt.getTime()).toBeGreaterThan(dl.expiresAt.getTime());
  });

  it("UT-STO-008: resolves logical bucket names through env overrides", async () => {
    const svc = makeService({ MINIO_BUCKET_PAPERS: "prod-papers" });
    await svc.getPresignedDownloadUrl(PAPERS_BUCKET, "k", "f.pdf");
    expect(mockPresignedGetObject.mock.calls.at(-1)?.[0]).toBe("prod-papers");
  });
});
