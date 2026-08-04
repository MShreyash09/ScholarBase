import { IsString, MinLength } from "class-validator";
import { CreateExamTypeDto } from "@scholarbase/shared-types";

export class CreateExamTypeBodyDto implements CreateExamTypeDto {
  @IsString()
  @MinLength(1)
  name!: string;
}
