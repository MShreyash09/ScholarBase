import { IsInt, IsOptional, IsString, IsUUID, MinLength } from "class-validator";
import { CreateSubjectDto } from "@scholarbase/shared-types";

export class CreateSubjectBodyDto implements CreateSubjectDto {
  @IsUUID()
  yearLevelId!: string;

  @IsString()
  @MinLength(1)
  code!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  department?: string | null;

  @IsOptional()
  @IsInt()
  semester?: number | null;

  @IsOptional()
  @IsInt()
  credits?: number | null;
}
