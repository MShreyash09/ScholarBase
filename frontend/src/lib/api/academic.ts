import type {
  CreateSubjectDto,
  CreateYearLevelDto,
  SubjectDto,
  YearLevelDto,
} from "@scholarbase/shared-types";
import { apiClient } from "../api-client";

export const yearLevelsApi = {
  list: () => apiClient.get<YearLevelDto[]>("/year-levels").then((r) => r.data),
  create: (body: CreateYearLevelDto) =>
    apiClient.post<YearLevelDto>("/year-levels", body).then((r) => r.data),
};

export const subjectsApi = {
  listByYear: (yearLevelId: string) =>
    apiClient.get<SubjectDto[]>("/subjects", { params: { yearLevelId } }).then((r) => r.data),
  list: (params: { yearLevelId?: string; department?: string; semester?: number }) =>
    apiClient.get<SubjectDto[]>("/subjects", { params }).then((r) => r.data),
  get: (id: string) => apiClient.get<SubjectDto>(`/subjects/${id}`).then((r) => r.data),
  create: (body: CreateSubjectDto) =>
    apiClient.post<SubjectDto>("/subjects", body).then((r) => r.data),
};
