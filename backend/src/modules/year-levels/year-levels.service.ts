import { Injectable, NotFoundException } from "@nestjs/common";
import { YearLevelDto } from "@scholarbase/shared-types";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateYearLevelBodyDto } from "./dto/create-year-level.dto";
import { UpdateYearLevelBodyDto } from "./dto/update-year-level.dto";

@Injectable()
export class YearLevelsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<YearLevelDto[]> {
    const rows = await this.prisma.yearLevel.findMany({ orderBy: { yearNumber: "asc" } });
    return rows.map(this.toDto);
  }

  async findOne(id: string): Promise<YearLevelDto> {
    const row = await this.prisma.yearLevel.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Year level not found");
    return this.toDto(row);
  }

  async create(dto: CreateYearLevelBodyDto): Promise<YearLevelDto> {
    const row = await this.prisma.yearLevel.create({ data: dto });
    return this.toDto(row);
  }

  async update(id: string, dto: UpdateYearLevelBodyDto): Promise<YearLevelDto> {
    await this.findOne(id);
    const row = await this.prisma.yearLevel.update({ where: { id }, data: dto });
    return this.toDto(row);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.yearLevel.delete({ where: { id } });
  }

  private toDto(row: { id: string; yearNumber: number; label: string }): YearLevelDto {
    return { id: row.id, yearNumber: row.yearNumber, label: row.label };
  }
}
