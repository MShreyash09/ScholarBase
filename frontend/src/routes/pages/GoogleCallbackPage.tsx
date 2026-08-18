import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api/auth";

export function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSessionFromOAuth } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (!accessToken || !refreshToken) {
      navigate("/login", { replace: true });
      return;
    }

    // Since we need the user profile to set the session fully, we fetch it first.
    // The tokens are set temporarily for the authApi to use them.
    const fetchUserAndSetSession = async () => {
      try {
        // Temporarily store in localStorage just to make the `/auth/me` request work
        // Alternatively, since authApi uses axios interceptors that read from authStorage,
        // we can set the session with a dummy user first, then update it.
        // Or we can just pass the token in headers manually for this single request.
        
        // Easiest is to set with a dummy user, fetch real user, and update.
        setSessionFromOAuth(accessToken, refreshToken, {} as any);
        const user = await authApi.me();
        setSessionFromOAuth(accessToken, refreshToken, user);
        
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Failed to fetch user during Google OAuth callback", err);
        navigate("/login", { replace: true });
      }
    };

    fetchUserAndSetSession();
  }, [searchParams, navigate, setSessionFromOAuth]);

  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-foreground-muted">Completing log in...</p>
    </div>
  );
}
