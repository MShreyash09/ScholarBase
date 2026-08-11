import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, IsString, IsUUID } from "class-validator";

export class FindSubjectsQueryDto {
  @IsOptional()
  @IsUUID()
  yearLevelId?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsInt()
  semester?: number;
}
