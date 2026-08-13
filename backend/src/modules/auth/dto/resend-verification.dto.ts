import { Transform } from "class-transformer";
import { IsEmail } from "class-validator";
import { ResendVerificationRequestDto } from "@scholarbase/shared-types";

export class ResendVerificationDto implements ResendVerificationRequestDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsEmail()
  email!: string;
}
