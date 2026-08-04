import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { UserRole, type LoginRequestDto, type SignupRequestDto, type UserDto } from "@scholarbase/shared-types";
import { authApi } from "@/lib/api/auth";
import { authStorage } from "@/lib/auth-storage";

interface AuthContextValue {
  user: UserDto | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (body: LoginRequestDto) => Promise<void>;
  signup: (body: SignupRequestDto) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(() => authStorage.getUser());

  const login = async (body: LoginRequestDto) => {
    const res = await authApi.login(body);
    authStorage.setSession(res.accessToken, res.refreshToken, res.user);
    setUser(res.user);
  };

  const signup = async (body: SignupRequestDto) => {
    const res = await authApi.signup(body);
    authStorage.setSession(res.accessToken, res.refreshToken, res.user);
    setUser(res.user);
  };

  const logout = async () => {
    const refreshToken = authStorage.getRefreshToken();
    authStorage.clear();
    setUser(null);
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
