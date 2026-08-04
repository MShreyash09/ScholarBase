import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { SubjectDto, UserRole } from "@scholarbase/shared-types";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { SubjectsService } from "./subjects.service";
import { CreateSubjectBodyDto } from "./dto/create-subject.dto";
import { UpdateSubjectBodyDto } from "./dto/update-subject.dto";
import { FindSubjectsQueryDto } from "./dto/find-subjects-query.dto";

@Controller("subjects")
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Public()
  @Get()
  findAll(@Query() query: FindSubjectsQueryDto): Promise<SubjectDto[]> {
    return this.subjectsService.findAll(query);
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string): Promise<SubjectDto> {
    return this.subjectsService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateSubjectBodyDto): Promise<SubjectDto> {
    return this.subjectsService.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateSubjectBodyDto): Promise<SubjectDto> {
    return this.subjectsService.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  remove(@Param("id") id: string): Promise<void> {
    return this.subjectsService.remove(id);
  }
}
