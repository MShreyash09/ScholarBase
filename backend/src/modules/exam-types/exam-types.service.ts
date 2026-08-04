import { Injectable, NotFoundException } from "@nestjs/common";
import { ExamTypeDto } from "@scholarbase/shared-types";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateExamTypeBodyDto } from "./dto/create-exam-type.dto";
import { UpdateExamTypeBodyDto } from "./dto/update-exam-type.dto";

@Injectable()
export class ExamTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ExamTypeDto[]> {
    const rows = await this.prisma.examType.findMany({ orderBy: { name: "asc" } });
    return rows.map(this.toDto);
  }

  async findOne(id: string): Promise<ExamTypeDto> {
    const row = await this.prisma.examType.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Exam type not found");
    return this.toDto(row);
  }

  async create(dto: CreateExamTypeBodyDto): Promise<ExamTypeDto> {
    const row = await this.prisma.examType.create({ data: dto });
    return this.toDto(row);
  }

  async update(id: string, dto: UpdateExamTypeBodyDto): Promise<ExamTypeDto> {
    await this.findOne(id);
    const row = await this.prisma.examType.update({ where: { id }, data: dto });
    return this.toDto(row);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.examType.delete({ where: { id } });
  }

  private toDto(row: { id: string; name: string }): ExamTypeDto {
    return { id: row.id, name: row.name };
  }
}
