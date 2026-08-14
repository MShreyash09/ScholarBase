import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { DEPARTMENTS } from "@scholarbase/shared-types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Moon, Sun } from "lucide-react";

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  // The pre-paint script in index.html has already set the class from
  // localStorage / prefers-color-scheme, so reading it here is the source of
  // truth rather than a guess that always started light.
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Follow the OS only while the user hasn't made an explicit choice.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem("scholarbase-theme") === null) setIsDark(e.matches);
      } catch {
        setIsDark(e.matches);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("scholarbase-theme", next ? "dark" : "light");
      } catch {
        /* storage blocked — the toggle still works for this session */
      }
      return next;
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-pill focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur-md supports-[backdrop-filter]:bg-surface/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tight text-brand"
            aria-label="ScholarBase home"
          >
            {/* The dark variant used to go *darker* (primary-600 on a near-black
                surface, 2.47:1). On a dark background the accent has to move up
                the ramp, not down. */}
            ScholarBase<span className="text-primary-400 dark:text-primary-300">.</span>
          </Link>

          <nav className="flex flex-wrap items-center gap-1">
            {DEPARTMENTS.map((dept) => (
              <Link
                key={dept.code}
                to={`/departments/${dept.code}`}
                className="rounded-pill px-4 py-1.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-primary/10 hover:text-primary-700 dark:hover:text-primary-400"
              >
                {dept.label}
              </Link>
            ))}
            {user && (
              <Link
                to="/study-rooms"
                className="rounded-pill px-4 py-1.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-primary/10 hover:text-primary-700 dark:hover:text-primary-400"
              >
                Study Rooms
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="rounded-pill px-4 py-1.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-primary/10 hover:text-primary-700 dark:hover:text-primary-400"
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="px-2"
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              title={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? (
                <Sun className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
            
            {user ? (
              <>
                <span className="hidden text-sm font-medium text-foreground-muted sm:inline">
                  {user.fullName}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 animate-fade-in-up">
        <Outlet />
      </main>

      {/* Both pages live here rather than in the header nav: that row already
          carries seven departments and wraps on a phone, and a ninth link would
          push the sign-up button off the first line. */}
      <footer className="mt-8 border-t border-border bg-surface py-8 text-center text-sm text-foreground-muted">
        <nav className="mb-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link to="/instructions" className="font-medium transition-colors hover:text-brand">
            How it works
          </Link>
          <Link to="/contribute" className="font-medium transition-colors hover:text-brand">
            Contribute papers
          </Link>
        </nav>
        <p>© {new Date().getFullYear()} ScholarBase. Built for students.</p>
      </footer>
    </div>
  );
}
