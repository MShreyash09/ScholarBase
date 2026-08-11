import { IsEmail } from "class-validator";
import { ForgotPasswordRequestDto } from "@scholarbase/shared-types";

export class ForgotPasswordDto implements ForgotPasswordRequestDto {
  @IsEmail()
  email!: string;
}
