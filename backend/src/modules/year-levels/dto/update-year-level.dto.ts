import { PartialType } from "@nestjs/mapped-types";
import { CreateYearLevelBodyDto } from "./create-year-level.dto";

export class UpdateYearLevelBodyDto extends PartialType(CreateYearLevelBodyDto) {}
