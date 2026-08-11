import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, IsUUID } from "class-validator";

export class FindPapersQueryDto {
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @IsOptional()
  @IsUUID()
  examTypeId?: string;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsInt()
  academicYear?: number;
}
