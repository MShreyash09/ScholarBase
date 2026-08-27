import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import {
  IceConfigDto,
  StudyRoomDto,
  StudyRoomMessageDto,
  UserRole,
} from "@scholarbase/shared-types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { StudyRoomsService } from "./study-rooms.service";
import { StudyRoomsGateway } from "./study-rooms.gateway";
import { IceServersService } from "./ice-servers.service";
import { CreateStudyRoomDto } from "./dto/create-study-room.dto";
import { RedeemInviteDto } from "./dto/redeem-invite.dto";
import { FindMessagesQueryDto } from "./dto/find-messages-query.dto";

/**
 * No @Public() anywhere in here: study rooms are members-only, so the global
 * JwtAuthGuard gating every route is exactly the behaviour we want. Private
 * rooms are additionally gated on invite membership inside the service.
 */
@Controller("study-rooms")
export class StudyRoomsController {
  constructor(
    private readonly studyRoomsService: StudyRoomsService,
    private readonly studyRoomsGateway: StudyRoomsGateway,
    private readonly iceServersService: IceServersService,
  ) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser): Promise<StudyRoomDto[]> {
    return this.studyRoomsService.findAll(user.sub);
  }

  /**
   * STUN/TURN servers for the WebRTC mesh. Declared before `:id` so the literal
   * path wins over the parameterised one. Served per request because TURN
   * credentials expire, and per user so relay usage is attributable.
   */
  @Get("ice-servers")
  getIceServers(@CurrentUser() user: AuthenticatedUser): IceConfigDto {
    return this.iceServersService.getIceConfig(user.sub);
  }

  /**
   * Every open room, for moderation. Declared before `:id` for clarity — an
   * admin needs to see private rooms they aren't a member of in order to close
   * them, which the normal lobby deliberately hides.
   */
  @Roles(UserRole.ADMIN)
  @Get("admin/all")
  findAllForModeration(): Promise<StudyRoomDto[]> {
    return this.studyRoomsService.findAllForModeration();
  }

  /** Redeems an invite link and returns the room it unlocked. */
  @Post("join")
  redeemInvite(
    @Body() dto: RedeemInviteDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StudyRoomDto> {
    return this.studyRoomsService.redeemInvite(dto.invite, user.sub);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser): Promise<StudyRoomDto> {
    return this.studyRoomsService.findOne(id, user.sub, user.role);
  }

  @Get(":id/messages")
  findMessages(
    @Param("id") id: string,
    @Query() query: FindMessagesQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StudyRoomMessageDto[]> {
    return this.studyRoomsService.messagesForUser(id, user.sub, user.role, query.limit);
  }

  @Post()
  create(
    @Body() dto: CreateStudyRoomDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StudyRoomDto> {
    return this.studyRoomsService.create(dto, user.sub);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  async remove(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.studyRoomsService.remove(id, user);

    // Only evict once the close has been authorised and persisted, so a
    // rejected attempt can't be used to disrupt a room.
    this.studyRoomsGateway.closeRoom(
      id,
      user.role === UserRole.ADMIN
        ? "This room was closed by an admin."
        : "This room was closed by its creator.",
    );
  }
}
