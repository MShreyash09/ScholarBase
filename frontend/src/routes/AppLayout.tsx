import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { DEPARTMENTS } from "@scholarbase/shared-types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Moon, Sun } from "lucide-react";

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface transition-colors duration-300">
      <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="text-2xl font-extrabold tracking-tight text-primary-700 dark:text-primary-400">
            ScholarBase<span className="text-primary-400 dark:text-primary-600">.</span>
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
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="px-2">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
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

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 animate-fade-in-up">
        <Outlet />
      </main>
      
      <footer className="border-t border-border py-8 text-center text-sm text-foreground-muted">
        <p>© {new Date().getFullYear()} ScholarBase. Built for students.</p>
      </footer>
    </div>
  );
}
