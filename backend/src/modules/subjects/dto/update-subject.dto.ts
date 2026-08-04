import { PartialType } from "@nestjs/mapped-types";
import { CreateSubjectBodyDto } from "./create-subject.dto";

export class UpdateSubjectBodyDto extends PartialType(CreateSubjectBodyDto) {}
