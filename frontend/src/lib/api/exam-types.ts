import type { CreateExamTypeDto, ExamTypeDto } from "@scholarbase/shared-types";
import { apiClient } from "../api-client";

export const examTypesApi = {
  list: () => apiClient.get<ExamTypeDto[]>("/exam-types").then((r) => r.data),
  create: (body: CreateExamTypeDto) =>
    apiClient.post<ExamTypeDto>("/exam-types", body).then((r) => r.data),
};
