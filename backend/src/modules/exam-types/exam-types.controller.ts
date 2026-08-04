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
} from "@nestjs/common";
import { ExamTypeDto, UserRole } from "@scholarbase/shared-types";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { ExamTypesService } from "./exam-types.service";
import { CreateExamTypeBodyDto } from "./dto/create-exam-type.dto";
import { UpdateExamTypeBodyDto } from "./dto/update-exam-type.dto";

@Controller("exam-types")
export class ExamTypesController {
  constructor(private readonly examTypesService: ExamTypesService) {}

  @Public()
  @Get()
  findAll(): Promise<ExamTypeDto[]> {
    return this.examTypesService.findAll();
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string): Promise<ExamTypeDto> {
    return this.examTypesService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateExamTypeBodyDto): Promise<ExamTypeDto> {
    return this.examTypesService.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateExamTypeBodyDto): Promise<ExamTypeDto> {
    return this.examTypesService.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  remove(@Param("id") id: string): Promise<void> {
    return this.examTypesService.remove(id);
  }
}
