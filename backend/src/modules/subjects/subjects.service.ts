import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, Subject } from "@prisma/client";
import { SubjectDto } from "@scholarbase/shared-types";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateSubjectBodyDto } from "./dto/create-subject.dto";
import { UpdateSubjectBodyDto } from "./dto/update-subject.dto";
import { FindSubjectsQueryDto } from "./dto/find-subjects-query.dto";

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: FindSubjectsQueryDto): Promise<SubjectDto[]> {
    const rows = await this.prisma.subject.findMany({
      where: {
        yearLevelId: query.yearLevelId,
        department: query.department,
        semester: query.semester,
      },
      orderBy: { code: "asc" },
    });
    return rows.map(this.toDto);
  }

  async findOne(id: string): Promise<SubjectDto> {
    const row = await this.prisma.subject.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Subject not found");
    return this.toDto(row);
  }

  async create(dto: CreateSubjectBodyDto): Promise<SubjectDto> {
    try {
      const row = await this.prisma.subject.create({ data: dto });
      return this.toDto(row);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("A subject with this code already exists in this year level.");
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateSubjectBodyDto): Promise<SubjectDto> {
    await this.findOne(id);
    try {
      const row = await this.prisma.subject.update({ where: { id }, data: dto });
      return this.toDto(row);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("A subject with this code already exists in this year level.");
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.subject.delete({ where: { id } });
  }

  private toDto(row: Subject): SubjectDto {
    return {
      id: row.id,
      yearLevelId: row.yearLevelId,
      code: row.code,
      name: row.name,
      department: row.department,
      semester: row.semester,
      credits: row.credits,
    };
  }
}
