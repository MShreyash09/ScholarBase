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
import { UserRole, YearLevelDto } from "@scholarbase/shared-types";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { YearLevelsService } from "./year-levels.service";
import { CreateYearLevelBodyDto } from "./dto/create-year-level.dto";
import { UpdateYearLevelBodyDto } from "./dto/update-year-level.dto";

@Controller("year-levels")
export class YearLevelsController {
  constructor(private readonly yearLevelsService: YearLevelsService) {}

  @Public()
  @Get()
  findAll(): Promise<YearLevelDto[]> {
    return this.yearLevelsService.findAll();
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string): Promise<YearLevelDto> {
    return this.yearLevelsService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateYearLevelBodyDto): Promise<YearLevelDto> {
    return this.yearLevelsService.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateYearLevelBodyDto): Promise<YearLevelDto> {
    return this.yearLevelsService.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  remove(@Param("id") id: string): Promise<void> {
    return this.yearLevelsService.remove(id);
  }
}
