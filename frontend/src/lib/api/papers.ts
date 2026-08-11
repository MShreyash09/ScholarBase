import type { QuestionPaperDto } from "@scholarbase/shared-types";
import { createFileResourceApi } from "./create-file-resource-api";

export const papersApi = createFileResourceApi<QuestionPaperDto>("papers");
