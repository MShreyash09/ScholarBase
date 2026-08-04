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
import { StudyRoomDto, StudyRoomMessageDto } from "@scholarbase/shared-types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { StudyRoomsService } from "./study-rooms.service";
import { CreateStudyRoomDto } from "./dto/create-study-room.dto";
import { FindMessagesQueryDto } from "./dto/find-messages-query.dto";

/**
 * No @Public() anywhere in here: study rooms are members-only, so the global
 * JwtAuthGuard gating every route is exactly the behaviour we want. Any
 * signed-in user (student or admin) can open and join a room.
 */
@Controller("study-rooms")
export class StudyRoomsController {
  constructor(private readonly studyRoomsService: StudyRoomsService) {}

  @Get()
  findAll(): Promise<StudyRoomDto[]> {
    return this.studyRoomsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<StudyRoomDto> {
    return this.studyRoomsService.findOne(id);
  }

  @Get(":id/messages")
  findMessages(
    @Param("id") id: string,
    @Query() query: FindMessagesQueryDto,
  ): Promise<StudyRoomMessageDto[]> {
    return this.studyRoomsService.recentMessages(id, query.limit);
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
  remove(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser): Promise<void> {
    return this.studyRoomsService.remove(id, user);
  }
}
