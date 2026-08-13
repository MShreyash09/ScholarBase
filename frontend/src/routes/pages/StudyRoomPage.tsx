import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { studyRoomsApi } from "@/lib/api/study-rooms";
import { useAuth } from "@/hooks/useAuth";
import { useStudyRoom } from "@/hooks/useStudyRoom";
import { useStudyRoomMedia } from "@/hooks/useStudyRoomMedia";

import { useScreenPointer } from "@/hooks/useScreenPointer";
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
  const [isChatOpen, setIsChatOpen] = useState(false);

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

  const screenPointer = useScreenPointer(roomId, socketRef, status === "connected");



  // If the room is closed under us, release the mic/camera immediately rather
  // than leaving the capture running behind a dead session.
  const { inCall, leaveCall } = media;
  useEffect(() => {
    if (closedMessage && inCall) leaveCall();
  }, [closedMessage, inCall, leaveCall]);

  if (roomQuery.isError) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-foreground-muted">
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
        <p className="text-sm font-semibold text-foreground">{closedMessage}</p>
        <p className="mt-1 text-sm text-foreground-muted">The session has ended.</p>
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
            <h1 className="text-2xl font-extrabold text-brand">
              {roomQuery.data?.name ?? "Study room"}
            </h1>
            <Badge variant={status === "connected" ? "success" : "muted"}>
              <span
                className={cn(
                  "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
                  status === "connected" ? "bg-success" : "bg-foreground-subtle",
                )}
              />
              {STATUS_LABEL[status]}
            </Badge>
          </div>
          {roomQuery.data?.description && (
            <p className="mt-1 text-sm text-foreground-muted">{roomQuery.data.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {roomQuery.data?.inviteCode && (
            <CopyInviteButton inviteCode={roomQuery.data.inviteCode} />
          )}
          <Button variant="outline" size="sm" onClick={() => setIsChatOpen(!isChatOpen)}>
            {isChatOpen ? "Hide chat" : "Show chat"}
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/study-rooms">Leave room</Link>
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {self?.isModerator && (
        <div className="rounded-lg border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-brand">
          You joined this room as an <strong>admin moderator</strong>. Everyone here can see that
          you're present — your name shows in the participant list with a Moderator badge.
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="flex-1 flex flex-col gap-4 w-full min-w-0">
          <Card className="p-4">
            <CallPanel
              media={media}
              self={self}
              participants={participants}
              disabled={status !== "connected"}
              pointers={screenPointer.pointers}
              onPointerPosition={screenPointer.send}
            />
          </Card>



          <Card className="h-fit p-4">
            <h2 className="text-sm font-bold text-foreground">
              In this room ({everyone.length})
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {everyone.map((participant) => (
                <li key={participant.socketId} className="flex items-center gap-2 text-sm">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-brand">
                    {participant.fullName.charAt(0).toUpperCase()}
                  </span>
                  <span className="flex-1 truncate text-foreground">
                    {participant.fullName}
                    {participant.socketId === self?.socketId && (
                      <span className="text-foreground-subtle"> (you)</span>
                    )}
                  </span>
                  {participant.isModerator && (
                    <Badge variant="default" title="An admin present for moderation">
                      Mod
                    </Badge>
                  )}
                  {(participant.socketId === self?.socketId ? media.inCall : participant.inCall) && (
                    <Badge variant="success">on call</Badge>
                  )}
                </li>
              ))}
              {everyone.length === 0 && (
                <li className="text-sm text-foreground-subtle col-span-full">Nobody here yet.</li>
              )}
            </ul>
          </Card>
        </div>

        {isChatOpen && (
          <Card className="w-full lg:w-[340px] xl:w-[400px] shrink-0 flex h-[calc(100vh-12rem)] min-h-[420px] flex-col overflow-hidden sticky top-4">
            <ChatPanel
              messages={messages}
              currentUserId={user?.id}
              typingNames={typingNames}
              disabled={status !== "connected"}
              onSend={sendMessage}
              onTyping={setTyping}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
