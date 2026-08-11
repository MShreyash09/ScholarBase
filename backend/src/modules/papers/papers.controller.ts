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
import { Public } from "../../common/decorators/public.decorator";
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

  @Public()
  @Get()
  findAll(@Query() query: FindPapersQueryDto): Promise<QuestionPaperDto[]> {
    return this.papersService.findAll(query);
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string): Promise<QuestionPaperDto> {
    return this.papersService.findOne(id);
  }

  @Public()
  @Get(":id/download")
  getDownloadUrl(@Param("id") id: string): Promise<DownloadUrlDto> {
    return this.papersService.getDownloadUrl(id);
  }

  // Public for the same reason downloads are: question papers are open to
  // everyone, logged in or not.
  @Public()
  @Get(":id/view")
  getViewUrl(@Param("id") id: string): Promise<FileViewUrlDto> {
    return this.papersService.getViewUrl(id);
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
