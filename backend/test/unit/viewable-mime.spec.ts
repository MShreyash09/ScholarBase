/**
 * UT-MIME — isViewableMimeType (packages/shared-types/src/papers.ts)
 *
 * Decides whether DocumentViewer renders a file in an iframe or shows the
 * "can't preview this type" fallback. A false positive here means the user is
 * shown a blank grey frame instead of a useful message.
 */
import { isViewableMimeType, VIEWABLE_MIME_TYPES } from "@scholarbase/shared-types";

describe("UT-MIME isViewableMimeType", () => {
  it("UT-MIME-001: accepts every type declared viewable", () => {
    for (const type of VIEWABLE_MIME_TYPES) {
      expect(isViewableMimeType(type)).toBe(true);
    }
  });

  it("UT-MIME-002: accepts PDF, the only type papers uploads can produce", () => {
    expect(isViewableMimeType("application/pdf")).toBe(true);
  });

  it("UT-MIME-003: rejects renderable-but-dangerous types", () => {
    // Neither is in the allowlist; both would execute script if ever rendered.
    expect(isViewableMimeType("text/html")).toBe(false);
    expect(isViewableMimeType("image/svg+xml")).toBe(false);
  });

  it("UT-MIME-004: rejects office types that cannot render in an iframe", () => {
    expect(
      isViewableMimeType(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ),
    ).toBe(false);
    expect(isViewableMimeType("application/msword")).toBe(false);
  });

  it("UT-MIME-005: rejects empty/garbage input rather than throwing", () => {
    expect(isViewableMimeType("")).toBe(false);
    expect(isViewableMimeType("not-a-mime-type")).toBe(false);
  });

  it("UT-MIME-006: is case-sensitive and does not strip parameters (documents current behaviour)", () => {
    // Both are legal representations of a PDF per RFC 2045 but fail the
    // allowlist. Harmless today because upload validation stores the exact
    // lowercase string, but it makes the check brittle if that ever changes.
    expect(isViewableMimeType("APPLICATION/PDF")).toBe(false);
    expect(isViewableMimeType("application/pdf; charset=binary")).toBe(false);
  });
});
