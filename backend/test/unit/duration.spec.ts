/**
 * UT-DUR — parseDurationMs (src/common/utils/duration.ts)
 *
 * This helper converts JWT_REFRESH_TTL into the refresh-token expiry that is
 * written to the database, so a silent mis-parse here would either expire
 * sessions immediately or keep them alive far longer than intended.
 */
import { parseDurationMs } from "../../src/common/utils/duration";

describe("UT-DUR parseDurationMs", () => {
  it("UT-DUR-001: converts each supported unit to milliseconds", () => {
    expect(parseDurationMs("45s")).toBe(45_000);
    expect(parseDurationMs("15m")).toBe(900_000);
    expect(parseDurationMs("12h")).toBe(43_200_000);
    expect(parseDurationMs("30d")).toBe(2_592_000_000);
  });

  it("UT-DUR-002: parses the production defaults used by the app", () => {
    // Defaults hardcoded in AuthService when the env var is absent.
    expect(parseDurationMs("30d")).toBe(30 * 86_400_000);
  });

  it("UT-DUR-003: tolerates surrounding whitespace", () => {
    expect(parseDurationMs("  15m  ")).toBe(900_000);
  });

  it("UT-DUR-004: tolerates internal whitespace between amount and unit", () => {
    expect(parseDurationMs("15 m")).toBe(900_000);
  });

  it("UT-DUR-005: rejects malformed values rather than silently defaulting", () => {
    expect(() => parseDurationMs("")).toThrow(/Invalid duration/);
    expect(() => parseDurationMs("15")).toThrow(/Invalid duration/);
    expect(() => parseDurationMs("m")).toThrow(/Invalid duration/);
    expect(() => parseDurationMs("15w")).toThrow(/Invalid duration/);
    expect(() => parseDurationMs("-5m")).toThrow(/Invalid duration/);
    expect(() => parseDurationMs("1.5h")).toThrow(/Invalid duration/);
    expect(() => parseDurationMs("15m30s")).toThrow(/Invalid duration/);
  });

  it("UT-DUR-006: accepts zero without throwing (boundary)", () => {
    expect(parseDurationMs("0m")).toBe(0);
  });
});
