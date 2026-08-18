import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function SignupPage() {
  const { signup } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

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
      // Signup no longer logs you in — it returns a confirmation message and
      // the account stays unusable until the emailed link is opened.
      const res = await signup({ fullName, email, password });
      setSentMessage(res.message);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Could not create your account.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sentMessage) {
    return (
      <div className="mx-auto max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Check your inbox</CardTitle>
            <CardDescription>One more step to finish signing up.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p
                role="status"
                className="rounded-lg bg-success-bg px-3 py-2 text-sm font-medium text-success"
              >
                {sentMessage}
              </p>
              <p className="text-sm text-foreground-muted">
                We sent a confirmation link to <span className="font-semibold">{email}</span>. It
                expires in 24 hours. You won&apos;t be able to log in until you open it — check
                your spam folder if it doesn&apos;t arrive in a few minutes.
              </p>
              <Button asChild variant="outline">
                <Link to="/login">Back to log in</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Use your college email to get access.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button asChild variant="outline" className="w-full">
              <a href={`${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"}/api/auth/google`}>
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Sign up with Google
              </a>
            </Button>
            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-foreground-muted">Or sign up with email</span>
              </div>
            </div>
          </div>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Field
              label="Full name"
              name="fullName"
              autoComplete="name"
              placeholder="Priya Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="username@mmcoe.edu.in"
              hint="Sign-up is limited to approved college domains."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Field
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              hint="Minimum 8 characters."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            {error && (
              <p role="alert" className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger">
                {error}
              </p>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Sign up"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-foreground-muted">
            Already have an account? <Link to="/login" className="font-semibold text-brand">Log in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
