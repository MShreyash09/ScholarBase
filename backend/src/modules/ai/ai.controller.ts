import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ask')
  async askQuestion(
    @Req() req: any,
    @Body('question') question: string,
    @Body('sessionId') sessionId?: string,
  ) {
    const userId = req.user.sub;
    return this.aiService.askQuestion(userId, question, sessionId);
  }

  @Get('status')
  async getStatus(@Req() req: any) {
    return this.aiService.getStatus(req.user.sub);
  }

  /**
   * Past conversations, newest first. Every route below is scoped to the
   * caller's own userId inside the service — a session id is a bearer of
   * nothing on its own.
   */
  @Get('sessions')
  async listSessions(@Req() req: any) {
    return this.aiService.listSessions(req.user.sub);
  }

  @Get('sessions/:id')
  async getSession(@Req() req: any, @Param('id') id: string) {
    return this.aiService.getSession(req.user.sub, id);
  }

  @Patch('sessions/:id')
  async renameSession(@Req() req: any, @Param('id') id: string, @Body('title') title: string) {
    return this.aiService.renameSession(req.user.sub, id, title ?? '');
  }

  @Delete('sessions/:id')
  async deleteSession(@Req() req: any, @Param('id') id: string) {
    return this.aiService.deleteSession(req.user.sub, id);
  }
}
