import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface VideoTileProps {
  stream: MediaStream | null;
  label: string;
  isSelf?: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

export function VideoTile({ stream, label, isSelf = false, audioEnabled, videoEnabled }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (el && el.srcObject !== stream) {
      el.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-neutral-900">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        // Never play your own mic back through your speakers.
        muted={isSelf}
        className={cn("h-full w-full object-cover", !videoEnabled && "invisible")}
      />

      {!videoEnabled && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-700 text-lg font-bold text-white">
            {label.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
        <span className="truncate text-xs font-semibold text-white">
          {label}
          {isSelf && " (you)"}
        </span>
        {!audioEnabled && (
          <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
            Muted
          </span>
        )}
      </div>
    </div>
  );
}
