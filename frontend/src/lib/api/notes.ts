import type { DownloadUrlDto, NoteDto } from "@scholarbase/shared-types";
import { apiClient } from "../api-client";

export const notesApi = {
  listBySubject: (subjectId: string) =>
    apiClient.get<NoteDto[]>("/notes", { params: { subjectId } }).then((r) => r.data),
  getDownloadUrl: (id: string) =>
    apiClient.get<DownloadUrlDto>(`/notes/${id}/download`).then((r) => r.data),
  upload: (form: FormData) =>
    apiClient
      .post<NoteDto>("/notes", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data),
};
