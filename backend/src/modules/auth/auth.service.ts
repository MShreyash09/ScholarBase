import {
  BadRequestException,
  ConflictException,
  Injectable,
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

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
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
