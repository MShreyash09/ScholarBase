import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { CreateStudyRoomRequestDto } from "@scholarbase/shared-types";

export class CreateStudyRoomDto implements CreateStudyRoomRequestDto {
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  description?: string | null;
}
