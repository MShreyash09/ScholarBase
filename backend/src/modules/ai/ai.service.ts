import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AiMessageRole } from '@prisma/client';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  
  private readonly systemPrompt = `You are ScholarBoy, the friendly and highly intelligent AI doubt solver for ScholarBase, a premier educational platform. Your primary goal is to help students understand complex concepts, solve problems step-by-step, and act as a personalized tutor. 

Do NOT give away answers directly without explaining the 'why' and 'how'. Always format mathematical equations using LaTeX. For tables and lists, ALWAYS use proper standard Markdown (e.g. | Column | Column |) and bold text where necessary. Use markdown blocks for any code.

CRITICAL INSTRUCTION: You must ONLY output the conversational response directly to the user. NEVER output internal metadata, logging tags, or system safety flags (e.g. do NOT output 'User Safety: safe' or 'Response Safety: safe'). Start your response immediately with your actual educational answer.

Be encouraging, concise, and stay strictly within the context of the student's query. Do not answer questions unrelated to education or academics.`;

  private readonly models = [
    'openrouter/free',
    'google/gemma-4-31b-it:free',
    'nvidia/nemotron-3.5-lightning:free',
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async askQuestion(userId: string, question: string, sessionId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const now = new Date();
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    
    let currentCount = user.aiPromptCount;
    let resetAt = user.aiLimitResetAt;

    if (!resetAt || now.getTime() - resetAt.getTime() > twelveHoursMs) {
      currentCount = 0;
      resetAt = now;
    }

    if (currentCount >= 20) {
      throw new HttpException('ScholarBoy needs rest. Come back in a few hours!', HttpStatus.PAYMENT_REQUIRED);
    }

    let session;
    if (sessionId) {
      session = await this.prisma.aiSession.findUnique({ where: { id: sessionId } });
    }
    if (!session) {
      session = await this.prisma.aiSession.create({ data: { userId } });
    }

    await this.prisma.aiMessage.create({
      data: {
        sessionId: session.id,
        role: AiMessageRole.user,
        content: question,
      },
    });

    const history = await this.prisma.aiMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    history.reverse();

    let ragContext = '';
    
    const messages = [
      { role: 'system', content: this.systemPrompt + (ragContext ? `\n\nContext:\n${ragContext}` : '') },
      ...history.map((msg) => ({ role: msg.role === AiMessageRole.assistant ? 'assistant' : 'user', content: msg.content })),
    ];

    let aiResponseContent = '';
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    
    if (!apiKey) {
      this.logger.error('OPENROUTER_API_KEY is not defined in environment variables');
      throw new HttpException('AI service configuration error.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    for (const model of this.models) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
           aiResponseContent = data.choices[0].message.content;
           break;
        } else {
           throw new Error('Invalid response format from OpenRouter');
        }
      } catch (error: any) {
        this.logger.warn(`Failed with model ${model}: ${error.message}`);
        if (model === this.models[this.models.length - 1]) {
          throw new HttpException('ScholarBoy is currently unavailable. Please try again later.', HttpStatus.SERVICE_UNAVAILABLE);
        }
      }
    }

    await this.prisma.aiMessage.create({
      data: {
        sessionId: session.id,
        role: AiMessageRole.assistant,
        content: aiResponseContent,
      },
    });

    // Deduct the limit ONLY after a successful response
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        aiPromptCount: currentCount + 1,
        aiLimitResetAt: resetAt,
      },
    });

    return {
      sessionId: session.id,
      answer: aiResponseContent,
      promptsRemaining: 20 - (currentCount + 1),
    };
  }

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const now = new Date();
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    
    let currentCount = user.aiPromptCount;
    let resetAt = user.aiLimitResetAt;

    if (!resetAt || now.getTime() - resetAt.getTime() > twelveHoursMs) {
      currentCount = 0;
    }

    return {
      promptsRemaining: 20 - currentCount,
    };
  }
}
