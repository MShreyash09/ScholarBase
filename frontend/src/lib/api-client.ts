import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { AuthResponseDto } from "@scholarbase/shared-types";
import { authStorage } from "./auth-storage";

const baseURL = `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"}/api`;

export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  const { data } = await axios.post<AuthResponseDto>(`${baseURL}/auth/refresh`, { refreshToken });
  authStorage.setSession(data.accessToken, data.refreshToken, data.user);
  return data.accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const accessToken = await refreshPromise;
        original.headers.set("Authorization", `Bearer ${accessToken}`);
        return apiClient(original);
      } catch {
        authStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
