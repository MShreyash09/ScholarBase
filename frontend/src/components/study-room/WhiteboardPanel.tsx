import { useState } from "react";
import { Eraser, Hand, PencilLine, Undo2, X } from "lucide-react";
import type { StudyRoomParticipantDto } from "@scholarbase/shared-types";
import type { UseWhiteboard } from "@/hooks/useWhiteboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WhiteboardCanvas } from "./WhiteboardCanvas";

const PEN_COLORS = ["#111827", "#850013", "#1D4ED8", "#15803D", "#B45309"];
const PEN_WIDTHS = [2, 4, 8];

interface WhiteboardPanelProps {
  board: UseWhiteboard;
  participants: StudyRoomParticipantDto[];
  roomId: string;
  selfUserId: string | undefined;
  selfName: string;
}

export function WhiteboardPanel({
  board,
  participants,
  roomId,
  selfUserId,
  selfName,
}: WhiteboardPanelProps) {
  const [color, setColor] = useState(PEN_COLORS[0]);
  const [width, setWidth] = useState(PEN_WIDTHS[1]);

  // Nobody has opened a board and there is nothing drawn — offer to start one.
  if (!board.isOpen) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-8 text-center">
        <PencilLine className="h-8 w-8 text-foreground-subtle" aria-hidden="true" />
        <p className="text-sm text-foreground-muted">
          Open a whiteboard to sketch a derivation or work a problem together.
        </p>
        <Button size="sm" onClick={board.claim}>
          Open whiteboard
        </Button>
      </div>
    );
  }

  const unowned = board.ownerSocketId === null;
  // Everyone except us — the owner never needs granting.
  const others = participants.filter((p) => p.userId !== selfUserId);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PencilLine className="h-4 w-4 text-brand" aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">Whiteboard</span>
          {board.ownerName ? (
            <Badge variant="muted">{board.isOwner ? "You control it" : `${board.ownerName} controls it`}</Badge>
          ) : (
            <Badge variant="warning">Unclaimed</Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* An unowned board (the owner left) can be taken by anyone still here,
              so the drawing does not become read-only forever. */}
          {unowned && (
            <Button size="sm" onClick={board.claim}>
              Take control
            </Button>
          )}

          {board.canDraw && (
            <Button size="sm" variant="outline" onClick={board.undo}>
              <Undo2 className="h-4 w-4" aria-hidden="true" />
              Undo
            </Button>
          )}

          {board.isOwner && (
            <>
              <Button size="sm" variant="outline" onClick={board.clear}>
                <Eraser className="h-4 w-4" aria-hidden="true" />
                Clear
              </Button>
              <Button size="sm" variant="ghost" onClick={board.release} title="Hand over the pen">
                <X className="h-4 w-4" aria-hidden="true" />
                Close
              </Button>
            </>
          )}

          {!board.canDraw && !unowned && (
            <Button size="sm" variant="outline" onClick={board.requestDraw}>
              <Hand className="h-4 w-4" aria-hidden="true" />
              Ask to draw
            </Button>
          )}
        </div>
      </div>

      {/* Requests are transient nudges — only the owner ever sees them. */}
      {board.isOwner && board.requests.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/50 p-3">
          {board.requests.map((req) => (
            <div key={req.userId} className="flex items-center justify-between gap-2">
              <p className="text-sm text-foreground">
                <span className="font-semibold">{req.fullName}</span> wants to draw
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => board.grant(req.userId)}>
                  Allow
                </Button>
                <Button size="sm" variant="ghost" onClick={() => board.dismissRequest(req.userId)}>
                  Dismiss
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {board.canDraw && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            {PEN_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Pen colour ${c}`}
                aria-pressed={color === c}
                className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                  color === c ? "border-foreground" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {PEN_WIDTHS.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWidth(w)}
                aria-label={`Pen width ${w}`}
                aria-pressed={width === w}
                className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                  width === w ? "border-foreground bg-muted" : "border-border"
                }`}
              >
                <span
                  className="rounded-full bg-foreground"
                  style={{ height: w + 1, width: w + 1 }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="min-h-[320px] flex-1 overflow-hidden rounded-xl border border-border">
        <WhiteboardCanvas
          strokes={board.strokes}
          repaintToken={board.repaintToken}
          canDraw={board.canDraw}
          color={color}
          width={width}
          selfUserId={selfUserId}
          selfName={selfName}
          onChunk={board.sendChunk}
          onLocalChunk={board.applyLocalChunk}
          roomId={roomId}
        />
      </div>

      {board.isOwner && others.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-foreground-muted">Who can draw:</span>
          {others.map((p) => {
            const allowed = board.grants.includes(p.userId);
            return (
              <Button
                key={p.socketId}
                size="sm"
                variant={allowed ? "primary" : "outline"}
                onClick={() => (allowed ? board.revoke(p.userId) : board.grant(p.userId))}
              >
                {p.fullName}
                {allowed ? " ✓" : ""}
              </Button>
            );
          })}
        </div>
      )}

      {!board.canDraw && (
        <p className="text-xs text-foreground-muted">
          You can watch the board. Ask {board.ownerName ?? "whoever opens it"} for the pen to draw.
        </p>
      )}
    </div>
  );
}
