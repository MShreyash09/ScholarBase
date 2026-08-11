import type { NoteDto } from "@scholarbase/shared-types";
import { createFileResourceApi } from "./create-file-resource-api";

export const notesApi = createFileResourceApi<NoteDto>("notes");
