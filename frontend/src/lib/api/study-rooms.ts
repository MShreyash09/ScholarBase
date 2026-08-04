import type {
  CreateStudyRoomRequestDto,
  StudyRoomDto,
  StudyRoomMessageDto,
} from "@scholarbase/shared-types";
import { apiClient } from "../api-client";

export const studyRoomsApi = {
  list: () => apiClient.get<StudyRoomDto[]>("/study-rooms").then((r) => r.data),
  get: (id: string) => apiClient.get<StudyRoomDto>(`/study-rooms/${id}`).then((r) => r.data),
  messages: (id: string) =>
    apiClient.get<StudyRoomMessageDto[]>(`/study-rooms/${id}/messages`).then((r) => r.data),
  create: (body: CreateStudyRoomRequestDto) =>
    apiClient.post<StudyRoomDto>("/study-rooms", body).then((r) => r.data),
  close: (id: string) => apiClient.delete<void>(`/study-rooms/${id}`).then((r) => r.data),
};
