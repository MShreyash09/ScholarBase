import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  STUDY_ROOM_MESSAGE_MAX_LENGTH,
  type StudyRoomMessageDto,
} from "@scholarbase/shared-types";
import { Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  messages: StudyRoomMessageDto[];
  currentUserId: string | undefined;
  typingNames: string[];
  disabled: boolean;
  /** userId -> the newest message that user has read. */
  readReceipts: Record<string, { lastReadMessageId: string; lastReadAt: string }>;
  onSend: (body: string) => void;
  onTyping: (isTyping: boolean) => void;
  /** Advances the caller's own read watermark. */
  onMarkRead: (messageId: string) => void;
}

const TYPING_IDLE_MS = 1500;
/** How long to wait after a new message renders before marking it read — long
 *  enough that a message flying past during a fast exchange isn't marked read
 *  before it was actually seen, short enough to still feel immediate. */
const MARK_READ_DEBOUNCE_MS = 500;

type TickState = "sent" | "delivered" | "read";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * `read` and `delivered` are true/false per message from the server, but
 * "read" is derived here rather than stored: a participant's watermark
 * (`lastReadAt`) advances past every earlier message at once, so comparing
 * timestamps tells us a message's read state without the server tracking a
 * row per (message, reader).
 */
function tickState(
  message: StudyRoomMessageDto,
  currentUserId: string | undefined,
  readReceipts: ChatPanelProps["readReceipts"],
): TickState {
  const messageTime = new Date(message.createdAt).getTime();
  const readByOther = Object.entries(readReceipts).some(
    ([userId, receipt]) => userId !== currentUserId && new Date(receipt.lastReadAt).getTime() >= messageTime,
  );
  if (readByOther) return "read";
  return message.delivered ? "delivered" : "sent";
}

function MessageTicks({ state }: { state: TickState }) {
  if (state === "sent") {
    return <Check className="h-3.5 w-3.5" aria-label="Sent" />;
  }
  return (
    <CheckCheck
      className={cn("h-3.5 w-3.5", state === "read" ? "text-sky-300" : "")}
      aria-label={state === "read" ? "Read" : "Delivered"}
    />
  );
}

export function ChatPanel({
  messages,
  currentUserId,
  typingNames,
  disabled,
  readReceipts,
  onSend,
  onTyping,
  onMarkRead,
}: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<number>();
  const isTypingRef = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typingNames.length]);

  // Tell the room we stopped typing if this panel goes away mid-sentence.
  useEffect(() => {
    return () => {
      window.clearTimeout(idleTimer.current);
      if (isTypingRef.current) onTyping(false);
    };
  }, [onTyping]);

  // Marks the newest message read once it has actually been on screen for a
  // beat — but only while this panel is mounted (the parent only renders it
  // when chat is open) *and* the tab genuinely has eyes on it. Without the
  // visibility/focus checks, a message sitting behind a backgrounded tab would
  // be marked read the instant it arrived, which is not "read" by any
  // definition a user would recognise.
  const lastMarkedIdRef = useRef<string | null>(null);
  useEffect(() => {
    const latest = messages[messages.length - 1];
    if (!latest || latest.senderId === currentUserId) return;
    if (latest.id === lastMarkedIdRef.current) return;

    const markIfVisible = () => {
      if (document.visibilityState !== "visible" || !document.hasFocus()) return;
      lastMarkedIdRef.current = latest.id;
      onMarkRead(latest.id);
    };

    const timer = window.setTimeout(markIfVisible, MARK_READ_DEBOUNCE_MS);
    // A message that arrives while the tab is backgrounded gets marked the
    // moment focus returns, rather than waiting for the *next* message to
    // trigger this effect again.
    document.addEventListener("visibilitychange", markIfVisible);
    window.addEventListener("focus", markIfVisible);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", markIfVisible);
      window.removeEventListener("focus", markIfVisible);
    };
  }, [messages, currentUserId, onMarkRead]);

  const stopTyping = () => {
    window.clearTimeout(idleTimer.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTyping(false);
    }
  };

  const handleChange = (value: string) => {
    setDraft(value);
    if (disabled) return;

    if (!isTypingRef.current && value.length > 0) {
      isTypingRef.current = true;
      onTyping(true);
    }

    window.clearTimeout(idleTimer.current);
    if (value.length === 0) {
      stopTyping();
    } else {
      idleTimer.current = window.setTimeout(stopTyping, TYPING_IDLE_MS);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSend(draft);
    setDraft("");
    stopTyping();
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-foreground-subtle">
            No messages yet — say hello to start the session.
          </p>
        )}

        {messages.map((message) => {
          const isMine = message.senderId === currentUserId;
          return (
            <div key={message.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2",
                  isMine ? "bg-primary text-white" : "bg-muted text-foreground",
                )}
              >
                {!isMine && (
                  <p className="text-xs font-semibold text-brand">{message.senderName}</p>
                )}
                <p className="whitespace-pre-wrap break-words text-sm">{message.body}</p>
                <p
                  className={cn(
                    "mt-1 flex items-center justify-end gap-1 text-[10px]",
                    isMine ? "text-white/70" : "text-foreground-subtle",
                  )}
                >
                  {formatTime(message.createdAt)}
                  {isMine && <MessageTicks state={tickState(message, currentUserId, readReceipts)} />}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fades and slides in place, rather than shoving the message list up
          and down as people start and stop typing. */}
      <div
        className={cn(
          "flex items-center gap-2 px-4 text-xs text-foreground-subtle transition-all duration-200",
          typingNames.length > 0 ? "h-6 translate-y-0 opacity-100" : "h-0 -translate-y-1 opacity-0",
        )}
      >
        <span className="flex items-end gap-0.5" aria-hidden="true">
          <span className="h-1 w-1 rounded-full bg-current motion-safe:animate-bounce [animation-delay:-0.3s]" />
          <span className="h-1 w-1 rounded-full bg-current motion-safe:animate-bounce [animation-delay:-0.15s]" />
          <span className="h-1 w-1 rounded-full bg-current motion-safe:animate-bounce" />
        </span>
        <span className="italic">
          {typingNames.length === 1 && `${typingNames[0]} is typing...`}
          {typingNames.length > 1 && `${typingNames.length} people are typing...`}
        </span>
      </div>

      <form className="flex gap-2 border-t border-border p-4" onSubmit={handleSubmit}>
        <Input
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={disabled ? "Connecting..." : "Message the room"}
          maxLength={STUDY_ROOM_MESSAGE_MAX_LENGTH}
          disabled={disabled}
          aria-label="Message the room"
        />
        <Button type="submit" disabled={disabled || !draft.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
