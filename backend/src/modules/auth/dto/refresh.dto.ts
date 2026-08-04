import { IsString } from "class-validator";
import { RefreshRequestDto } from "@scholarbase/shared-types";

export class RefreshDto implements RefreshRequestDto {
  @IsString()
  refreshToken!: string;
}
