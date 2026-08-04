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
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { DownloadUrlDto, NoteDto, UserRole } from "@scholarbase/shared-types";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { MAX_UPLOAD_SIZE_BYTES } from "../../common/constants/uploads";
import { NotesService } from "./notes.service";
import { CreateNoteBodyDto } from "./dto/create-note.dto";
import { FindNotesQueryDto } from "./dto/find-notes-query.dto";

@Controller("notes")
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Public()
  @Get()
  findAll(@Query() query: FindNotesQueryDto): Promise<NoteDto[]> {
    return this.notesService.findAll(query);
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string): Promise<NoteDto> {
    return this.notesService.findOne(id);
  }

  // Intentionally NOT @Public(): the global JwtAuthGuard requires a logged-in
  // user here, which is the one action that's gated for notes (§3 of the plan).
  @Get(":id/download")
  getDownloadUrl(@Param("id") id: string): Promise<DownloadUrlDto> {
    return this.notesService.getDownloadUrl(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: MAX_UPLOAD_SIZE_BYTES } }))
  create(
    @Body() dto: CreateNoteBodyDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NoteDto> {
    return this.notesService.create(dto, file, user.sub);
  }

  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  remove(@Param("id") id: string): Promise<void> {
    return this.notesService.remove(id);
  }
}
