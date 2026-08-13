/**
 * UT-DTO — Request DTO validation and transformation
 *
 * These DTOs are the app's input-validation boundary: main.ts registers a
 * global ValidationPipe with whitelist + forbidNonWhitelisted, so whatever
 * these classes declare is exactly what the API will accept. Treated here as a
 * security control, not just ergonomics.
 */
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { MIN_PASSWORD_LENGTH } from "@scholarbase/shared-types";
import { SignupDto } from "../../src/modules/auth/dto/signup.dto";
import { LoginDto } from "../../src/modules/auth/dto/login.dto";
import { ForgotPasswordDto } from "../../src/modules/auth/dto/forgot-password.dto";
import { ResetPasswordDto } from "../../src/modules/auth/dto/reset-password.dto";
import { FindPapersQueryDto } from "../../src/modules/papers/dto/find-papers-query.dto";
import { FindMessagesQueryDto } from "../../src/modules/study-rooms/dto/find-messages-query.dto";
import { CreateQuestionPaperBodyDto } from "../../src/modules/papers/dto/create-question-paper.dto";

/** Returns the set of failing property names for a plain input. */
async function failingProps<T extends object>(
  cls: new () => T,
  plain: Record<string, unknown>,
): Promise<string[]> {
  const instance = plainToInstance(cls, plain);
  const errors = await validate(instance as object);
  return errors.map((e) => e.property).sort();
}

describe("UT-DTO SignupDto", () => {
  it("UT-DTO-001: normalizes email to trimmed lowercase before validation", () => {
    const dto = plainToInstance(SignupDto, {
      email: "  Student@YourUniversity.EDU.in  ",
      password: "correct horse battery",
      fullName: "A Student",
    });
    expect(dto.email).toBe("student@youruniversity.edu.in");
  });

  it("UT-DTO-002: rejects malformed email addresses", async () => {
    for (const email of ["not-an-email", "a@", "@b.com", "a b@c.com", ""]) {
      const props = await failingProps(SignupDto, {
        email,
        password: "correct horse battery",
        fullName: "A Student",
      });
      expect(props).toContain("email");
    }
  });

  it("UT-DTO-003: enforces a minimum password length", async () => {
    const short = await failingProps(SignupDto, {
      email: "a@b.com",
      password: "1234567",
      fullName: "A",
    });
    expect(short).toContain("password");

    const ok = await failingProps(SignupDto, {
      email: "a@b.com",
      password: "12345678",
      fullName: "A",
    });
    expect(ok).not.toContain("password");
  });

  it("UT-DTO-004: rejects an empty full name", async () => {
    const props = await failingProps(SignupDto, {
      email: "a@b.com",
      password: "12345678",
      fullName: "",
    });
    expect(props).toContain("fullName");
  });

  it("UT-DTO-005: signup's password floor agrees with the shared MIN_PASSWORD_LENGTH constant", async () => {
    // Signup hardcodes MinLength(8) while the reset form uses the shared
    // constant. This test fails loudly if the two ever drift apart.
    const atConstant = await failingProps(SignupDto, {
      email: "a@b.com",
      password: "x".repeat(MIN_PASSWORD_LENGTH),
      fullName: "A",
    });
    expect(atConstant).not.toContain("password");

    const belowConstant = await failingProps(SignupDto, {
      email: "a@b.com",
      password: "x".repeat(MIN_PASSWORD_LENGTH - 1),
      fullName: "A",
    });
    expect(belowConstant).toContain("password");
  });

  it("UT-DTO-006: does not enforce any password complexity (documents current policy)", async () => {
    // Length is the only rule — "password" and "12345678" are accepted.
    const props = await failingProps(SignupDto, {
      email: "a@b.com",
      password: "12345678",
      fullName: "A",
    });
    expect(props).not.toContain("password");
  });
});

describe("UT-DTO LoginDto", () => {
  it("UT-DTO-007: normalizes email so login is case-insensitive", () => {
    const dto = plainToInstance(LoginDto, { email: " ADMIN@X.COM ", password: "p" });
    expect(dto.email).toBe("admin@x.com");
  });
});

describe("UT-DTO password reset DTOs", () => {
  it("UT-DTO-008: ForgotPasswordDto requires a valid email", async () => {
    expect(await failingProps(ForgotPasswordDto, { email: "nope" })).toContain("email");
    expect(await failingProps(ForgotPasswordDto, { email: "a@b.com" })).toHaveLength(0);
  });

  it("UT-DTO-009: ResetPasswordDto rejects an empty token", async () => {
    const props = await failingProps(ResetPasswordDto, {
      token: "",
      password: "x".repeat(MIN_PASSWORD_LENGTH),
    });
    expect(props).toContain("token");
  });

  it("UT-DTO-010: ResetPasswordDto enforces MIN_PASSWORD_LENGTH", async () => {
    const props = await failingProps(ResetPasswordDto, {
      token: "abc",
      password: "x".repeat(MIN_PASSWORD_LENGTH - 1),
    });
    expect(props).toContain("password");
  });

  it("UT-DTO-011: ForgotPasswordDto does not normalize case (asymmetry with login/signup)", () => {
    // Signup and Login carry @Transform; ForgotPassword does not. The service
    // lowercases defensively, so this is currently compensated for downstream.
    const dto = plainToInstance(ForgotPasswordDto, { email: "  MiXeD@Case.com " });
    expect(dto.email).toBe("  MiXeD@Case.com ");
  });
});

describe("UT-DTO query DTOs", () => {
  it("UT-DTO-012: coerces a numeric query string to a number", async () => {
    const dto = plainToInstance(FindPapersQueryDto, { academicYear: "2026" });
    expect(dto.academicYear).toBe(2026);
    expect(await validate(dto)).toHaveLength(0);
  });

  it("UT-DTO-013: treats an empty query value as absent rather than 0", async () => {
    const dto = plainToInstance(FindPapersQueryDto, { academicYear: "" });
    expect(dto.academicYear).toBeUndefined();
    expect(await validate(dto)).toHaveLength(0);
  });

  it("UT-DTO-014: rejects a non-numeric year instead of silently filtering by NaN", async () => {
    const dto = plainToInstance(FindPapersQueryDto, { academicYear: "abc" });
    const errors = await validate(dto);
    expect(errors.map((e) => e.property)).toContain("academicYear");
  });

  it("UT-DTO-015: rejects a non-UUID subjectId (prevents raw values reaching Prisma)", async () => {
    const props = await failingProps(FindPapersQueryDto, { subjectId: "1 OR 1=1" });
    expect(props).toContain("subjectId");
  });

  it("UT-DTO-016: enforces message limit boundaries 1..200", async () => {
    expect(await failingProps(FindMessagesQueryDto, { limit: "1" })).toHaveLength(0);
    expect(await failingProps(FindMessagesQueryDto, { limit: "200" })).toHaveLength(0);
    expect(await failingProps(FindMessagesQueryDto, { limit: "201" })).toContain("limit");
    // "0" is truthy-string -> Number("0") === 0 -> fails @Min(1) as intended.
    expect(await failingProps(FindMessagesQueryDto, { limit: "0" })).toContain("limit");
  });

  it("UT-DTO-017: enforces academic-year sanity bounds on upload", async () => {
    const base = {
      subjectId: "3f7c1e2a-0b5d-4c6e-9a1b-2c3d4e5f6a7b",
      examTypeId: "4f7c1e2a-0b5d-4c6e-9a1b-2c3d4e5f6a7b",
    };
    expect(await failingProps(CreateQuestionPaperBodyDto, { ...base, academicYear: "1999" })).toContain(
      "academicYear",
    );
    expect(await failingProps(CreateQuestionPaperBodyDto, { ...base, academicYear: "2101" })).toContain(
      "academicYear",
    );
    expect(
      await failingProps(CreateQuestionPaperBodyDto, { ...base, academicYear: "2026" }),
    ).toHaveLength(0);
  });
});
