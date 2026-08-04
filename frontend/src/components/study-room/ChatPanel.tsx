import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  STUDY_ROOM_MESSAGE_MAX_LENGTH,
  type StudyRoomMessageDto,
} from "@scholarbase/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  messages: StudyRoomMessageDto[];
  currentUserId: string | undefined;
  typingNames: string[];
  disabled: boolean;
  onSend: (body: string) => void;
  onTyping: (isTyping: boolean) => void;
}

const TYPING_IDLE_MS = 1500;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatPanel({
  messages,
  currentUserId,
  typingNames,
  disabled,
  onSend,
  onTyping,
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
          <p className="py-8 text-center text-sm text-neutral-400">
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
                  isMine ? "bg-primary text-white" : "bg-muted text-neutral-800",
                )}
              >
                {!isMine && (
                  <p className="text-xs font-semibold text-primary-700">{message.senderName}</p>
                )}
                <p className="whitespace-pre-wrap break-words text-sm">{message.body}</p>
                <p
                  className={cn(
                    "mt-1 text-right text-[10px]",
                    isMine ? "text-white/70" : "text-neutral-400",
                  )}
                >
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-5 px-4 text-xs italic text-neutral-400">
        {typingNames.length === 1 && `${typingNames[0]} is typing...`}
        {typingNames.length > 1 && `${typingNames.length} people are typing...`}
      </div>

      <form className="flex gap-2 border-t border-muted p-4" onSubmit={handleSubmit}>
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
