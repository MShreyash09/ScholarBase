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
  /** True once the participant has published a media stream to the room. */
  inCall: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

/** Events the browser sends to the server. */
export enum StudyRoomClientEvent {
  JOIN = "room:join",
  LEAVE = "room:leave",
  SEND_MESSAGE = "chat:send",
  TYPING = "chat:typing",
  SIGNAL = "webrtc:signal",
  MEDIA_STATE = "media:state",
}

/** Events the server pushes to the browser. */
export enum StudyRoomServerEvent {
  JOINED = "room:joined",
  PARTICIPANT_JOINED = "room:participant-joined",
  PARTICIPANT_LEFT = "room:participant-left",
  MESSAGE = "chat:message",
  TYPING = "chat:typing",
  SIGNAL = "webrtc:signal",
  MEDIA_STATE = "media:state",
  /** The room was closed under us — moderation, or the creator ending it. */
  CLOSED = "room:closed",
  ERROR = "room:error",
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

export type SignalKind = "offer" | "answer" | "ice-candidate";

/**
 * WebRTC signalling envelope. The server only routes these between two sockets
 * in the same room — `data` (SDP or ICE candidate) is opaque to it.
 */
export interface SignalPayload {
  roomId: string;
  targetSocketId: string;
  kind: SignalKind;
  data: unknown;
}

export interface SignalBroadcastPayload {
  roomId: string;
  fromSocketId: string;
  fromUserId: string;
  fromName: string;
  kind: SignalKind;
  data: unknown;
}

export interface MediaStatePayload {
  roomId: string;
  inCall: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

export interface MediaStateBroadcastPayload extends MediaStatePayload {
  socketId: string;
  userId: string;
}

export interface RoomErrorPayload {
  message: string;
}
