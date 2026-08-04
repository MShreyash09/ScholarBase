import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { CreateStudyRoomRequestDto, StudyRoomVisibility } from "@scholarbase/shared-types";

export class CreateStudyRoomDto implements CreateStudyRoomRequestDto {
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  description?: string | null;

  /** Omitted means private — rooms are invite-only unless asked otherwise. */
  @IsOptional()
  @IsEnum(StudyRoomVisibility)
  visibility?: StudyRoomVisibility;
}
