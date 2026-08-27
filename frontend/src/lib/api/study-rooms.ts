import {
  STUDY_ROOM_INVITE_PATH,
  type CreateStudyRoomRequestDto,
  type StudyRoomDto,
  type StudyRoomMessageDto,
} from "@scholarbase/shared-types";
import { apiClient } from "../api-client";

/** Builds the shareable link for a room the current user is allowed to invite to. */
export function buildInviteUrl(inviteCode: string): string {
  return `${window.location.origin}${STUDY_ROOM_INVITE_PATH}/${inviteCode}`;
}

export const studyRoomsApi = {
  list: () => apiClient.get<StudyRoomDto[]>("/study-rooms").then((r) => r.data),
  redeemInvite: (invite: string) =>
    apiClient.post<StudyRoomDto>("/study-rooms/join", { invite }).then((r) => r.data),
  /** Admin-only: every open room, including private ones, for moderation. */
  listAllForAdmin: () =>
    apiClient.get<StudyRoomDto[]>("/study-rooms/admin/all").then((r) => r.data),
  get: (id: string) => apiClient.get<StudyRoomDto>(`/study-rooms/${id}`).then((r) => r.data),
  messages: (id: string) =>
    apiClient.get<StudyRoomMessageDto[]>(`/study-rooms/${id}/messages`).then((r) => r.data),
  create: (body: CreateStudyRoomRequestDto) =>
    apiClient.post<StudyRoomDto>("/study-rooms", body).then((r) => r.data),
  close: (id: string) => apiClient.delete<void>(`/study-rooms/${id}`).then((r) => r.data),
  getDailyUrl: (id: string) => 
    apiClient.get<{ url: string }>(`/study-rooms/${id}/daily-room`).then((r) => r.data),
};
