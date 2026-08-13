import { IsString, MinLength } from "class-validator";
import { VerifyEmailRequestDto } from "@scholarbase/shared-types";

export class VerifyEmailDto implements VerifyEmailRequestDto {
  @IsString()
  @MinLength(1)
  token!: string;
}
