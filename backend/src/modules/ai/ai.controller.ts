import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
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
}
