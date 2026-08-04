import { IsOptional, IsString, IsUUID, MinLength } from "class-validator";
import { CreateNoteMetaDto } from "@scholarbase/shared-types";

export class CreateNoteBodyDto implements CreateNoteMetaDto {
  @IsUUID()
  subjectId!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  unitTopic?: string | null;
}
