import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { authApi } from "@/lib/api/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!email.endsWith("@mmcoe.edu.in")) {
      setError("Only @mmcoe.edu.in emails are allowed.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await authApi.forgotPassword(email);
      setMessage(res.message);
    } catch {
      // The server answers identically for known and unknown addresses; a
      // network failure shouldn't be the one case that leaks a difference, so
      // the confirmation is shown either way.
      setMessage("If that email has an account, a reset link is on its way.");
    } finally {
      setSent(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Forgot your password?</CardTitle>
          <CardDescription>
            Enter your college email and we&apos;ll send you a link to set a new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="flex flex-col gap-4">
              <p
                role="status"
                className="rounded-lg bg-success-bg px-3 py-2 text-sm font-medium text-success"
              >
                {message}
              </p>
              <p className="text-sm text-foreground-muted">
                The link expires in an hour and can only be used once. Check your spam folder if it
                doesn&apos;t arrive in a few minutes.
              </p>
              <Button asChild variant="outline">
                <Link to="/login">Back to log in</Link>
              </Button>
            </div>
          ) : (
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
              {error && (
                <p role="alert" className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send reset link"}
              </Button>
              <p className="text-center text-sm text-foreground-muted">
                Remembered it?{" "}
                <Link to="/login" className="font-semibold text-brand">
                  Log in
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
