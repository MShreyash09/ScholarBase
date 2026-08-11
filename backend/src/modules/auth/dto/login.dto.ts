import { Transform } from "class-transformer";
import { IsEmail, IsString } from "class-validator";
import { LoginRequestDto } from "@scholarbase/shared-types";

export class LoginDto implements LoginRequestDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
