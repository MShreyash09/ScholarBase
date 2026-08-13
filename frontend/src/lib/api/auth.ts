import type {
  AuthResponseDto,
  ForgotPasswordResponseDto,
  LoginRequestDto,
  ResendVerificationResponseDto,
  SignupRequestDto,
  SignupResponseDto,
  UserDto,
  VerifyEmailResponseDto,
} from "@scholarbase/shared-types";
import { apiClient } from "../api-client";

export const authApi = {
  // Returns a message, not a session — the account is unusable until the
  // emailed confirmation link is opened.
  signup: (body: SignupRequestDto) =>
    apiClient.post<SignupResponseDto>("/auth/signup", body).then((r) => r.data),
  login: (body: LoginRequestDto) =>
    apiClient.post<AuthResponseDto>("/auth/login", body).then((r) => r.data),
  logout: (refreshToken: string) => apiClient.post("/auth/logout", { refreshToken }),
  me: () => apiClient.get<UserDto>("/auth/me").then((r) => r.data),
  forgotPassword: (email: string) =>
    apiClient
      .post<ForgotPasswordResponseDto>("/auth/forgot-password", { email })
      .then((r) => r.data),
  resetPassword: (token: string, password: string) =>
    apiClient.post("/auth/reset-password", { token, password }),
  verifyEmail: (token: string) =>
    apiClient.post<VerifyEmailResponseDto>("/auth/verify-email", { token }).then((r) => r.data),
  resendVerification: (email: string) =>
    apiClient
      .post<ResendVerificationResponseDto>("/auth/resend-verification", { email })
      .then((r) => r.data),
};
