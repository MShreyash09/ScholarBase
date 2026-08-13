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

    if (!email.endsWith("@mmcoe.edu.in")) {
      setError("Only @mmcoe.edu.in emails are allowed.");
      setIsSubmitting(false);
      return;
    }

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
