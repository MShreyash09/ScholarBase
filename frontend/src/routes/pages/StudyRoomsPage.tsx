import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StudyRoomVisibility, type StudyRoomDto } from "@scholarbase/shared-types";
import { studyRoomsApi } from "@/lib/api/study-rooms";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyInviteButton } from "@/components/study-room/CopyInviteButton";

export function StudyRoomsPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<StudyRoomVisibility>(StudyRoomVisibility.PRIVATE);
  const [formError, setFormError] = useState<string | null>(null);

  const [invite, setInvite] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);

  const roomsQuery = useQuery({
    queryKey: ["study-rooms"],
    queryFn: studyRoomsApi.list,
    // Participant counts are live server-side; poll so the lobby stays honest.
    refetchInterval: 10000,
  });

  const createRoom = useMutation({
    mutationFn: studyRoomsApi.create,
    onSuccess: () => {
      setName("");
      setDescription("");
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ["study-rooms"] });
    },
    onError: () => setFormError("Could not create the room. Names must be at least 3 characters."),
  });

  const joinByInvite = useMutation({
    mutationFn: studyRoomsApi.redeemInvite,
    onSuccess: (room) => {
      setInvite("");
      setInviteError(null);
      queryClient.invalidateQueries({ queryKey: ["study-rooms"] });
      navigate(`/study-rooms/${room.id}`);
    },
    onError: () => setInviteError("That invite link is not valid, or the room has been closed."),
  });

  const closeRoom = useMutation({
    mutationFn: studyRoomsApi.close,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["study-rooms"] }),
  });

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    createRoom.mutate({ name, description: description || null, visibility });
  };

  const handleJoin = (e: FormEvent) => {
    e.preventDefault();
    if (!invite.trim()) return;
    joinByInvite.mutate(invite);
  };

  const canClose = (room: StudyRoomDto) => isAdmin || room.createdById === user?.id;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold text-primary-700">Study rooms</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Live rooms for group revision — chat with everyone in the room, then turn on audio and
          video when you want to talk it through.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Join with an invite link</CardTitle>
          <p className="text-sm text-neutral-500">
            Someone shared a private room with you? Paste their link here.
          </p>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleJoin}>
            <Input
              placeholder="https://.../study-rooms/join/xxxxxxxx"
              value={invite}
              onChange={(e) => {
                setInvite(e.target.value);
                setInviteError(null);
              }}
              aria-label="Invite link"
            />
            <Button type="submit" disabled={joinByInvite.isPending || !invite.trim()}>
              {joinByInvite.isPending ? "Joining..." : "Join room"}
            </Button>
          </form>
          {inviteError && <p className="mt-3 text-sm text-red-600">{inviteError}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Start a room</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3" onSubmit={handleCreate}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Room name, e.g. DBMS unit 3 revision"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={3}
                maxLength={80}
                aria-label="Room name"
              />
              <Input
                placeholder="What are you working on? (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={280}
                aria-label="Room description"
              />
              <Button type="submit" disabled={createRoom.isPending}>
                {createRoom.isPending ? "Creating..." : "Create"}
              </Button>
            </div>

            <fieldset className="flex flex-wrap items-center gap-4">
              <legend className="sr-only">Who can join</legend>
              <label className="flex items-center gap-2 text-sm text-neutral-600">
                <input
                  type="radio"
                  name="visibility"
                  value={StudyRoomVisibility.PRIVATE}
                  checked={visibility === StudyRoomVisibility.PRIVATE}
                  onChange={() => setVisibility(StudyRoomVisibility.PRIVATE)}
                />
                Private — only people with the invite link
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-600">
                <input
                  type="radio"
                  name="visibility"
                  value={StudyRoomVisibility.PUBLIC}
                  checked={visibility === StudyRoomVisibility.PUBLIC}
                  onChange={() => setVisibility(StudyRoomVisibility.PUBLIC)}
                />
                Public — listed for every student
              </label>
            </fieldset>
          </form>
          {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}
        </CardContent>
      </Card>

      {roomsQuery.isLoading && <p className="text-sm text-neutral-500">Loading rooms...</p>}

      {roomsQuery.isError && (
        <p className="text-sm text-red-600">Could not load study rooms. Try refreshing.</p>
      )}

      {roomsQuery.data?.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-neutral-500">
            No rooms yet. Create one above, or paste an invite link someone sent you.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roomsQuery.data?.map((room) => (
          <Card key={room.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle>{room.name}</CardTitle>
                <Badge variant={room.participantCount > 0 ? "success" : "muted"}>
                  {room.participantCount} in room
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={room.visibility === StudyRoomVisibility.PRIVATE ? "default" : "muted"}>
                  {room.visibility === StudyRoomVisibility.PRIVATE ? "Private" : "Public"}
                </Badge>
                <span className="text-xs text-neutral-400">by {room.createdByName}</span>
              </div>
              {room.description && <p className="text-sm text-neutral-500">{room.description}</p>}
            </CardHeader>
            <CardContent className="mt-auto flex flex-wrap items-center justify-end gap-2">
              {room.inviteCode && <CopyInviteButton inviteCode={room.inviteCode} />}
              {canClose(room) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => closeRoom.mutate(room.id)}
                  disabled={closeRoom.isPending}
                >
                  Close
                </Button>
              )}
              <Button asChild size="sm">
                <Link to={`/study-rooms/${room.id}`}>Join</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
