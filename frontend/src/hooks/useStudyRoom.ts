import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import {
  StudyRoomClientEvent,
  StudyRoomServerEvent,
  type ParticipantJoinedPayload,
  type ParticipantLeftPayload,
  type ReadReceiptBroadcastPayload,
  type RoomClosedPayload,
  type RoomErrorPayload,
  type RoomJoinedPayload,
  type StudyRoomMessageDto,
  type StudyRoomParticipantDto,
  type TypingBroadcastPayload,
} from "@scholarbase/shared-types";
import { apiClient } from "@/lib/api-client";
import { createStudyRoomSocket } from "@/lib/study-room-socket";

export type StudyRoomStatus = "connecting" | "connected" | "disconnected" | "error";

const TYPING_TIMEOUT_MS = 3000;

export interface UseStudyRoomResult {
  status: StudyRoomStatus;
  error: string | null;
  /** Set when the room was closed while we were in it. */
  closedMessage: string | null;
  self: StudyRoomParticipantDto | null;
  /** Everyone in the room except you. */
  participants: StudyRoomParticipantDto[];
  messages: StudyRoomMessageDto[];
  typingNames: string[];
  /** userId -> the newest message that user has read, for chat-tick state. */
  readReceipts: Record<string, { lastReadMessageId: string; lastReadAt: string }>;
  sendMessage: (body: string) => void;
  setTyping: (isTyping: boolean) => void;
  /** Advances your own read watermark and tells the room. */
  markRead: (messageId: string) => void;
  socketRef: React.MutableRefObject<Socket | null>;
}

export function useStudyRoom(roomId: string | undefined): UseStudyRoomResult {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<StudyRoomStatus>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [closedMessage, setClosedMessage] = useState<string | null>(null);
  const [self, setSelf] = useState<StudyRoomParticipantDto | null>(null);
  const [participants, setParticipants] = useState<StudyRoomParticipantDto[]>([]);
  const [messages, setMessages] = useState<StudyRoomMessageDto[]>([]);
  const [typing, setTypingState] = useState<Record<string, string>>({});
  const typingTimers = useRef<Record<string, number>>({});
  const [readReceipts, setReadReceipts] = useState<
    Record<string, { lastReadMessageId: string; lastReadAt: string }>
  >({});

  useEffect(() => {
    if (!roomId) return;

    const socket = createStudyRoomSocket();
    socketRef.current = socket;
    // StrictMode remounts this effect; `cancelled` keeps a torn-down socket
    // from writing state back into the remounted instance.
    let cancelled = false;
    let retriedAfterRefresh = false;

    const join = () => socket.emit(StudyRoomClientEvent.JOIN, { roomId });

    socket.on("connect", () => {
      if (cancelled) return;
      setStatus("connected");
      setError(null);
      join();
    });

    socket.on("disconnect", () => {
      if (cancelled) return;
      setStatus("disconnected");
    });

    socket.on("connect_error", async (err: Error) => {
      if (cancelled) return;

      // The handshake is rejected once the 15-minute access token expires.
      // Any authenticated request refreshes it via the axios interceptor, so
      // touch one and retry the connection with the new token.
      if (!retriedAfterRefresh && err.message === "Authentication failed") {
        retriedAfterRefresh = true;
        try {
          await apiClient.get("/auth/me");
          if (!cancelled) socket.connect();
          return;
        } catch {
          /* fall through to the error state below */
        }
      }

      setStatus("error");
      setError("Could not connect to the study room.");
    });

    socket.on(StudyRoomServerEvent.JOINED, (payload: RoomJoinedPayload) => {
      if (cancelled) return;
      setSelf(payload.self);
      setParticipants(payload.participants);
      setMessages(payload.recentMessages);
      setReadReceipts(
        Object.fromEntries(
          payload.readReceipts.map((receipt) => [
            receipt.userId,
            { lastReadMessageId: receipt.lastReadMessageId, lastReadAt: receipt.lastReadAt },
          ]),
        ),
      );
    });

    socket.on(StudyRoomServerEvent.PARTICIPANT_JOINED, (payload: ParticipantJoinedPayload) => {
      if (cancelled) return;
      setParticipants((prev) =>
        prev.some((p) => p.socketId === payload.participant.socketId)
          ? prev
          : [...prev, payload.participant],
      );
    });

    socket.on(StudyRoomServerEvent.PARTICIPANT_LEFT, (payload: ParticipantLeftPayload) => {
      if (cancelled) return;
      setParticipants((prev) => prev.filter((p) => p.socketId !== payload.socketId));
    });

    socket.on(StudyRoomServerEvent.MESSAGE, (message: StudyRoomMessageDto) => {
      if (cancelled) return;
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    });

    socket.on(StudyRoomServerEvent.TYPING, (payload: TypingBroadcastPayload) => {
      if (cancelled) return;

      window.clearTimeout(typingTimers.current[payload.userId]);

      if (!payload.isTyping) {
        setTypingState((prev) => {
          const next = { ...prev };
          delete next[payload.userId];
          return next;
        });
        return;
      }

      setTypingState((prev) => ({ ...prev, [payload.userId]: payload.fullName }));
      // Self-expiring: a client that disconnects mid-typing never sends the
      // matching "stopped" event, so the indicator has to time itself out.
      typingTimers.current[payload.userId] = window.setTimeout(() => {
        setTypingState((prev) => {
          const next = { ...prev };
          delete next[payload.userId];
          return next;
        });
      }, TYPING_TIMEOUT_MS);
    });

    socket.on(StudyRoomServerEvent.READ_RECEIPT, (payload: ReadReceiptBroadcastPayload) => {
      if (cancelled) return;
      setReadReceipts((prev) => ({
        ...prev,
        [payload.userId]: { lastReadMessageId: payload.lastReadMessageId, lastReadAt: payload.lastReadAt },
      }));
    });

    socket.on(StudyRoomServerEvent.CLOSED, (payload: RoomClosedPayload) => {
      if (cancelled) return;
      setClosedMessage(payload.message);
      setParticipants([]);
      // The room is gone, so stop the socket rather than let it retry a join
      // that can only fail from here on.
      socket.disconnect();
    });

    socket.on(StudyRoomServerEvent.ERROR, (payload: RoomErrorPayload) => {
      if (cancelled) return;
      setError(payload.message);
    });

    socket.connect();

    const timers = typingTimers.current;
    return () => {
      cancelled = true;
      Object.values(timers).forEach((id) => window.clearTimeout(id));
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  const sendMessage = useCallback(
    (body: string) => {
      const trimmed = body.trim();
      if (!trimmed || !roomId) return;
      socketRef.current?.emit(StudyRoomClientEvent.SEND_MESSAGE, { roomId, body: trimmed });
    },
    [roomId],
  );

  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!roomId) return;
      socketRef.current?.emit(StudyRoomClientEvent.TYPING, { roomId, isTyping });
    },
    [roomId],
  );

  const markRead = useCallback(
    (messageId: string) => {
      if (!roomId) return;
      socketRef.current?.emit(StudyRoomClientEvent.MARK_READ, { roomId, messageId });
    },
    [roomId],
  );

  const typingNames = useMemo(() => Object.values(typing), [typing]);

  return {
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
  };
}
