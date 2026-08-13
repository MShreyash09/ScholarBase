/**
 * IT-AUTH — AuthService against a mocked persistence layer.
 *
 * Focus is on the security properties the service claims in its own comments:
 * credential handling, token hashing/domain separation, single-use reset links,
 * and session revocation. Prisma/JWT/Mail are mocked; argon2 and crypto are
 * real so hashing behaviour is genuinely exercised.
 */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { createHmac } from "crypto";
import * as argon2 from "argon2";
import { AuthService } from "../../src/modules/auth/auth.service";
import { PrismaService } from "../../src/prisma/prisma.service";
import { MailService } from "../../src/modules/mail/mail.service";

const REFRESH_SECRET = "test_refresh_secret";

const CONFIG: Record<string, string> = {
  JWT_ACCESS_SECRET: "test_access_secret",
  JWT_REFRESH_SECRET: REFRESH_SECRET,
  JWT_ACCESS_TTL: "15m",
  JWT_REFRESH_TTL: "30d",
  PASSWORD_RESET_TTL_MINUTES: "60",
  APP_BASE_URL: "http://localhost:5173",
};

function makeDeps() {
  const prisma = {
    allowedEmailDomain: { findFirst: jest.fn() },
    user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), findUniqueOrThrow: jest.fn() },
    refreshToken: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    passwordResetToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    emailVerificationToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn().mockResolvedValue([]),
  } as unknown as PrismaService;

  const jwt = { signAsync: jest.fn().mockResolvedValue("signed.jwt.token") } as unknown as JwtService;

  const config = {
    get: (k: string, d?: string) => CONFIG[k] ?? d,
    getOrThrow: (k: string) => {
      if (!CONFIG[k]) throw new Error(`missing ${k}`);
      return CONFIG[k];
    },
  } as unknown as ConfigService;

  const mail = {
    sendPasswordReset: jest.fn().mockResolvedValue(undefined),
    sendEmailVerification: jest.fn().mockResolvedValue(undefined),
  } as unknown as MailService;

  return { prisma, jwt, config, mail, service: new AuthService(prisma, jwt, config, mail) };
}

const USER = {
  id: "user-1",
  email: "student@youruniversity.edu.in",
  fullName: "A Student",
  role: "student",
  passwordHash: "",
  // Verified by default — login refuses unverified accounts, so the unverified
  // case is opted into explicitly by the tests that exercise that gate.
  emailVerifiedAt: new Date("2026-01-02T00:00:00Z"),
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

describe("IT-AUTH signup", () => {
  it("IT-AUTH-001: rejects an email outside the allowed university domains", async () => {
    const { service, prisma } = makeDeps();
    (prisma.allowedEmailDomain.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      service.signup({ email: "outsider@gmail.com", password: "12345678", fullName: "X" }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("IT-AUTH-002: rejects a duplicate account with 409 rather than overwriting", async () => {
    const { service, prisma } = makeDeps();
    (prisma.allowedEmailDomain.findFirst as jest.Mock).mockResolvedValue({ domain: "youruniversity.edu.in" });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(USER);

    await expect(
      service.signup({ email: USER.email, password: "12345678", fullName: "X" }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("IT-AUTH-003: stores an argon2 hash, never the plaintext password", async () => {
    const { service, prisma } = makeDeps();
    (prisma.allowedEmailDomain.findFirst as jest.Mock).mockResolvedValue({ domain: "youruniversity.edu.in" });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({ ...USER, passwordHash: "h", emailVerifiedAt: null });

    const plaintext = "SuperSecret123";
    await service.signup({ email: USER.email, password: plaintext, fullName: "X" });

    const written = (prisma.user.create as jest.Mock).mock.calls[0][0].data;
    expect(written.passwordHash).not.toBe(plaintext);
    expect(written.passwordHash.startsWith("$argon2")).toBe(true);
    expect(await argon2.verify(written.passwordHash, plaintext)).toBe(true);
    // The role must be forced to student — never taken from client input.
    expect(written.role).toBe("student");
  });

  it("IT-AUTH-004: normalizes the email to lowercase before persisting", async () => {
    const { service, prisma } = makeDeps();
    (prisma.allowedEmailDomain.findFirst as jest.Mock).mockResolvedValue({ domain: "youruniversity.edu.in" });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({ ...USER, emailVerifiedAt: null });

    await service.signup({ email: "  STUDENT@YourUniversity.edu.in ", password: "12345678", fullName: "X" });

    expect((prisma.user.create as jest.Mock).mock.calls[0][0].data.email).toBe(
      "student@youruniversity.edu.in",
    );
  });

  it("IT-AUTH-025: issues NO session at signup — the account is unusable until confirmed", async () => {
    const { service, prisma, mail } = makeDeps();
    (prisma.allowedEmailDomain.findFirst as jest.Mock).mockResolvedValue({ domain: "youruniversity.edu.in" });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({ ...USER, emailVerifiedAt: null });

    const res = await service.signup({ email: USER.email, password: "12345678", fullName: "X" });

    expect(res).toEqual({ message: expect.any(String) });
    expect(res).not.toHaveProperty("accessToken");
    expect(res).not.toHaveProperty("refreshToken");
    // No refresh token row, and the account is left unverified.
    expect(prisma.refreshToken.create).not.toHaveBeenCalled();
    expect((prisma.user.create as jest.Mock).mock.calls[0][0].data.emailVerifiedAt).toBeUndefined();
    expect(mail.sendEmailVerification).toHaveBeenCalledTimes(1);
  });

  it("IT-AUTH-026: the confirmation link mailed at signup is a hash-stored single-use token", async () => {
    const { service, prisma, mail } = makeDeps();
    (prisma.allowedEmailDomain.findFirst as jest.Mock).mockResolvedValue({ domain: "youruniversity.edu.in" });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({ ...USER, emailVerifiedAt: null });

    await service.signup({ email: USER.email, password: "12345678", fullName: "X" });

    const verifyUrl = (mail.sendEmailVerification as jest.Mock).mock.calls[0][2] as string;
    const rawToken = new URL(verifyUrl).searchParams.get("token")!;
    const storedHash = (prisma.emailVerificationToken.create as jest.Mock).mock.calls[0][0].data
      .tokenHash;

    expect(verifyUrl).toContain("/verify-email?token=");
    expect(rawToken).toMatch(/^[a-f0-9]{64}$/);
    expect(storedHash).not.toBe(rawToken);
  });

  it("IT-AUTH-027: verification hash is domain-separated from BOTH the refresh and reset hashes", async () => {
    const { service, prisma, mail } = makeDeps();
    (prisma.allowedEmailDomain.findFirst as jest.Mock).mockResolvedValue({ domain: "youruniversity.edu.in" });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({ ...USER, emailVerifiedAt: null });

    await service.signup({ email: USER.email, password: "12345678", fullName: "X" });

    const verifyUrl = (mail.sendEmailVerification as jest.Mock).mock.calls[0][2] as string;
    const rawToken = new URL(verifyUrl).searchParams.get("token")!;
    const storedHash = (prisma.emailVerificationToken.create as jest.Mock).mock.calls[0][0].data
      .tokenHash;

    const plainHmac = createHmac("sha256", REFRESH_SECRET).update(rawToken).digest("hex");
    const resetHmac = createHmac("sha256", `password-reset:${REFRESH_SECRET}`)
      .update(rawToken)
      .digest("hex");
    const verifyHmac = createHmac("sha256", `email-verification:${REFRESH_SECRET}`)
      .update(rawToken)
      .digest("hex");

    expect(storedHash).toBe(verifyHmac);
    expect(storedHash).not.toBe(plainHmac);
    expect(storedHash).not.toBe(resetHmac);
  });
});

describe("IT-AUTH login", () => {
  it("IT-AUTH-005: returns an identical generic error for unknown user and wrong password", async () => {
    const { service, prisma } = makeDeps();

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const unknownErr = await service.login({ email: "nobody@x.com", password: "p" }).catch((e) => e);

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...USER,
      passwordHash: await argon2.hash("the-real-password"),
    });
    const wrongPwErr = await service.login({ email: USER.email, password: "wrong" }).catch((e) => e);

    expect(unknownErr).toBeInstanceOf(UnauthorizedException);
    expect(wrongPwErr).toBeInstanceOf(UnauthorizedException);
    // Identical wording is what prevents account enumeration via login.
    expect(unknownErr.message).toBe(wrongPwErr.message);
    expect(unknownErr.message).toBe("Invalid email or password");
  });

  it("IT-AUTH-006: issues tokens and never returns the password hash to the client", async () => {
    const { service, prisma } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...USER,
      passwordHash: await argon2.hash("pw12345678"),
    });

    const res = await service.login({ email: USER.email, password: "pw12345678" });

    expect(res.accessToken).toBeTruthy();
    expect(res.refreshToken).toBeTruthy();
    expect(JSON.stringify(res)).not.toContain("$argon2");
    expect(Object.keys(res.user).sort()).toEqual([
      "createdAt",
      "email",
      "emailVerifiedAt",
      "fullName",
      "id",
      "role",
    ]);
  });

  it("IT-AUTH-007: persists only an HMAC of the refresh token, never the raw value", async () => {
    const { service, prisma } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...USER,
      passwordHash: await argon2.hash("pw12345678"),
    });

    const res = await service.login({ email: USER.email, password: "pw12345678" });
    const stored = (prisma.refreshToken.create as jest.Mock).mock.calls[0][0].data;

    expect(stored.tokenHash).not.toBe(res.refreshToken);
    expect(stored.tokenHash).toBe(
      createHmac("sha256", REFRESH_SECRET).update(res.refreshToken).digest("hex"),
    );
  });
});

describe("IT-AUTH email verification gate", () => {
  it("IT-AUTH-028: login is refused with 403 while the address is unconfirmed", async () => {
    const { service, prisma } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...USER,
      emailVerifiedAt: null,
      passwordHash: await argon2.hash("pw12345678"),
    });

    const err = await service.login({ email: USER.email, password: "pw12345678" }).catch((e) => e);

    // 403 not 401: the frontend interceptor swallows 401s as expired sessions.
    expect(err).toBeInstanceOf(ForbiddenException);
    expect(err.message).toMatch(/confirm your email/i);
    // Crucially, no session is handed out.
    expect(prisma.refreshToken.create).not.toHaveBeenCalled();
  });

  it("IT-AUTH-029: the gate runs only after the password check, so it can't confirm an account for free", async () => {
    const { service, prisma } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...USER,
      emailVerifiedAt: null,
      passwordHash: await argon2.hash("pw12345678"),
    });

    // Wrong password against an unverified account must still look like any
    // other bad credential, not reveal that the account exists but is pending.
    const err = await service.login({ email: USER.email, password: "wrong" }).catch((e) => e);
    expect(err).toBeInstanceOf(UnauthorizedException);
    expect(err.message).toBe("Invalid email or password");
  });

  it("IT-AUTH-030: login succeeds once the address is confirmed", async () => {
    const { service, prisma } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...USER,
      passwordHash: await argon2.hash("pw12345678"),
    });

    const res = await service.login({ email: USER.email, password: "pw12345678" });
    expect(res.accessToken).toBeTruthy();
    expect(res.user.emailVerifiedAt).toBe("2026-01-02T00:00:00.000Z");
  });

  it("IT-AUTH-031: verifyEmail marks the account verified and burns the token atomically", async () => {
    const { service, prisma } = makeDeps();
    (prisma.emailVerificationToken.findUnique as jest.Mock).mockResolvedValue({
      id: "v1",
      userId: USER.id,
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: { ...USER, emailVerifiedAt: null },
    });

    await service.verifyEmail("valid-token");

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: USER.id },
      data: { emailVerifiedAt: expect.any(Date) },
    });
    expect(prisma.emailVerificationToken.update).toHaveBeenCalledWith({
      where: { id: "v1" },
      data: { usedAt: expect.any(Date) },
    });
  });

  it("IT-AUTH-032: an unknown or expired confirmation token is rejected with one generic message", async () => {
    const { service, prisma } = makeDeps();
    const messages: string[] = [];

    for (const row of [
      null,
      {
        id: "v1",
        userId: USER.id,
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 1000),
        user: { ...USER, emailVerifiedAt: null },
      },
      {
        id: "v1",
        userId: USER.id,
        usedAt: null,
        expiresAt: new Date(Date.now() - 1000),
        user: { ...USER, emailVerifiedAt: null },
      },
    ]) {
      (prisma.emailVerificationToken.findUnique as jest.Mock).mockResolvedValue(row);
      messages.push(await service.verifyEmail("t").catch((e) => e.message));
    }

    expect(new Set(messages).size).toBe(1);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("IT-AUTH-033: re-opening a spent link for an already-verified account succeeds instead of erroring", async () => {
    const { service, prisma } = makeDeps();
    (prisma.emailVerificationToken.findUnique as jest.Mock).mockResolvedValue({
      id: "v1",
      userId: USER.id,
      usedAt: new Date(),
      expiresAt: new Date(Date.now() - 1000),
      user: USER, // already verified
    });

    // A double click or a mail-client prefetch must not look like a failure.
    await expect(service.verifyEmail("spent")).resolves.toEqual({
      message: expect.stringMatching(/already confirmed/i),
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("IT-AUTH-034: resendVerification is silent for unknown and already-verified addresses", async () => {
    const { service, prisma, mail } = makeDeps();

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.resendVerification("ghost@x.com")).resolves.toBeUndefined();

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(USER); // verified
    await expect(service.resendVerification(USER.email)).resolves.toBeUndefined();

    expect(mail.sendEmailVerification).not.toHaveBeenCalled();
    expect(prisma.emailVerificationToken.create).not.toHaveBeenCalled();
  });

  it("IT-AUTH-035: resendVerification issues a fresh link and kills the previous one", async () => {
    const { service, prisma, mail } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...USER, emailVerifiedAt: null });

    await service.resendVerification(USER.email);

    expect(prisma.emailVerificationToken.updateMany).toHaveBeenCalledWith({
      where: { userId: USER.id, usedAt: null },
      data: { usedAt: expect.any(Date) },
    });
    expect(mail.sendEmailVerification).toHaveBeenCalledTimes(1);
  });

  it("IT-AUTH-036: a mail failure during signup does not fail the signup itself", async () => {
    const { service, prisma, mail } = makeDeps();
    (prisma.allowedEmailDomain.findFirst as jest.Mock).mockResolvedValue({ domain: "youruniversity.edu.in" });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({ ...USER, emailVerifiedAt: null });
    (mail.sendEmailVerification as jest.Mock).mockRejectedValue(new Error("Brevo down"));

    // The account and token still exist; the user can ask for a resend.
    await expect(
      service.signup({ email: USER.email, password: "12345678", fullName: "X" }),
    ).resolves.toEqual({ message: expect.any(String) });
    expect(prisma.emailVerificationToken.create).toHaveBeenCalled();
  });
});

describe("IT-AUTH refresh", () => {
  it("IT-AUTH-008: rejects an expired refresh token", async () => {
    const { service, prisma } = makeDeps();
    (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue({
      id: "rt1",
      expiresAt: new Date(Date.now() - 1000),
      user: USER,
    });

    await expect(service.refresh("whatever")).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("IT-AUTH-009: rejects an unknown/revoked refresh token", async () => {
    const { service, prisma } = makeDeps();
    (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(service.refresh("revoked")).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("IT-AUTH-010: rotates the token — the presented one is revoked after use", async () => {
    const { service, prisma } = makeDeps();
    (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue({
      id: "rt1",
      expiresAt: new Date(Date.now() + 60_000),
      user: { ...USER, passwordHash: "h" },
    });

    await service.refresh("valid-token");

    expect(prisma.refreshToken.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "rt1" }, data: { revokedAt: expect.any(Date) } }),
    );
  });
});

describe("IT-AUTH forgot password", () => {
  it("IT-AUTH-011: resolves silently for an unregistered address (no enumeration via response)", async () => {
    const { service, prisma, mail } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.forgotPassword("ghost@x.com")).resolves.toBeUndefined();
    expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
    expect(mail.sendPasswordReset).not.toHaveBeenCalled();
  });

  it("IT-AUTH-012: invalidates any outstanding reset link before issuing a new one", async () => {
    const { service, prisma } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(USER);

    await service.forgotPassword(USER.email);

    expect(prisma.passwordResetToken.updateMany).toHaveBeenCalledWith({
      where: { userId: USER.id, usedAt: null },
      data: { usedAt: expect.any(Date) },
    });
  });

  it("IT-AUTH-013: stores only a hash of the reset token; the raw token goes to email only", async () => {
    const { service, prisma, mail } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(USER);

    await service.forgotPassword(USER.email);

    const resetUrl = (mail.sendPasswordReset as jest.Mock).mock.calls[0][2] as string;
    const rawToken = new URL(resetUrl).searchParams.get("token")!;
    const storedHash = (prisma.passwordResetToken.create as jest.Mock).mock.calls[0][0].data.tokenHash;

    expect(rawToken).toMatch(/^[a-f0-9]{64}$/); // 32 random bytes, hex
    expect(storedHash).not.toBe(rawToken);
  });

  it("IT-AUTH-014: reset-token hash is domain-separated from the refresh-token hash", async () => {
    const { service, prisma, mail } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(USER);

    await service.forgotPassword(USER.email);

    const resetUrl = (mail.sendPasswordReset as jest.Mock).mock.calls[0][2] as string;
    const rawToken = new URL(resetUrl).searchParams.get("token")!;
    const storedHash = (prisma.passwordResetToken.create as jest.Mock).mock.calls[0][0].data.tokenHash;

    const plainHmac = createHmac("sha256", REFRESH_SECRET).update(rawToken).digest("hex");
    const domainSeparated = createHmac("sha256", `password-reset:${REFRESH_SECRET}`)
      .update(rawToken)
      .digest("hex");

    // The same string must never be valid as both a reset and a refresh token.
    expect(storedHash).toBe(domainSeparated);
    expect(storedHash).not.toBe(plainHmac);
  });

  it("IT-AUTH-015: honours the configured TTL when setting expiry", async () => {
    const { service, prisma } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(USER);

    const before = Date.now();
    await service.forgotPassword(USER.email);
    const { expiresAt } = (prisma.passwordResetToken.create as jest.Mock).mock.calls[0][0].data;

    const deltaMin = (expiresAt.getTime() - before) / 60_000;
    expect(deltaMin).toBeGreaterThan(59);
    expect(deltaMin).toBeLessThanOrEqual(60.1);
  });

  it("IT-AUTH-016: a mail delivery failure does not surface to the caller", async () => {
    const { service, prisma, mail } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(USER);
    (mail.sendPasswordReset as jest.Mock).mockRejectedValue(new Error("SMTP down"));

    await expect(service.forgotPassword(USER.email)).resolves.toBeUndefined();
  });

  it("IT-AUTH-017: SECURITY — a DB failure DOES surface, creating a 500-vs-200 enumeration oracle", async () => {
    const { service, prisma } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(USER);
    (prisma.passwordResetToken.updateMany as jest.Mock).mockRejectedValue(new Error("DB unavailable"));

    // Registered address -> error escapes -> 500.
    await expect(service.forgotPassword(USER.email)).rejects.toThrow("DB unavailable");

    // Unregistered address under the identical fault -> clean 200.
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.forgotPassword("ghost@x.com")).resolves.toBeUndefined();
  });

  it("IT-AUTH-018: SECURITY — the registered path performs strictly more awaited work (timing oracle)", async () => {
    const { service, prisma, mail } = makeDeps();

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    await service.forgotPassword("ghost@x.com");
    const unregisteredCalls =
      (prisma.passwordResetToken.updateMany as jest.Mock).mock.calls.length +
      (prisma.passwordResetToken.create as jest.Mock).mock.calls.length +
      (mail.sendPasswordReset as jest.Mock).mock.calls.length;

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(USER);
    await service.forgotPassword(USER.email);
    const registeredCalls =
      (prisma.passwordResetToken.updateMany as jest.Mock).mock.calls.length +
      (prisma.passwordResetToken.create as jest.Mock).mock.calls.length +
      (mail.sendPasswordReset as jest.Mock).mock.calls.length;

    expect(unregisteredCalls).toBe(0);
    expect(registeredCalls).toBe(3); // 2 DB writes + 1 outbound HTTP send
  });
});

describe("IT-AUTH reset password", () => {
  it("IT-AUTH-019: rejects an unknown token", async () => {
    const { service, prisma } = makeDeps();
    (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.resetPassword("bogus", "newpassword")).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("IT-AUTH-020: rejects an already-used token (single use enforced)", async () => {
    const { service, prisma } = makeDeps();
    (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue({
      id: "t1",
      userId: USER.id,
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    });

    await expect(service.resetPassword("used", "newpassword")).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("IT-AUTH-021: rejects an expired token", async () => {
    const { service, prisma } = makeDeps();
    (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue({
      id: "t1",
      userId: USER.id,
      usedAt: null,
      expiresAt: new Date(Date.now() - 1),
    });

    await expect(service.resetPassword("expired", "newpassword")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("IT-AUTH-022: gives the same generic message for unknown, used and expired tokens", async () => {
    const { service, prisma } = makeDeps();
    const messages: string[] = [];

    for (const row of [
      null,
      { id: "t", userId: "u", usedAt: new Date(), expiresAt: new Date(Date.now() + 1000) },
      { id: "t", userId: "u", usedAt: null, expiresAt: new Date(Date.now() - 1000) },
    ]) {
      (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue(row);
      messages.push(await service.resetPassword("t", "newpassword").catch((e) => e.message));
    }

    expect(new Set(messages).size).toBe(1);
  });

  it("IT-AUTH-023: on success, burns the token and revokes every live session atomically", async () => {
    const { service, prisma } = makeDeps();
    (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue({
      id: "t1",
      userId: USER.id,
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: USER,
    });

    await service.resetPassword("valid", "brand-new-password");

    // All three writes must go through a single $transaction call.
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.user.update).toHaveBeenCalled();
    expect(prisma.passwordResetToken.update).toHaveBeenCalledWith({
      where: { id: "t1" },
      data: { usedAt: expect.any(Date) },
    });
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: USER.id, revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it("IT-AUTH-024: the new password is argon2-hashed before it reaches the database", async () => {
    const { service, prisma } = makeDeps();
    (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue({
      id: "t1",
      userId: USER.id,
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: USER,
    });

    await service.resetPassword("valid", "brand-new-password");

    const { passwordHash } = (prisma.user.update as jest.Mock).mock.calls[0][0].data;
    expect(passwordHash.startsWith("$argon2")).toBe(true);
    expect(await argon2.verify(passwordHash, "brand-new-password")).toBe(true);
  });
});
