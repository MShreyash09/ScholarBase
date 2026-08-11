import { IsString, MinLength } from "class-validator";
import { MIN_PASSWORD_LENGTH, ResetPasswordRequestDto } from "@scholarbase/shared-types";

export class ResetPasswordDto implements ResetPasswordRequestDto {
  @IsString()
  @MinLength(1)
  token!: string;

  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  password!: string;
}
