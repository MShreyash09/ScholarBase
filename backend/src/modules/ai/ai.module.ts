import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RagModule } from '../rag/rag.module';

@Module({
  imports: [PrismaModule, ConfigModule, RagModule],
  providers: [AiService],
  controllers: [AiController]
})
export class AiModule {}
