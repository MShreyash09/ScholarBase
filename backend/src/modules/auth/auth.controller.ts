import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Req, Res } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Request, Response } from "express";
import {
  AuthResponseDto,
  ForgotPasswordResponseDto,
  ResendVerificationResponseDto,
  SignupResponseDto,
  UserDto,
  VerifyEmailResponseDto,
} from "@scholarbase/shared-types";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { ResendVerificationDto } from "./dto/resend-verification.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  // Returns a message, not a session: the account cannot be used until the
  // emailed confirmation link is opened.
  @Public()
  @Post("signup")
  signup(@Body() dto: SignupDto): Promise<SignupResponseDto> {
    return this.authService.signup(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("login")
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("refresh")
  refresh(@Body() dto: RefreshDto): Promise<AuthResponseDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  // Public and deliberately uniform: the same 200 and the same body come back
  // whether or not the address is registered, so this can't be used to find
  // out who has an account.
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("forgot-password")
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
    await this.authService.forgotPassword(dto.email);
    return {
      message: "If that email has an account, a reset link is on its way.",
    };
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    await this.authService.resetPassword(dto.token, dto.password);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("verify-email")
  verifyEmail(@Body() dto: VerifyEmailDto): Promise<VerifyEmailResponseDto> {
    return this.authService.verifyEmail(dto.token);
  }

  // Uniform response for the same reason forgot-password has one: this must not
  // reveal whether an address is registered, or already confirmed.
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("resend-verification")
  async resendVerification(
    @Body() dto: ResendVerificationDto,
  ): Promise<ResendVerificationResponseDto> {
    await this.authService.resendVerification(dto.email);
    return {
      message: "If that email needs confirming, a new link is on its way.",
    };
  }

  @Public()
  @Get("google")
  @UseGuards(AuthGuard("google"))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Req() req: Request) {}

  @Public()
  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.googleLogin(req.user as { email: string; fullName: string });
    const appUrl = this.config.get<string>("APP_BASE_URL", "http://localhost:5173").replace(/\/$/, "");
    res.redirect(`${appUrl}/auth/google/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post("logout")
  async logout(@Body() dto: RefreshDto): Promise<void> {
    await this.authService.revokeRefreshToken(dto.refreshToken);
  }

  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser): Promise<UserDto> {
    return this.authService.me(user.sub);
  }
}
