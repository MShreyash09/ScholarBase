import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { studyRoomsApi } from "@/lib/api/study-rooms";
import { useAuth } from "@/hooks/useAuth";
import { useStudyRoom } from "@/hooks/useStudyRoom";
import { useWhiteboard } from "@/hooks/useWhiteboard";
import { ChatPanel } from "@/components/study-room/ChatPanel";
import { DailyCallPanel } from "@/components/study-room/DailyCallPanel";
import { TypingToast } from "@/components/study-room/TypingToast";
import { WhiteboardPanel } from "@/components/study-room/WhiteboardPanel";
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
  const [unreadCount, setUnreadCount] = useState(0);

  const roomQuery = useQuery({
    queryKey: ["study-room", roomId],
    queryFn: () => studyRoomsApi.get(roomId!),
    enabled: Boolean(roomId),
  });

  const dailyUrlQuery = useQuery({
    queryKey: ["daily-url", roomId],
    queryFn: () => studyRoomsApi.getDailyUrl(roomId!),
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
    readReceipts,
    sendMessage,
    setTyping,
    markRead,
    socketRef,
  } = useStudyRoom(roomId);

  // Clearing and incrementing are split into two effects on purpose: they
  // react to different triggers. A single effect keyed on `messages.length`
  // would never re-run — and so never clear the badge — when the panel opens
  // without a new message having arrived in between.
  useEffect(() => {
    if (isChatOpen) setUnreadCount(0);
  }, [isChatOpen]);

  // A message that arrives while chat is closed had no way to be noticed
  // before this — ChatPanel (and its typing/read logic) doesn't even mount
  // until the panel is opened. This is what puts a number on the toggle.
  useEffect(() => {
    if (isChatOpen) return;
    const latest = messages[messages.length - 1];
    if (latest && latest.senderId !== user?.id) {
      setUnreadCount((prev) => prev + 1);
    }
    // Only the newest message should ever trigger this — recounting the whole
    // array on every render would double-count messages already seen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const board = useWhiteboard(
    roomId,
    socketRef,
    status === "connected",
    self?.userId,
    self?.socketId,
  );

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
          <Button
            variant="outline"
            size="sm"
            className="relative"
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            {isChatOpen ? "Hide chat" : "Show chat"}
            {!isChatOpen && unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/study-rooms">Leave room</Link>
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {/* Only while chat is closed — the inline indicator inside ChatPanel
          already covers it once the panel is open, and showing both would be
          the same information twice. */}
      {!isChatOpen && <TypingToast typingNames={typingNames} />}

      {self?.isModerator && (
        <div className="rounded-lg border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-brand">
          You joined this room as an <strong>admin moderator</strong>. Everyone here can see that
          you're present — your name shows in the participant list with a Moderator badge.
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="flex-1 flex flex-col gap-4 w-full min-w-0">
          <Card className="flex flex-col overflow-hidden aspect-video min-h-[450px]">
            {dailyUrlQuery.data?.url ? (
              <DailyCallPanel url={dailyUrlQuery.data.url} />
            ) : dailyUrlQuery.isLoading ? (
              <div className="flex items-center justify-center flex-1 text-foreground-muted">Loading video call...</div>
            ) : (
              <div className="flex items-center justify-center flex-1 text-danger">Failed to load video call.</div>
            )}
          </Card>

          {/* Deliberately its own panel rather than an overlay on the screen
              share: the board is a separate surface, and it keeps working for
              students whose peer connection never establishes. */}
          <Card className="p-4">
            <WhiteboardPanel
              board={board}
              participants={everyone}
              roomId={roomId!}
              selfUserId={self?.userId}
              selfName={self?.fullName ?? user?.fullName ?? "You"}
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
              readReceipts={readReceipts}
              onSend={sendMessage}
              onTyping={setTyping}
              onMarkRead={markRead}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
