import { IsOptional, IsUUID } from "class-validator";

export class FindNotesQueryDto {
  @IsOptional()
  @IsUUID()
  subjectId?: string;
}
