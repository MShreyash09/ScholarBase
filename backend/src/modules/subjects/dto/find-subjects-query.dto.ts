import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, IsUUID } from "class-validator";

export class FindSubjectsQueryDto {
  @IsOptional()
  @IsUUID()
  yearLevelId?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  semester?: number;
}
