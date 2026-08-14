import { Link, useLocation } from "react-router-dom";
import { Compass, Home, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Catch-all for unmatched routes.
 *
 * Without this the app rendered nothing at all: React Router matched no child,
 * so the layout route never rendered and #root stayed empty. Vercel's SPA
 * rewrite serves index.html for every path, so any typo, stale bookmark or old
 * shared link showed a student a blank white page with no way back.
 */
export function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
            <Compass className="h-6 w-6 text-brand" aria-hidden="true" />
          </div>
          <CardTitle>This page doesn&apos;t exist</CardTitle>
          <CardDescription>
            We couldn&apos;t find <span className="font-semibold">{location.pathname}</span>. The
            link may be old, or the address may have a typo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/">
                <Home className="h-4 w-4" aria-hidden="true" />
                Back to home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/study-rooms">
                <Search className="h-4 w-4" aria-hidden="true" />
                Study rooms
              </Link>
            </Button>
          </div>
          <p className="text-sm text-foreground-muted">
            Looking for a question paper? Pick your department from the menu above, then choose a
            year and semester.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
