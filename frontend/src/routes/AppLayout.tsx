import { Link, Outlet, useNavigate } from "react-router-dom";
import { DEPARTMENTS } from "@scholarbase/shared-types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-muted bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="text-xl font-extrabold text-primary-700">
            ScholarBase
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            {DEPARTMENTS.map((dept) => (
              <Link
                key={dept.code}
                to={`/departments/${dept.code}`}
                className="rounded-pill px-4 py-1.5 text-sm font-semibold text-neutral-600 hover:bg-primary-50 hover:text-primary-700"
              >
                {dept.label}
              </Link>
            ))}
            {user && (
              <Link
                to="/study-rooms"
                className="rounded-pill px-4 py-1.5 text-sm font-semibold text-neutral-600 hover:bg-primary-50 hover:text-primary-700"
              >
                Study Rooms
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="rounded-pill px-4 py-1.5 text-sm font-semibold text-neutral-600 hover:bg-primary-50 hover:text-primary-700"
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden text-sm text-neutral-500 sm:inline">{user.fullName}</span>
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

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
