import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class FindMessagesQueryDto {
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}
