import { UserRole } from "./enums";

// Socket.io namespace the study-room gateway is mounted on.
export const STUDY_ROOM_NAMESPACE = "/study-rooms";

export const STUDY_ROOM_MESSAGE_MAX_LENGTH = 2000;

export interface StudyRoomDto {
  id: string;
  name: string;
  description: string | null;
  createdById: string;
  createdByName: string;
  isActive: boolean;
  /** Live count from the gateway's presence registry, not a stored column. */
  participantCount: number;
  createdAt: string;
}

export interface CreateStudyRoomRequestDto {
  name: string;
  description?: string | null;
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
  ERROR = "room:error",
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
