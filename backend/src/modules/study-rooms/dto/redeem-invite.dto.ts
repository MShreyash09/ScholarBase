import { IsString, MaxLength, MinLength } from "class-validator";
import { RedeemInviteRequestDto } from "@scholarbase/shared-types";

export class RedeemInviteDto implements RedeemInviteRequestDto {
  /** A full invite URL or the bare code — the service parses either. */
  @IsString()
  @MinLength(8)
  @MaxLength(500)
  invite!: string;
}
