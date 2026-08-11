import { UserRole } from "./enums";

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export interface SignupRequestDto {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseDto extends AuthTokensDto {
  user: UserDto;
}

export interface RefreshRequestDto {
  refreshToken: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  token: string;
  password: string;
}

/**
 * Deliberately says nothing about whether the address exists. Both the "we
 * sent it" and "no such account" cases return this identical shape, so the
 * endpoint can't be used to enumerate which students have registered.
 */
export interface ForgotPasswordResponseDto {
  message: string;
}

/** Shortest password the reset form will accept — mirrors signup. */
export const MIN_PASSWORD_LENGTH = 8;
