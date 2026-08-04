import { Type } from "class-transformer";
import { IsInt, IsUUID, Max, Min } from "class-validator";
import { CreateQuestionPaperMetaDto } from "@scholarbase/shared-types";

export class CreateQuestionPaperBodyDto implements CreateQuestionPaperMetaDto {
  @IsUUID()
  subjectId!: string;

  @IsUUID()
  examTypeId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  academicYear!: number;
}
