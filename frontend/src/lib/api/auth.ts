import type {
  AuthResponseDto,
  LoginRequestDto,
  SignupRequestDto,
  UserDto,
} from "@scholarbase/shared-types";
import { apiClient } from "../api-client";

export const authApi = {
  signup: (body: SignupRequestDto) =>
    apiClient.post<AuthResponseDto>("/auth/signup", body).then((r) => r.data),
  login: (body: LoginRequestDto) =>
    apiClient.post<AuthResponseDto>("/auth/login", body).then((r) => r.data),
  logout: (refreshToken: string) => apiClient.post("/auth/logout", { refreshToken }),
  me: () => apiClient.get<UserDto>("/auth/me").then((r) => r.data),
};
