import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import type { Socket } from "socket.io-client";
import {
  SCREEN_POINTER_STALE_MS,
  SCREEN_POINTER_THROTTLE_MS,
  StudyRoomClientEvent,
  StudyRoomServerEvent,
  type ScreenPointerBroadcastPayload,
} from "@scholarbase/shared-types";

export interface RemotePointer {
  socketId: string;
  fullName: string;
  x: number;
  y: number;
  at: number;
}

/**
 * The shared laser pointer over a screen share.
 *
 * Worth being clear about what this is and is not: a web page cannot read the
 * operating system cursor outside itself, so this does not track a presenter's
 * real mouse while they work in another window — that is a browser security
 * boundary. What it does is let anyone point at the shared picture *as shown in
 * ScholarBase*, which covers both "let me highlight this line" from the person
 * presenting and "what's that?" from someone watching.
 *
 * Positions are transient. Nothing is stored server-side, and a pointer that
 * stops updating is dropped, so a dot can never be left frozen on everyone's
 * screen by a dropped connection.
 */
export function useScreenPointer(
  roomId: string | undefined,
  socketRef: MutableRefObject<Socket | null>,
  connected: boolean,
) {
  const [pointers, setPointers] = useState<RemotePointer[]>([]);
  const lastSentAt = useRef(0);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !connected) return;

    const onPointer = (p: ScreenPointerBroadcastPayload) => {
      if (p.roomId !== roomId) return;

      setPointers((prev) => {
        const others = prev.filter((x) => x.socketId !== p.socketId);
        // `visible: false` is the retraction sent when a cursor leaves the video.
        if (!p.visible) return others;
        return [
          ...others,
          { socketId: p.socketId, fullName: p.fullName, x: p.x, y: p.y, at: Date.now() },
        ];
      });
    };

    socket.on(StudyRoomServerEvent.SCREEN_POINTER, onPointer);
    return () => {
      socket.off(StudyRoomServerEvent.SCREEN_POINTER, onPointer);
    };
  }, [connected, roomId, socketRef]);

  // Drop pointers that stopped updating — a dropped connection never sends the
  // retraction, and a stale dot is worse than no dot.
  useEffect(() => {
    if (pointers.length === 0) return;
    const timer = window.setInterval(() => {
      const cutoff = Date.now() - SCREEN_POINTER_STALE_MS;
      setPointers((prev) => prev.filter((p) => p.at >= cutoff));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [pointers.length]);

  const send = useCallback(
    (x: number, y: number, visible: boolean) => {
      if (!roomId) return;
      const socket = socketRef.current;
      if (!socket) return;

      const now = Date.now();
      // A retraction must always go out; movement is throttled.
      if (visible) {
        if (now - lastSentAt.current < SCREEN_POINTER_THROTTLE_MS) return;
        // Skip a resend when the pointer has not actually moved.
        const last = lastPos.current;
        if (last && Math.abs(last.x - x) < 0.001 && Math.abs(last.y - y) < 0.001) return;
        lastPos.current = { x, y };
      } else {
        lastPos.current = null;
      }

      lastSentAt.current = now;
      socket.emit(StudyRoomClientEvent.SCREEN_POINTER, { roomId, x, y, visible });
    },
    [roomId, socketRef],
  );

  const clear = useCallback(() => {
    setPointers([]);
  }, []);

  return { pointers, send, clear };
}
