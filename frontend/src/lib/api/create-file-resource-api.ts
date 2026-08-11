import type { DownloadUrlDto, FileViewUrlDto } from "@scholarbase/shared-types";
import { apiClient } from "../api-client";

/**
 * Builds the client for a file-backed resource — list by subject, get a
 * download URL, get an inline-view URL, upload.
 *
 * `papersApi` and `notesApi` used to be two hand-written copies of this exact
 * shape, differing only in the resource DTO and the URL segment. That's fine
 * for two, but it's the pattern that breaks the third time: a new file-backed
 * resource (assignments, syllabus, whatever comes next) would either copy a
 * third time or, worse, copy and quietly diverge — e.g. one gaining `getViewUrl`
 * before the others did, which is exactly what happened here before this was
 * extracted. A new resource is now `createFileResourceApi<ItsDto>("its-route")`.
 *
 * Deliberately excludes anything resource-specific (papers filter by exam
 * type + year, notes don't) — those still belong on each resource's own
 * client, built alongside a call to this factory rather than folded into it.
 */
export function createFileResourceApi<TResourceDto>(resourcePath: string) {
  return {
    listBySubject: (subjectId: string) =>
      apiClient.get<TResourceDto[]>(`/${resourcePath}`, { params: { subjectId } }).then((r) => r.data),
    getDownloadUrl: (id: string) =>
      apiClient.get<DownloadUrlDto>(`/${resourcePath}/${id}/download`).then((r) => r.data),
    getViewUrl: (id: string) =>
      apiClient.get<FileViewUrlDto>(`/${resourcePath}/${id}/view`).then((r) => r.data),
    upload: (form: FormData) =>
      apiClient.post<TResourceDto>(`/${resourcePath}`, form).then((r) => r.data),
  };
}
