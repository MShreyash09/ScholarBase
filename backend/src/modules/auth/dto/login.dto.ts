import { IsEmail, IsString } from "class-validator";
import { LoginRequestDto } from "@scholarbase/shared-types";

export class LoginDto implements LoginRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
