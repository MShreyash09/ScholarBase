import { IsInt, IsString, Max, Min, MinLength } from "class-validator";
import { CreateYearLevelDto } from "@scholarbase/shared-types";

export class CreateYearLevelBodyDto implements CreateYearLevelDto {
  @IsInt()
  @Min(1)
  @Max(4)
  yearNumber!: number;

  @IsString()
  @MinLength(1)
  label!: string;
}
