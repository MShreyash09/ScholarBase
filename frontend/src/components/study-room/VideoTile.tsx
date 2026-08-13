import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { RemotePointer } from "@/hooks/useScreenPointer";
import { normalizedToOffset, pointerToNormalized } from "@/lib/video-content-rect";

interface VideoTileProps {
  stream: MediaStream | null;
  label: string;
  isSelf?: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenEnabled?: boolean;
  /** Other people's laser pointers, in normalized picture coordinates. */
  pointers?: RemotePointer[];
  /** Called as this user moves over the shared picture. */
  onPointerPosition?: (x: number, y: number, visible: boolean) => void;
}

export function VideoTile({
  stream,
  label,
  isSelf = false,
  audioEnabled,
  videoEnabled,
  screenEnabled = false,
  pointers,
  onPointerPosition,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Recomputed on move/resize so dots follow the picture rather than the box.
  const [, forceLayout] = useState(0);

  useEffect(() => {
    const el = videoRef.current;
    if (el && el.srcObject !== stream) {
      el.srcObject = stream;
    }
  }, [stream]);

  const pointerEnabled = screenEnabled && Boolean(onPointerPosition);

  // The picture's position inside the element changes with the window and with
  // the incoming resolution, so a repaint is needed on both.
  useEffect(() => {
    if (!pointerEnabled) return;
    const el = videoRef.current;
    if (!el) return;

    const bump = () => forceLayout((n) => n + 1);
    const observer = new ResizeObserver(bump);
    observer.observe(el);
    el.addEventListener("loadedmetadata", bump);
    el.addEventListener("resize", bump);
    return () => {
      observer.disconnect();
      el.removeEventListener("loadedmetadata", bump);
      el.removeEventListener("resize", bump);
    };
  }, [pointerEnabled]);

  const handleMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = videoRef.current;
      if (!el || !onPointerPosition) return;

      const point = pointerToNormalized(el, e.clientX, e.clientY);
      // null means the cursor is over a letterbox bar, not the picture.
      if (!point) return onPointerPosition(0, 0, false);
      onPointerPosition(point.x, point.y, true);
    },
    [onPointerPosition],
  );

  const handleLeave = useCallback(() => {
    onPointerPosition?.(0, 0, false);
  }, [onPointerPosition]);

  return (
    <div
      className={cn("relative overflow-hidden rounded-xl bg-neutral-900", screenEnabled ? "aspect-auto h-[50vh] sm:h-full lg:col-span-full" : "aspect-video")}
      onPointerMove={pointerEnabled ? handleMove : undefined}
      onPointerLeave={pointerEnabled ? handleLeave : undefined}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        // Never play your own mic back through your speakers.
        muted={isSelf}
        className={cn("h-full w-full", screenEnabled ? "object-contain" : "object-cover", !videoEnabled && "invisible")}
      />

      {!videoEnabled && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-700 text-lg font-bold text-white">
            {label.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Laser pointers. Positioned against the picture, not the element, so
          they land in the same spot for everyone regardless of window shape.
          pointer-events-none keeps them from swallowing the moves that produce
          them. */}
      {screenEnabled &&
        videoRef.current &&
        pointers?.map((p) => {
          const { left, top } = normalizedToOffset(videoRef.current!, p.x, p.y);
          return (
            <div
              key={p.socketId}
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left, top }}
            >
              <span className="block h-4 w-4 rounded-full bg-red-500 ring-2 ring-white/90 shadow-lg" />
              <span className="mt-1 block whitespace-nowrap rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {p.fullName}
              </span>
            </div>
          );
        })}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
        <span className="truncate text-xs font-semibold text-white">
          {label}
          {isSelf && " (you)"}
          {screenEnabled && " - Screen"}
        </span>
        <div className="flex items-center gap-1">
        {!audioEnabled && (
          <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
            Muted
          </span>
        )}
        </div>
      </div>
    </div>
  );
}
