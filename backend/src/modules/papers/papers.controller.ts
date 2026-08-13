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
import { DownloadUrlDto, FileViewUrlDto, QuestionPaperDto, UserRole } from "@scholarbase/shared-types";
import { OptionalAuth } from "../../common/decorators/optional-auth.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { MAX_UPLOAD_SIZE_BYTES } from "../../common/constants/uploads";
import { PapersService } from "./papers.service";
import { CreateQuestionPaperBodyDto } from "./dto/create-question-paper.dto";
import { FindPapersQueryDto } from "./dto/find-papers-query.dto";

@Controller("papers")
export class PapersController {
  constructor(private readonly papersService: PapersService) {}

  // @OptionalAuth rather than @Public throughout: these routes still serve
  // anonymous visitors, but they need to know whether a caller is signed in,
  // because a signed-out visitor only gets one free paper per semester.
  @OptionalAuth()
  @Get()
  findAll(
    @Query() query: FindPapersQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<QuestionPaperDto[]> {
    return this.papersService.findAll(query, Boolean(user));
  }

  @OptionalAuth()
  @Get(":id")
  findOne(
    @Param("id") id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<QuestionPaperDto> {
    return this.papersService.findOne(id, Boolean(user));
  }

  @OptionalAuth()
  @Get(":id/download")
  getDownloadUrl(
    @Param("id") id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<DownloadUrlDto> {
    return this.papersService.getDownloadUrl(id, Boolean(user));
  }

  @OptionalAuth()
  @Get(":id/view")
  getViewUrl(
    @Param("id") id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<FileViewUrlDto> {
    return this.papersService.getViewUrl(id, Boolean(user));
  }

  @Roles(UserRole.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: MAX_UPLOAD_SIZE_BYTES } }))
  create(
    @Body() dto: CreateQuestionPaperBodyDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<QuestionPaperDto> {
    return this.papersService.create(dto, file, user.sub);
  }

  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  remove(@Param("id") id: string): Promise<void> {
    return this.papersService.remove(id);
  }
}
