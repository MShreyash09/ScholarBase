import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AiMessageRole } from '@prisma/client';
import { RagService } from '../rag/rag.service';

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
    private readonly ragService: RagService,
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

    // Scoped by userId, not just id: without it, passing someone else's
    // sessionId would append your messages to — and let you read back — their
    // conversation. That mattered little while history was invisible; it
    // matters a lot now that sessions can be reopened.
    let session = sessionId
      ? await this.prisma.aiSession.findFirst({ where: { id: sessionId, userId } })
      : null;

    if (!session) {
      session = await this.prisma.aiSession.create({
        data: { userId, title: AiService.deriveTitle(question) },
      });
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
    try {
      ragContext = await this.ragService.retrieveContext(question);
    } catch (err) {
      this.logger.error("Failed to retrieve RAG context", err);
    }
    
    const messages = [
      { role: 'system', content: this.systemPrompt + (ragContext ? `\n\nHere are some excerpts from our question papers that might help you answer:\n${ragContext}` : '') },
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

    // Bumps updated_at, which is what orders the history list — Prisma's
    // @updatedAt only fires on a write to the session row itself, and writing a
    // message is not one. Also backfills the title for sessions that predate it.
    await this.prisma.aiSession.update({
      where: { id: session.id },
      data: { title: session.title ?? AiService.deriveTitle(question) },
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


  /**
   * The conversation list for the history sidebar. Deliberately does not load
   * message bodies: a student with fifty sessions would otherwise pull their
   * entire ScholarBoy history over the wire to render fifty titles.
   */
  async listSessions(userId: string) {
    const sessions = await this.prisma.aiSession.findMany({
      where: { userId, messages: { some: {} } },
      orderBy: { updatedAt: 'desc' },
      take: 100,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
        // Sessions created before titles existed still need a label.
        messages: {
          where: { role: AiMessageRole.user },
          orderBy: { createdAt: 'asc' },
          take: 1,
          select: { content: true },
        },
      },
    });

    return sessions.map((session) => ({
      id: session.id,
      title: session.title ?? AiService.deriveTitle(session.messages[0]?.content ?? 'New chat'),
      messageCount: session._count.messages,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));
  }

  /** Full transcript, for reopening a past conversation. */
  async getSession(userId: string, sessionId: string) {
    const session = await this.prisma.aiSession.findFirst({
      where: { id: sessionId, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!session) throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);

    return {
      id: session.id,
      title: session.title ?? AiService.deriveTitle(session.messages[0]?.content ?? 'New chat'),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messages: session.messages
        // `system` rows are internal; the transcript is what was actually said.
        .filter((message) => message.role !== AiMessageRole.system)
        .map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
          createdAt: message.createdAt,
        })),
    };
  }

  async renameSession(userId: string, sessionId: string, title: string) {
    const trimmed = title.trim().slice(0, 120);
    if (!trimmed) throw new HttpException('Title cannot be empty', HttpStatus.BAD_REQUEST);

    // updateMany rather than update: it filters on userId in the same statement,
    // so there is no window between checking ownership and writing.
    const { count } = await this.prisma.aiSession.updateMany({
      where: { id: sessionId, userId },
      data: { title: trimmed },
    });
    if (count === 0) throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);

    return { id: sessionId, title: trimmed };
  }

  async deleteSession(userId: string, sessionId: string) {
    const { count } = await this.prisma.aiSession.deleteMany({ where: { id: sessionId, userId } });
    if (count === 0) throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
    // Messages go with it: AiMessage.session is onDelete: Cascade.
    return { deleted: true };
  }

  /**
   * A conversation title is the opening question, cut at a word boundary. Good
   * enough to recognise a chat at a glance, and free — asking the model to
   * summarise would burn one of the student's twenty daily prompts.
   */
  private static deriveTitle(question: string): string {
    const clean = question.replace(/\s+/g, ' ').trim();
    if (clean.length <= 60) return clean || 'New chat';
    const cut = clean.slice(0, 60);
    const lastSpace = cut.lastIndexOf(' ');
    return `${(lastSpace > 30 ? cut.slice(0, lastSpace) : cut).trim()}...`;
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
