import { useCallback, useEffect, useMemo, useState, type MutableRefObject } from "react";
import type { Socket } from "socket.io-client";
import {
  StudyRoomClientEvent,
  StudyRoomServerEvent,
  type WhiteboardDrawRequestedPayload,
  type WhiteboardGrantsPayload,
  type WhiteboardStateDto,
  type WhiteboardStroke,
  type WhiteboardStrokeBroadcastPayload,
  type WhiteboardUndoBroadcastPayload,
} from "@scholarbase/shared-types";

export interface PendingDrawRequest {
  userId: string;
  fullName: string;
  at: number;
}

/**
 * Client half of the shared whiteboard.
 *
 * Board state lives on the server and arrives over the same socket as chat and
 * signalling, so it works for students whose peer connection never establishes —
 * nothing here touches WebRTC.
 *
 * The server does NOT echo your own strokes back to you: the drawer renders
 * locally as the pointer moves, and an echo would fight the in-progress line.
 * So local strokes are appended here, remote ones arrive by event.
 */
export function useWhiteboard(
  roomId: string | undefined,
  socketRef: MutableRefObject<Socket | null>,
  connected: boolean,
  selfUserId: string | undefined,
  selfSocketId: string | undefined,
) {
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>([]);
  const [ownerSocketId, setOwnerSocketId] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [grants, setGrants] = useState<string[]>([]);
  const [requests, setRequests] = useState<PendingDrawRequest[]>([]);
  /** Bumped whenever strokes change structurally (sync/undo/clear) so the
   * canvas knows a full repaint is needed rather than an incremental draw. */
  const [repaintToken, setRepaintToken] = useState(0);

  const isOwner = Boolean(selfSocketId && ownerSocketId === selfSocketId);
  const canDraw = isOwner || Boolean(selfUserId && grants.includes(selfUserId));
  const isOpen = ownerSocketId !== null || strokes.length > 0;

  const emit = useCallback(
    (event: StudyRoomClientEvent, payload: Record<string, unknown>) => {
      if (!roomId) return;
      socketRef.current?.emit(event, { roomId, ...payload });
    },
    [roomId, socketRef],
  );

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !connected) return;

    const onState = (payload: WhiteboardStateDto) => {
      if (payload.roomId !== roomId) return;
      setStrokes(payload.strokes);
      setOwnerSocketId(payload.ownerSocketId);
      setOwnerName(payload.ownerName);
      setGrants(payload.grants);
      setRepaintToken((n) => n + 1);
    };

    const onStroke = (payload: WhiteboardStrokeBroadcastPayload) => {
      if (payload.roomId !== roomId) return;
      setStrokes((prev) => appendChunk(prev, payload));
    };

    const onUndo = (payload: WhiteboardUndoBroadcastPayload) => {
      if (payload.roomId !== roomId) return;
      setStrokes((prev) => prev.filter((s) => s.id !== payload.strokeId));
      setRepaintToken((n) => n + 1);
    };

    const onCleared = (payload: { roomId: string }) => {
      if (payload.roomId !== roomId) return;
      setStrokes([]);
      setRepaintToken((n) => n + 1);
    };

    const onGrants = (payload: WhiteboardGrantsPayload) => {
      if (payload.roomId !== roomId) return;
      setOwnerSocketId(payload.ownerSocketId);
      setOwnerName(payload.ownerName);
      setGrants(payload.grants);
    };

    const onRequested = (payload: WhiteboardDrawRequestedPayload) => {
      if (payload.roomId !== roomId) return;
      setRequests((prev) =>
        // One pending entry per person, refreshed if they ask again.
        [
          ...prev.filter((r) => r.userId !== payload.userId),
          { userId: payload.userId, fullName: payload.fullName, at: Date.now() },
        ],
      );
    };

    socket.on(StudyRoomServerEvent.WHITEBOARD_STATE, onState);
    socket.on(StudyRoomServerEvent.WHITEBOARD_STROKE, onStroke);
    socket.on(StudyRoomServerEvent.WHITEBOARD_UNDO, onUndo);
    socket.on(StudyRoomServerEvent.WHITEBOARD_CLEARED, onCleared);
    socket.on(StudyRoomServerEvent.WHITEBOARD_GRANTS, onGrants);
    socket.on(StudyRoomServerEvent.WHITEBOARD_DRAW_REQUESTED, onRequested);

    return () => {
      socket.off(StudyRoomServerEvent.WHITEBOARD_STATE, onState);
      socket.off(StudyRoomServerEvent.WHITEBOARD_STROKE, onStroke);
      socket.off(StudyRoomServerEvent.WHITEBOARD_UNDO, onUndo);
      socket.off(StudyRoomServerEvent.WHITEBOARD_CLEARED, onCleared);
      socket.off(StudyRoomServerEvent.WHITEBOARD_GRANTS, onGrants);
      socket.off(StudyRoomServerEvent.WHITEBOARD_DRAW_REQUESTED, onRequested);
    };
  }, [connected, roomId, socketRef]);

  /** Applied to our own chunks too, so the drawer sees their line immediately. */
  const applyLocalChunk = useCallback((chunk: WhiteboardStrokeBroadcastPayload) => {
    setStrokes((prev) => appendChunk(prev, chunk));
  }, []);

  const claim = useCallback(() => emit(StudyRoomClientEvent.WHITEBOARD_CLAIM, {}), [emit]);
  const release = useCallback(() => emit(StudyRoomClientEvent.WHITEBOARD_RELEASE, {}), [emit]);
  const clear = useCallback(() => emit(StudyRoomClientEvent.WHITEBOARD_CLEAR, {}), [emit]);
  const undo = useCallback(() => emit(StudyRoomClientEvent.WHITEBOARD_UNDO, {}), [emit]);
  const requestDraw = useCallback(
    () => emit(StudyRoomClientEvent.WHITEBOARD_REQUEST_DRAW, {}),
    [emit],
  );

  const grant = useCallback(
    (userId: string) => {
      emit(StudyRoomClientEvent.WHITEBOARD_GRANT, { userId });
      setRequests((prev) => prev.filter((r) => r.userId !== userId));
    },
    [emit],
  );

  const revoke = useCallback(
    (userId: string) => emit(StudyRoomClientEvent.WHITEBOARD_REVOKE, { userId }),
    [emit],
  );

  const dismissRequest = useCallback((userId: string) => {
    setRequests((prev) => prev.filter((r) => r.userId !== userId));
  }, []);

  const sendChunk = useCallback(
    (chunk: { strokeId: string; color: string; width: number; points: number[]; done: boolean }) => {
      emit(StudyRoomClientEvent.WHITEBOARD_STROKE, chunk);
    },
    [emit],
  );

  return useMemo(
    () => ({
      strokes,
      repaintToken,
      ownerSocketId,
      ownerName,
      grants,
      requests,
      isOwner,
      canDraw,
      isOpen,
      claim,
      release,
      clear,
      undo,
      grant,
      revoke,
      requestDraw,
      dismissRequest,
      sendChunk,
      applyLocalChunk,
    }),
    [
      strokes,
      repaintToken,
      ownerSocketId,
      ownerName,
      grants,
      requests,
      isOwner,
      canDraw,
      isOpen,
      claim,
      release,
      clear,
      undo,
      grant,
      revoke,
      requestDraw,
      dismissRequest,
      sendChunk,
      applyLocalChunk,
    ],
  );
}

/** Adds a chunk to the matching stroke, or starts it if this is its first. */
function appendChunk(
  prev: WhiteboardStroke[],
  chunk: WhiteboardStrokeBroadcastPayload,
): WhiteboardStroke[] {
  const index = prev.findIndex((s) => s.id === chunk.strokeId);
  if (index === -1) {
    return [
      ...prev,
      {
        id: chunk.strokeId,
        authorId: chunk.authorId,
        authorName: chunk.authorName,
        color: chunk.color,
        width: chunk.width,
        points: [...chunk.points],
      },
    ];
  }

  const next = [...prev];
  const existing = next[index];
  next[index] = { ...existing, points: [...existing.points, ...chunk.points] };
  return next;
}

/** Batching interval for outgoing points. Emitting per pointermove floods the
 * gateway; ~30ms keeps the line smooth while collapsing many moves into one
 * frame. */
export const WHITEBOARD_FLUSH_MS = 30;

/** Small helper the canvas uses to keep an id stable for one stroke. */
export function newStrokeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export type UseWhiteboard = ReturnType<typeof useWhiteboard>;
