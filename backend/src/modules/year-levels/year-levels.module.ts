import { Module } from "@nestjs/common";
import { YearLevelsController } from "./year-levels.controller";
import { YearLevelsService } from "./year-levels.service";

@Module({
  controllers: [YearLevelsController],
  providers: [YearLevelsService],
  exports: [YearLevelsService],
})
export class YearLevelsModule {}
