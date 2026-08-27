import { StudyRoomVisibility, UserRole } from "./enums";

// Socket.io namespace the study-room gateway is mounted on.
export const STUDY_ROOM_NAMESPACE = "/study-rooms";

export const STUDY_ROOM_MESSAGE_MAX_LENGTH = 2000;

/** Path an invite link points at, e.g. /study-rooms/join/AbC123... */
export const STUDY_ROOM_INVITE_PATH = "/study-rooms/join";

/**
 * Pulls the invite code out of whatever the user pasted — a full link, a link
 * with a query string or trailing slash, or the bare code. Shared so the
 * browser and the API agree on what counts as a valid invite.
 */
export function parseInviteCode(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Strip any query/fragment, then take the last non-empty path segment.
  const withoutQuery = trimmed.split(/[?#]/)[0];
  const segment = withoutQuery.split("/").filter(Boolean).pop() ?? "";

  return /^[A-Za-z0-9_-]{8,64}$/.test(segment) ? segment : null;
}

export interface StudyRoomDto {
  id: string;
  name: string;
  description: string | null;
  createdById: string;
  createdByName: string;
  visibility: StudyRoomVisibility;
  /**
   * The secret half of the invite link. Only ever populated for the creator and
   * for users who already redeemed the invite — null for everyone else, so a
   * public room listing can never leak a way in.
   */
  inviteCode: string | null;
  isActive: boolean;
  /** Live count from the gateway's presence registry, not a stored column. */
  participantCount: number;
  createdAt: string;
}

export interface CreateStudyRoomRequestDto {
  name: string;
  description?: string | null;
  visibility?: StudyRoomVisibility;
}

/** Accepts either a full invite URL or the bare code pasted on its own. */
export interface RedeemInviteRequestDto {
  invite: string;
}

export interface StudyRoomMessageDto {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
  /**
   * Whether anyone else was actually present in the room when this was sent.
   * A message replayed from history (`recentMessages`) is always `true` — it
   * is already sitting in the database, which is delivery enough for display
   * purposes. A message arriving live is `true` only if the gateway found
   * another participant in the room at broadcast time, mirroring the honest
   * limit of a fire-and-forget room broadcast: it is presence, not a
   * per-device receipt.
   */
  delivered: boolean;
}

/**
 * "This user has seen everything in this room up to this message." One
 * watermark per (room, user), not one row per message per reader — the tick
 * state of every message is derived by comparing timestamps against it.
 */
export interface StudyRoomReadReceiptDto {
  userId: string;
  lastReadMessageId: string;
  lastReadAt: string;
}

/**
 * A connected socket in a room. `socketId` is the addressing unit for WebRTC:
 * one user with two tabs open is two participants with two peer connections.
 */
export interface StudyRoomParticipantDto {
  socketId: string;
  userId: string;
  fullName: string;
  role: UserRole;
  /**
   * True when this participant is an admin present via oversight rather than
   * membership — i.e. they entered a room they were not invited to. This is
   * shown in the UI on purpose: admin presence is never hidden from the room.
   */
  isModerator: boolean;
}

/** Events the browser sends to the server. */
export enum StudyRoomClientEvent {
  JOIN = "room:join",
  LEAVE = "room:leave",
  SEND_MESSAGE = "chat:send",
  TYPING = "chat:typing",
  MARK_READ = "chat:read",
  WHITEBOARD_CLAIM = "whiteboard:claim",
  WHITEBOARD_RELEASE = "whiteboard:release",
  WHITEBOARD_STROKE = "whiteboard:stroke",
  WHITEBOARD_UNDO = "whiteboard:undo",
  WHITEBOARD_CLEAR = "whiteboard:clear",
  WHITEBOARD_REQUEST_DRAW = "whiteboard:request-draw",
  WHITEBOARD_GRANT = "whiteboard:grant",
  WHITEBOARD_REVOKE = "whiteboard:revoke",
}

/** Events the server pushes to the browser. */
export enum StudyRoomServerEvent {
  JOINED = "room:joined",
  PARTICIPANT_JOINED = "room:participant-joined",
  PARTICIPANT_LEFT = "room:participant-left",
  MESSAGE = "chat:message",
  TYPING = "chat:typing",
  READ_RECEIPT = "chat:read-receipt",
  /** The room was closed under us — moderation, or the creator ending it. */
  CLOSED = "room:closed",
  ERROR = "room:error",
  /** Full board sync: sent on join, and to whoever opens the board. */
  WHITEBOARD_STATE = "whiteboard:state",
  WHITEBOARD_STROKE = "whiteboard:stroke",
  WHITEBOARD_UNDO = "whiteboard:undo",
  WHITEBOARD_CLEARED = "whiteboard:cleared",
  /** Only ever sent to the board owner. */
  WHITEBOARD_DRAW_REQUESTED = "whiteboard:draw-requested",
  WHITEBOARD_GRANTS = "whiteboard:grants",
}

// --- whiteboard ------------------------------------------------------------

/** How long an empty room keeps its board before it is wiped.
 *
 * Not instant on purpose. "Everyone left" and "the last two people reloaded at
 * the same moment" look identical to the server, and losing a board mid-session
 * is far worse than a stale board lingering for a couple of minutes. */
export const WHITEBOARD_EMPTY_ROOM_GRACE_MS = 2 * 60 * 1000;

/** Hard cap on stored strokes per room, so a long session cannot grow the
 * in-memory board without bound. Oldest strokes are dropped first. */
export const WHITEBOARD_MAX_STROKES = 3000;

/** Points accepted in a single stroke chunk. Clients batch on a timer rather
 * than emitting per pointermove; this bounds a malicious or buggy client. */
export const WHITEBOARD_MAX_POINTS_PER_CHUNK = 512;

export const WHITEBOARD_MAX_STROKE_WIDTH = 24;

/**
 * One drawn line.
 *
 * `points` is a flat [x0,y0,x1,y1,…] list in **normalized 0–1 coordinates**,
 * relative to the canvas — never pixels. Participants have different window
 * sizes, so pixel coordinates would land in a different place on every screen
 * but the author's.
 */
export interface WhiteboardStroke {
  id: string;
  authorId: string;
  authorName: string;
  color: string;
  width: number;
  points: number[];
}

/** Everything a client needs to render the board from cold. */
export interface WhiteboardStateDto {
  roomId: string;
  /** socketId of the current owner, or null when the board is unclaimed. */
  ownerSocketId: string | null;
  ownerName: string | null;
  strokes: WhiteboardStroke[];
  /** userIds the owner has allowed to draw. The owner is not listed here. */
  grants: string[];
}

export interface WhiteboardClaimPayload {
  roomId: string;
}

/**
 * A chunk of an in-progress stroke. The client keeps sending chunks with the
 * same `strokeId` as the pointer moves, then a final one with `done: true`.
 * Streaming rather than sending whole strokes is what makes drawing appear
 * live to everyone else.
 */
export interface WhiteboardStrokePayload {
  roomId: string;
  strokeId: string;
  color: string;
  width: number;
  points: number[];
  done: boolean;
}

export interface WhiteboardStrokeBroadcastPayload extends WhiteboardStrokePayload {
  authorId: string;
  authorName: string;
}

export interface WhiteboardUndoPayload {
  roomId: string;
}

/** Undo is scoped to the caller's own strokes — never anyone else's. */
export interface WhiteboardUndoBroadcastPayload {
  roomId: string;
  strokeId: string;
}

export interface WhiteboardClearPayload {
  roomId: string;
}

export interface WhiteboardRequestDrawPayload {
  roomId: string;
}

/** Transient — a nudge to the owner, not stored state. */
export interface WhiteboardDrawRequestedPayload {
  roomId: string;
  userId: string;
  fullName: string;
}

export interface WhiteboardGrantPayload {
  roomId: string;
  userId: string;
}

export interface WhiteboardGrantsPayload {
  roomId: string;
  ownerSocketId: string | null;
  ownerName: string | null;
  grants: string[];
}

export interface RoomClosedPayload {
  roomId: string;
  message: string;
}

export interface JoinRoomPayload {
  roomId: string;
}

export interface LeaveRoomPayload {
  roomId: string;
}

export interface SendMessagePayload {
  roomId: string;
  body: string;
}

export interface TypingPayload {
  roomId: string;
  isTyping: boolean;
}

export interface RoomJoinedPayload {
  roomId: string;
  self: StudyRoomParticipantDto;
  participants: StudyRoomParticipantDto[];
  recentMessages: StudyRoomMessageDto[];
  /** Every member's read watermark, so tick state on old messages is right
   *  from the first render instead of waiting on a live receipt. */
  readReceipts: StudyRoomReadReceiptDto[];
}

export interface ParticipantJoinedPayload {
  roomId: string;
  participant: StudyRoomParticipantDto;
}

export interface ParticipantLeftPayload {
  roomId: string;
  socketId: string;
  userId: string;
}

export interface TypingBroadcastPayload {
  roomId: string;
  userId: string;
  fullName: string;
  isTyping: boolean;
}

export interface MarkReadPayload {
  roomId: string;
  /** The newest message this client has actually seen. */
  messageId: string;
}

export interface ReadReceiptBroadcastPayload {
  roomId: string;
  userId: string;
  lastReadMessageId: string;
  lastReadAt: string;
}
export interface RoomErrorPayload {
  message: string;
}
