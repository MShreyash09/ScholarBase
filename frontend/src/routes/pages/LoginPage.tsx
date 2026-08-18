import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUnverified, setIsUnverified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUnverified(false);
    setIsSubmitting(true);

    // No domain check here on purpose. The allowlist governs who may *register*
    // — it is enforced server-side at signup against allowed_email_domains. A
    // login only ever concerns an account that already passed that check, so
    // re-applying a hardcoded domain here does nothing for security and locks
    // out any account outside it: notably the seeded admin
    // (admin@youruniversity.edu.in), who would then be unable to reach the
    // upload panel at all.
    try {
      await login({ email, password });
      const from = (location.state as { from?: Location })?.from?.pathname ?? "/";
      navigate(from, { replace: true });
    } catch (err) {
      const res = (err as { response?: { status?: number; data?: { message?: string } } })?.response;
      // 403 is the unconfirmed-account gate, and its message is actionable, so
      // it is shown verbatim. Everything else stays deliberately generic so a
      // wrong password can't be told apart from an address that isn't
      // registered.
      if (res?.status === 403) {
        setIsUnverified(true);
        setError(res.data?.message ?? "Confirm your email before logging in.");
      } else {
        setError("Invalid email or password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>Welcome back — pick up where you left off.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button asChild variant="outline" className="w-full">
              <a href={`${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"}/api/auth/google`}>
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Continue with Google
              </a>
            </Button>
            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-foreground-muted">Or continue with email</span>
              </div>
            </div>
          </div>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="username@mmcoe.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Field
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="-mt-1 text-right">
              <Link to="/forgot-password" className="text-xs font-semibold text-brand">
                Forgot password?
              </Link>
            </div>
            {/* role=alert so the failure is announced, not just recoloured. */}
            {error && (
              <div className="flex flex-col gap-1">
                <p role="alert" className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger">
                  {error}
                </p>
                {/* An unconfirmed account is a dead end without this — the 403
                    tells them to check their inbox, but the link may have
                    expired or never arrived. */}
                {isUnverified && (
                  <Link to="/verify-email" className="text-xs font-semibold text-brand">
                    Resend confirmation email
                  </Link>
                )}
              </div>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-foreground-muted">
            No account? <Link to="/signup" className="font-semibold text-brand">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
