import { Module } from "@nestjs/common";
import { ExamTypesController } from "./exam-types.controller";
import { ExamTypesService } from "./exam-types.service";

@Module({
  controllers: [ExamTypesController],
  providers: [ExamTypesService],
  exports: [ExamTypesService],
})
export class ExamTypesModule {}
