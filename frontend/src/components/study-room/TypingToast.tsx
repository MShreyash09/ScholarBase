import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TypingToastProps {
  typingNames: string[];
}

function label(names: string[]): string {
  if (names.length === 1) return `${names[0]} is typing`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing`;
  return `${names.length} people are typing`;
}

/**
 * A floating notice that someone is composing a message — the thing the plain
 * "X is typing…" line inside ChatPanel could never do, because that line only
 * exists once the chat panel is open. Chat starts closed by default
 * (`isChatOpen` in StudyRoomPage), so without this a typing peer previously had
 * no way to be noticed at all unless you happened to already have the panel up.
 *
 * Kept mounted through the fade-out (`onTransitionEnd`) rather than removed the
 * instant `typingNames` empties, so "stopped typing" reads as a toast leaving
 * instead of vanishing mid-frame.
 */
export function TypingToast({ typingNames }: TypingToastProps) {
  const [mounted, setMounted] = useState(false);
  const visible = typingNames.length > 0;

  useEffect(() => {
    if (visible) setMounted(true);
  }, [visible]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-6 z-40 flex items-center gap-2.5 rounded-full border border-border",
        "bg-surface px-4 py-2.5 shadow-lg transition-all duration-300 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      )}
      onTransitionEnd={() => {
        if (!visible) setMounted(false);
      }}
      role="status"
      aria-live="polite"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-brand">
        {typingNames[0]?.charAt(0).toUpperCase()}
      </span>
      <span className="text-sm font-medium text-foreground">{label(typingNames)}</span>
      <span className="flex items-end gap-0.5" aria-hidden="true">
        <span className="h-1.5 w-1.5 rounded-full bg-brand motion-safe:animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-brand motion-safe:animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-brand motion-safe:animate-bounce" />
      </span>
    </div>
  );
}
