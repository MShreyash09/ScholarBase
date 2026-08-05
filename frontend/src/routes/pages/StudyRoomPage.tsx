import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { studyRoomsApi } from "@/lib/api/study-rooms";
import { useAuth } from "@/hooks/useAuth";
import { useStudyRoom } from "@/hooks/useStudyRoom";
import { useStudyRoomMedia } from "@/hooks/useStudyRoomMedia";
import { ChatPanel } from "@/components/study-room/ChatPanel";
import { CallPanel } from "@/components/study-room/CallPanel";
import { CopyInviteButton } from "@/components/study-room/CopyInviteButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  connecting: "Connecting...",
  connected: "Live",
  disconnected: "Reconnecting...",
  error: "Disconnected",
};

export function StudyRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();

  const roomQuery = useQuery({
    queryKey: ["study-room", roomId],
    queryFn: () => studyRoomsApi.get(roomId!),
    enabled: Boolean(roomId),
  });

  const {
    status,
    error,
    closedMessage,
    self,
    participants,
    messages,
    typingNames,
    sendMessage,
    setTyping,
    socketRef,
  } = useStudyRoom(roomId);

  const media = useStudyRoomMedia(roomId, socketRef, participants, status === "connected");

  // If the room is closed under us, release the mic/camera immediately rather
  // than leaving the capture running behind a dead session.
  const { inCall, leaveCall } = media;
  useEffect(() => {
    if (closedMessage && inCall) leaveCall();
  }, [closedMessage, inCall, leaveCall]);

  if (roomQuery.isError) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-neutral-500">
          This study room is not available. Private rooms need an invite link.
        </p>
        <Button asChild className="mt-4">
          <Link to="/study-rooms">Back to study rooms</Link>
        </Button>
      </Card>
    );
  }

  if (closedMessage) {
    return (
      <Card className="mx-auto max-w-md p-8 text-center">
        <p className="text-sm font-semibold text-neutral-800">{closedMessage}</p>
        <p className="mt-1 text-sm text-neutral-500">The session has ended.</p>
        <Button asChild className="mt-4">
          <Link to="/study-rooms">Back to study rooms</Link>
        </Button>
      </Card>
    );
  }

  const everyone = self ? [self, ...participants] : participants;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-primary-700">
              {roomQuery.data?.name ?? "Study room"}
            </h1>
            <Badge variant={status === "connected" ? "success" : "muted"}>
              <span
                className={cn(
                  "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
                  status === "connected" ? "bg-green-600" : "bg-neutral-400",
                )}
              />
              {STATUS_LABEL[status]}
            </Badge>
          </div>
          {roomQuery.data?.description && (
            <p className="mt-1 text-sm text-neutral-500">{roomQuery.data.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {roomQuery.data?.inviteCode && (
            <CopyInviteButton inviteCode={roomQuery.data.inviteCode} />
          )}
          <Button asChild variant="outline" size="sm">
            <Link to="/study-rooms">Leave room</Link>
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {self?.isModerator && (
        <div className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700">
          You joined this room as an <strong>admin moderator</strong>. Everyone here can see that
          you're present — your name shows in the participant list with a Moderator badge.
        </div>
      )}

      <Card className="p-4">
        <CallPanel
          media={media}
          self={self}
          participants={participants}
          disabled={status !== "connected"}
        />
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Card className="flex h-[calc(100vh-16rem)] min-h-[420px] flex-col overflow-hidden">
          <ChatPanel
            messages={messages}
            currentUserId={user?.id}
            typingNames={typingNames}
            disabled={status !== "connected"}
            onSend={sendMessage}
            onTyping={setTyping}
          />
        </Card>

        <Card className="h-fit p-4">
          <h2 className="text-sm font-bold text-neutral-800">
            In this room ({everyone.length})
          </h2>
          <ul className="mt-3 space-y-2">
            {everyone.map((participant) => (
              <li key={participant.socketId} className="flex items-center gap-2 text-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                  {participant.fullName.charAt(0).toUpperCase()}
                </span>
                <span className="flex-1 truncate text-neutral-700">
                  {participant.fullName}
                  {participant.socketId === self?.socketId && (
                    <span className="text-neutral-400"> (you)</span>
                  )}
                </span>
                {participant.isModerator && (
                  <Badge variant="default" title="An admin present for moderation">
                    Moderator
                  </Badge>
                )}
                {(participant.socketId === self?.socketId ? media.inCall : participant.inCall) && (
                  <Badge variant="success">on call</Badge>
                )}
              </li>
            ))}
            {everyone.length === 0 && (
              <li className="text-sm text-neutral-400">Nobody here yet.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
