import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { randomBytes, createHmac } from "crypto";
import { UserRole as PrismaUserRole, User } from "@prisma/client";
import { AuthResponseDto, UserDto, UserRole } from "@scholarbase/shared-types";
import { PrismaService } from "../../prisma/prisma.service";
import { parseDurationMs } from "../../common/utils/duration";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { MailService } from "../mail/mail.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResponseDto> {
    const email = dto.email.toLowerCase().trim();
    const domain = email.split("@")[1];

    const allowed = await this.prisma.allowedEmailDomain.findFirst({
      where: { domain: { equals: domain, mode: "insensitive" } },
    });
    if (!allowed) {
      throw new BadRequestException(
        `Signup is only allowed with a recognized university email domain`,
      );
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: dto.fullName,
        role: PrismaUserRole.student,
      },
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    const tokenHash = this.hashRefreshToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token is invalid or expired");
    }

    const issued = await this.issueTokens(stored.user);

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return issued;
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = this.hashRefreshToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async me(userId: string): Promise<UserDto> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return this.toUserDto(user);
  }

  /**
   * Always resolves the same way, whether or not the address is registered.
   * Returning "no such account" here would turn this endpoint into a directory
   * of who has signed up, so the only observable difference is that an email
   * does or doesn't arrive.
   */
  async forgotPassword(rawEmail: string): Promise<void> {
    const email = rawEmail.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return;

    // Any earlier link becomes dead the moment a new one is requested,
    // so a forwarded older mail can't still be redeemed.
    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = randomBytes(32).toString("hex");
    const ttlMinutes = Number(this.config.get<string>("PASSWORD_RESET_TTL_MINUTES", "60"));

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashResetToken(token),
        expiresAt: new Date(Date.now() + ttlMinutes * 60_000),
      },
    });

    const appUrl = this.config.get<string>("APP_BASE_URL", "http://localhost:5173").replace(/\/$/, "");
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    try {
      await this.mail.sendPasswordReset(user.email, user.fullName, resetUrl, ttlMinutes);
    } catch (err) {
      // Swallowed on purpose: surfacing a delivery failure to the caller would
      // reveal that the address exists. It is logged inside MailService.
      this.logger.error(`Password reset email could not be delivered: ${String(err)}`);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const stored = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: this.hashResetToken(token) },
      include: { user: true },
    });

    if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
      throw new BadRequestException("This reset link is invalid or has expired. Request a new one.");
    }

    const passwordHash = await argon2.hash(newPassword);

    // One transaction so a password can never be changed without also burning
    // the link and cutting existing sessions.
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: stored.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      }),
      // Whoever triggered the reset may have lost control of the account, so
      // every existing session is revoked — otherwise an attacker's refresh
      // token would outlive the password change.
      this.prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  private async issueTokens(user: User): Promise<AuthResponseDto> {
    const role = this.toSharedRole(user.role);

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role },
      {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: this.config.get<string>("JWT_ACCESS_TTL", "15m"),
      },
    );

    const refreshToken = randomBytes(48).toString("hex");
    const refreshTtlMs = parseDurationMs(this.config.get<string>("JWT_REFRESH_TTL", "30d"));

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshTtlMs),
      },
    });

    return { accessToken, refreshToken, user: this.toUserDto(user) };
  }

  private hashRefreshToken(token: string): string {
    const secret = this.config.getOrThrow<string>("JWT_REFRESH_SECRET");
    return createHmac("sha256", secret).update(token).digest("hex");
  }

  /**
   * Reset tokens are stored hashed for the same reason refresh tokens are: a
   * dump of this table should not yield working links. Domain-separated from
   * the refresh hash so the same string can never be valid as both.
   */
  private hashResetToken(token: string): string {
    const secret = this.config.getOrThrow<string>("JWT_REFRESH_SECRET");
    return createHmac("sha256", `password-reset:${secret}`).update(token).digest("hex");
  }

  private toSharedRole(role: PrismaUserRole): UserRole {
    return role === PrismaUserRole.admin ? UserRole.ADMIN : UserRole.STUDENT;
  }

  private toUserDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: this.toSharedRole(user.role),
      createdAt: user.createdAt.toISOString(),
    };
  }
}
