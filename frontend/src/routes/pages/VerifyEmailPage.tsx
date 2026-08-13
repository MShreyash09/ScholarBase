import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "@/lib/api/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

type Status = "verifying" | "success" | "error";

/**
 * Confirms a signup by redeeming the token from the emailed link.
 *
 * Unlike every other auth page this one submits on mount rather than on a click
 * — the user already "submitted" by opening the link, so asking them to press a
 * button again would be pure friction.
 */
export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";

  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");

  // The app runs inside <React.StrictMode>, so effects fire twice on mount in
  // development. The token is single-use, meaning the second call would be
  // rejected and paint a failure over a verification that actually succeeded.
  // This latch keeps the request to exactly one per mount.
  const requested = useRef(false);

  useEffect(() => {
    if (!token || requested.current) return;
    requested.current = true;

    authApi
      .verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Could not confirm your email. The link may have expired.",
        );
      });
  }, [token]);

  if (!token) {
    return (
      <div className="mx-auto max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Confirmation link missing</CardTitle>
            <CardDescription>
              This page needs the link from your confirmation email to work.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResendForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>
            {status === "verifying" && "Confirming your email…"}
            {status === "success" && "Email confirmed"}
            {status === "error" && "Confirmation failed"}
          </CardTitle>
          {status === "verifying" && (
            <CardDescription>This only takes a moment.</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {status === "verifying" && (
            <p className="text-sm text-foreground-muted">
              Checking your link. If the server has been idle this can take up to a minute.
            </p>
          )}

          {status === "success" && (
            <div className="flex flex-col gap-4">
              <p
                role="status"
                className="rounded-lg bg-success-bg px-3 py-2 text-sm font-medium text-success"
              >
                {message}
              </p>
              <Button onClick={() => navigate("/login", { replace: true })}>Go to log in</Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col gap-4">
              <p
                role="alert"
                className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger"
              >
                {message}
              </p>
              <p className="text-sm text-foreground-muted">
                Enter your email below and we&apos;ll send a fresh link.
              </p>
              <ResendForm />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Shared by the missing-token and failed-verification states. Always reports
 * success, matching the endpoint's deliberately uniform response — it must not
 * reveal whether an address is registered or already confirmed.
 */
function ResendForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // No domain check: this resends to an account that already exists, and a
    // client-side rejection would make some addresses answer differently from
    // others — exactly the enumeration signal the uniform server response is
    // designed to remove.
    try {
      const res = await authApi.resendVerification(email);
      setSent(res.message);
    } catch {
      setSent("If that email needs confirming, a new link is on its way.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <p
          role="status"
          className="rounded-lg bg-success-bg px-3 py-2 text-sm font-medium text-success"
        >
          {sent}
        </p>
        <Button asChild variant="outline">
          <Link to="/login">Back to log in</Link>
        </Button>
      </div>
    );
  }

  return (
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
        {isSubmitting ? "Sending..." : "Send a new link"}
      </Button>
    </form>
  );
}
