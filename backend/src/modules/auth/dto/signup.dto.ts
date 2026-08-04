import { IsEmail, IsString, MinLength } from "class-validator";
import { SignupRequestDto } from "@scholarbase/shared-types";

export class SignupDto implements SignupRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(1)
  fullName!: string;
}
