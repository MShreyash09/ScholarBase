import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StudyRoomVisibility, type StudyRoomDto } from "@scholarbase/shared-types";
import { studyRoomsApi } from "@/lib/api/study-rooms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Moderation list of every open study room. Admins can end any session here,
 * including private rooms — which by design never show up in their own lobby.
 */
export function AdminStudyRooms() {
  const queryClient = useQueryClient();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const roomsQuery = useQuery({
    queryKey: ["study-rooms", "admin"],
    queryFn: studyRoomsApi.listAllForAdmin,
    refetchInterval: 10000,
  });

  const closeRoom = useMutation({
    mutationFn: studyRoomsApi.close,
    onSettled: () => {
      setPendingId(null);
      queryClient.invalidateQueries({ queryKey: ["study-rooms"] });
    },
  });

  const handleClose = (room: StudyRoomDto) => {
    const occupants = room.participantCount > 0 ? ` ${room.participantCount} person(s) are in it.` : "";
    if (!window.confirm(`Close "${room.name}"?${occupants} Everyone will be removed from the session.`)) {
      return;
    }
    setPendingId(room.id);
    closeRoom.mutate(room.id);
  };

  if (roomsQuery.isLoading) {
    return <p className="text-sm text-foreground-muted">Loading rooms...</p>;
  }

  if (roomsQuery.isError) {
    return <p className="text-sm text-danger">Could not load study rooms.</p>;
  }

  if (roomsQuery.data?.length === 0) {
    return <p className="text-sm text-foreground-muted">No open study rooms right now.</p>;
  }

  return (
    <ul className="divide-y divide-muted">
      {roomsQuery.data?.map((room) => (
        <li key={room.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-foreground">{room.name}</span>
              <Badge variant={room.visibility === StudyRoomVisibility.PRIVATE ? "default" : "muted"}>
                {room.visibility === StudyRoomVisibility.PRIVATE ? "Private" : "Public"}
              </Badge>
              <Badge variant={room.participantCount > 0 ? "success" : "muted"}>
                {room.participantCount} in room
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-foreground-muted">
              by {room.createdByName} · opened {new Date(room.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              {/* Oversight join: the admin enters visibly, badged as a moderator. */}
              <Link to={`/study-rooms/${room.id}`}>Join</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleClose(room)}
              disabled={closeRoom.isPending && pendingId === room.id}
            >
              {closeRoom.isPending && pendingId === room.id ? "Closing..." : "Close room"}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
