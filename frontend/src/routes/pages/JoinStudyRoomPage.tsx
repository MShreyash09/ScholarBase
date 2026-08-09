import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { studyRoomsApi } from "@/lib/api/study-rooms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Landing page for a shared invite link. Redeems the code, then drops the user
 * straight into the room. Sits behind ProtectedRoute, so an anonymous visitor
 * is sent to log in first and returns here afterwards.
 */
export function JoinStudyRoomPage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  // StrictMode runs effects twice in dev; redeeming twice is harmless but the
  // double navigation is not, so the attempt is guarded.
  const attempted = useRef(false);

  useEffect(() => {
    if (!inviteCode || attempted.current) return;
    attempted.current = true;

    studyRoomsApi
      .redeemInvite(inviteCode)
      .then((room) => {
        queryClient.invalidateQueries({ queryKey: ["study-rooms"] });
        navigate(`/study-rooms/${room.id}`, { replace: true });
      })
      .catch(() => setError("That invite link is not valid, or the room has been closed."));
  }, [inviteCode, navigate, queryClient]);

  if (error) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-foreground-muted">{error}</p>
          <Button asChild className="mt-4">
            <Link to="/study-rooms">Back to study rooms</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <p className="text-center text-sm text-foreground-muted">Opening the study room...</p>;
}
