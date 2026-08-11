import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MIN_PASSWORD_LENGTH } from "@scholarbase/shared-types";
import { authApi } from "@/lib/api/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Could not reset your password. The link may have expired.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Reset link missing</CardTitle>
            <CardDescription>
              This page needs the link from your reset email to work.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/forgot-password">Request a new link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>{done ? "Password updated" : "Choose a new password"}</CardTitle>
          {!done && (
            <CardDescription>
              Setting a new password signs you out everywhere else.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="flex flex-col gap-4">
              <p
                role="status"
                className="rounded-lg bg-success-bg px-3 py-2 text-sm font-medium text-success"
              >
                Your password has been changed. You can log in with it now.
              </p>
              <Button onClick={() => navigate("/login", { replace: true })}>Go to log in</Button>
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <Field
                label="New password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                hint={`Minimum ${MIN_PASSWORD_LENGTH} characters.`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={MIN_PASSWORD_LENGTH}
                required
              />
              <Field
                label="Confirm new password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Type it again"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                error={mismatch ? "Those passwords don't match." : undefined}
                required
              />
              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger"
                >
                  {error}
                </p>
              )}
              <Button type="submit" disabled={isSubmitting || mismatch}>
                {isSubmitting ? "Updating..." : "Update password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
