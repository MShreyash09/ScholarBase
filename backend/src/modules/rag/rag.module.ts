import { Module } from "@nestjs/common";
import { RagService } from "./rag.service";
import { RagController } from "./rag.controller";
import { StorageModule } from "../storage/storage.module";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [StorageModule, PrismaModule],
  providers: [RagService],
  controllers: [RagController],
  exports: [RagService],
})
export class RagModule {}
