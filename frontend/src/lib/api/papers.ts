import type { DownloadUrlDto, QuestionPaperDto } from "@scholarbase/shared-types";
import { apiClient } from "../api-client";

export const papersApi = {
  listBySubject: (subjectId: string) =>
    apiClient.get<QuestionPaperDto[]>("/papers", { params: { subjectId } }).then((r) => r.data),
  getDownloadUrl: (id: string) =>
    apiClient.get<DownloadUrlDto>(`/papers/${id}/download`).then((r) => r.data),
  upload: (form: FormData) =>
    apiClient
      .post<QuestionPaperDto>("/papers", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),
};
