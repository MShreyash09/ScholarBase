import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from "react";
import {
  UserRole,
  type LoginRequestDto,
  type SignupRequestDto,
  type SignupResponseDto,
  type UserDto,
} from "@scholarbase/shared-types";
import { authApi } from "@/lib/api/auth";
import { authStorage } from "@/lib/auth-storage";
import { queryClient } from "@/lib/query-client";

interface AuthContextValue {
  user: UserDto | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (body: LoginRequestDto) => Promise<void>;
  /**
   * Resolves with the server's confirmation message. Unlike login this does NOT
   * establish a session — the account stays unusable until the emailed link is
   * opened — so there is nothing to store here.
   */
  signup: (body: SignupRequestDto) => Promise<SignupResponseDto>;
  setSessionFromOAuth: (accessToken: string, refreshToken: string, user: UserDto) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(() => authStorage.getUser());

  const login = useCallback(async (body: LoginRequestDto) => {
    const res = await authApi.login(body);
    authStorage.setSession(res.accessToken, res.refreshToken, res.user);
    setUser(res.user);
    queryClient.clear();
  }, []);

  const signup = useCallback(async (body: SignupRequestDto) => {
    return authApi.signup(body);
  }, []);

  const setSessionFromOAuth = useCallback((accessToken: string, refreshToken: string, userDto: UserDto) => {
    authStorage.setSession(accessToken, refreshToken, userDto);
    setUser(userDto);
    queryClient.clear();
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = authStorage.getRefreshToken();
    authStorage.clear();
    setUser(null);
    queryClient.clear();
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => undefined);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isAdmin: user?.role === UserRole.ADMIN,
      login,
      signup,
      setSessionFromOAuth,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
