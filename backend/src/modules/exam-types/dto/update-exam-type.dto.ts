import { PartialType } from "@nestjs/mapped-types";
import { CreateExamTypeBodyDto } from "./create-exam-type.dto";

export class UpdateExamTypeBodyDto extends PartialType(CreateExamTypeBodyDto) {}
