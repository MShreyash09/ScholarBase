import { useCallback, useEffect, useRef } from "react";
import type { WhiteboardStroke } from "@scholarbase/shared-types";
import { WHITEBOARD_FLUSH_MS, newStrokeId } from "@/hooks/useWhiteboard";

interface WhiteboardCanvasProps {
  strokes: WhiteboardStroke[];
  /** Changes when strokes change structurally (sync/undo/clear) → full repaint. */
  repaintToken: number;
  canDraw: boolean;
  color: string;
  width: number;
  selfUserId: string | undefined;
  selfName: string;
  onChunk: (chunk: {
    strokeId: string;
    color: string;
    width: number;
    points: number[];
    done: boolean;
  }) => void;
  onLocalChunk: (chunk: {
    roomId: string;
    strokeId: string;
    color: string;
    width: number;
    points: number[];
    done: boolean;
    authorId: string;
    authorName: string;
  }) => void;
  roomId: string;
}

/**
 * The drawing surface.
 *
 * Coordinates are stored normalized 0–1 and only converted to pixels at paint
 * time, so the same board renders correctly on every participant's screen
 * regardless of window size — the alternative, sending pixels, puts the line in
 * a different place for everyone but the author.
 *
 * Repainting every stroke on every incoming chunk would get slow on a busy
 * board, so incoming points are drawn incrementally and a full repaint happens
 * only when the stroke list changes shape (undo, clear, joining late, resize).
 */
export function WhiteboardCanvas({
  strokes,
  repaintToken,
  canDraw,
  color,
  width,
  selfUserId,
  selfName,
  onChunk,
  onLocalChunk,
  roomId,
}: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<WhiteboardStroke[]>(strokes);
  strokesRef.current = strokes;

  // Live stroke being drawn by this user.
  const drawingRef = useRef<{ id: string; buffer: number[]; last: [number, number] | null } | null>(
    null,
  );
  const flushTimerRef = useRef<number | null>(null);

  const paintStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: WhiteboardStroke) => {
    const { width: w, height: h } = ctx.canvas;
    const pts = stroke.points;
    if (pts.length < 2) return;

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0] * w, pts[1] * h);
    for (let i = 2; i < pts.length; i += 2) {
      ctx.lineTo(pts[i] * w, pts[i + 1] * h);
    }
    ctx.stroke();
  }, []);

  const repaint = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const stroke of strokesRef.current) paintStroke(ctx, stroke);
  }, [paintStroke]);

  // Size the backing store to the element in device pixels, or lines look
  // blurry on high-DPI screens. Normalized coordinates make resize a repaint.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const nextW = Math.max(1, Math.round(rect.width * dpr));
      const nextH = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
      }
      repaint();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [repaint]);

  // Structural change — repaint everything.
  useEffect(() => {
    repaint();
  }, [repaintToken, repaint]);

  // Incremental: new chunks arriving while nothing structural changed. Cheap
  // enough to just repaint the affected strokes rather than diffing segments.
  useEffect(() => {
    repaint();
  }, [strokes, repaint]);

  const toNormalized = useCallback((e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    // Clamp: a fast drag can report a point a pixel outside the element, and
    // the server rejects anything beyond 0–1.
    return [Math.min(Math.max(x, 0), 1), Math.min(Math.max(y, 0), 1)];
  }, []);

  const flush = useCallback(
    (done: boolean) => {
      const live = drawingRef.current;
      if (!live || live.buffer.length === 0) {
        if (done && live) {
          onChunk({ strokeId: live.id, color, width, points: [], done: true });
        }
        return;
      }

      const points = live.buffer;
      live.buffer = [];

      onChunk({ strokeId: live.id, color, width, points, done });
      // Echo to ourselves — the server deliberately does not send our own
      // strokes back, so this is what makes the line appear as we draw.
      onLocalChunk({
        roomId,
        strokeId: live.id,
        color,
        width,
        points,
        done,
        authorId: selfUserId ?? "",
        authorName: selfName,
      });
    },
    [color, onChunk, onLocalChunk, roomId, selfName, selfUserId, width],
  );

  const stopFlushTimer = useCallback(() => {
    if (flushTimerRef.current !== null) {
      window.clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!canDraw) return;
      e.currentTarget.setPointerCapture(e.pointerId);

      const point = toNormalized(e);
      drawingRef.current = { id: newStrokeId(), buffer: [...point], last: point };

      stopFlushTimer();
      flushTimerRef.current = window.setInterval(() => flush(false), WHITEBOARD_FLUSH_MS);
    },
    [canDraw, flush, stopFlushTimer, toNormalized],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const live = drawingRef.current;
      if (!canDraw || !live) return;

      const [x, y] = toNormalized(e);
      // Drop sub-pixel jitter so a slow hand doesn't emit hundreds of points.
      if (live.last) {
        const dx = x - live.last[0];
        const dy = y - live.last[1];
        if (dx * dx + dy * dy < 0.000004) return;
      }
      live.last = [x, y];
      live.buffer.push(x, y);
    },
    [canDraw, toNormalized],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) return;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Capture may already be gone if the pointer left the window.
      }
      stopFlushTimer();
      flush(true);
      drawingRef.current = null;
    },
    [flush, stopFlushTimer],
  );

  useEffect(() => stopFlushTimer, [stopFlushTimer]);

  return (
    <canvas
      ref={canvasRef}
      className={`h-full w-full touch-none rounded-xl bg-white ${
        canDraw ? "cursor-crosshair" : "cursor-not-allowed"
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-label="Shared whiteboard"
      role="img"
    />
  );
}
