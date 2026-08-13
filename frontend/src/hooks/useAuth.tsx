import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
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
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(() => authStorage.getUser());

  const login = async (body: LoginRequestDto) => {
    const res = await authApi.login(body);
    authStorage.setSession(res.accessToken, res.refreshToken, res.user);
    setUser(res.user);
    // Server responses are auth-dependent — question papers come back with a
    // `locked` flag that differs for visitors and students — and the client
    // caches them for 30s. Without this, a student who just logged in keeps
    // seeing the locked view they were served moments earlier.
    queryClient.clear();
  };

  const signup = async (body: SignupRequestDto) => {
    // No setSession/setUser: signup issues no tokens now.
    return authApi.signup(body);
  };

  const logout = async () => {
    const refreshToken = authStorage.getRefreshToken();
    authStorage.clear();
    setUser(null);
    // Drop every cached response too, or the signed-out user keeps being shown
    // unlocked papers (and any other data fetched while authenticated) until
    // the cache goes stale.
    queryClient.clear();
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => undefined);
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isAdmin: user?.role === UserRole.ADMIN,
      login,
      signup,
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
