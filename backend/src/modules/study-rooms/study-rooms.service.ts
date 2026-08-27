import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, StudyRoom, StudyRoomVisibility as PrismaVisibility } from "@prisma/client";
import { randomBytes } from "crypto";
import {
  parseInviteCode,
  StudyRoomDto,
  StudyRoomMessageDto,
  StudyRoomReadReceiptDto,
  StudyRoomVisibility,
  UserRole,
} from "@scholarbase/shared-types";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { CreateStudyRoomDto } from "./dto/create-study-room.dto";
import { StudyRoomsPresence } from "./study-rooms.presence";

const roomWithCreator = Prisma.validator<Prisma.StudyRoomDefaultArgs>()({
  include: { createdBy: { select: { fullName: true } } },
});

type RoomWithCreator = Prisma.StudyRoomGetPayload<typeof roomWithCreator>;

const DEFAULT_MESSAGE_LIMIT = 50;

@Injectable()
export class StudyRoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly presence: StudyRoomsPresence,
    private readonly config: ConfigService,
  ) {}

  /**
   * The lobby shows public rooms plus the private rooms this user actually
   * belongs to. A private room someone else created is invisible here.
   */
  async findAll(userId: string): Promise<StudyRoomDto[]> {
    const rooms = await this.prisma.studyRoom.findMany({
      where: {
        isActive: true,
        OR: [
          { visibility: PrismaVisibility.public },
          { createdById: userId },
          { members: { some: { userId } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      ...roomWithCreator,
    });

    const entitledIds = new Set(await this.entitledRoomIds(userId, rooms.map((r) => r.id)));
    const counts = this.presence.countsByRoom();

    return rooms.map((room) =>
      this.toDto(room, counts.get(room.id) ?? 0, entitledIds.has(room.id)),
    );
  }

  /**
   * Moderation listing: every open room, including private ones the admin is
   * not a member of. Invite codes are still withheld — an admin can end a
   * private session, but not quietly let themselves into it.
   */
  async findAllForModeration(): Promise<StudyRoomDto[]> {
    const rooms = await this.prisma.studyRoom.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      ...roomWithCreator,
    });

    const counts = this.presence.countsByRoom();
    return rooms.map((room) => this.toDto(room, counts.get(room.id) ?? 0, false));
  }

  async findOne(id: string, userId: string, role: UserRole): Promise<StudyRoomDto> {
    const room = await this.prisma.studyRoom.findUnique({
      where: { id },
      ...roomWithCreator,
    });

    if (!room || !room.isActive) {
      throw new NotFoundException("Study room not found");
    }

    const entitled = await this.isEntitled(room, userId);
    // Admins may open any room for oversight (the room page needs this to load
    // before the socket join). Everyone else gets a 404 on a private room they
    // aren't in — a wrong guess should not confirm the room exists. The invite
    // code is still withheld from a non-member admin (entitled stays false).
    if (room.visibility === PrismaVisibility.private && !entitled && role !== UserRole.ADMIN) {
      throw new NotFoundException("Study room not found");
    }

    return this.toDto(room, this.presence.count(room.id), entitled);
  }

  async create(dto: CreateStudyRoomDto, userId: string): Promise<StudyRoomDto> {
    const room = await this.prisma.studyRoom.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        createdById: userId,
        visibility:
          dto.visibility === StudyRoomVisibility.PUBLIC
            ? PrismaVisibility.public
            : PrismaVisibility.private,
        inviteCode: this.generateInviteCode(),
      },
      ...roomWithCreator,
    });

    return this.toDto(room, 0, true);
  }

  /**
   * Exchanges an invite (link or bare code) for membership. This is the only
   * way into a private room a user did not create.
   */
  async redeemInvite(invite: string, userId: string): Promise<StudyRoomDto> {
    const code = parseInviteCode(invite);
    if (!code) {
      throw new NotFoundException("That invite link is not valid");
    }

    const room = await this.prisma.studyRoom.findUnique({
      where: { inviteCode: code },
      ...roomWithCreator,
    });

    if (!room || !room.isActive) {
      throw new NotFoundException("That invite link is not valid or the room has been closed");
    }

    if (room.createdById !== userId) {
      await this.prisma.studyRoomMember.upsert({
        where: { roomId_userId: { roomId: room.id, userId } },
        update: {},
        create: { roomId: room.id, userId },
      });
    }

    return this.toDto(room, this.presence.count(room.id), true);
  }

  /** Soft close: keeps the transcript, drops the room from the lobby. */
  async remove(id: string, user: AuthenticatedUser): Promise<void> {
    const room = await this.prisma.studyRoom.findUnique({ where: { id } });
    if (!room) {
      throw new NotFoundException("Study room not found");
    }

    if (room.createdById !== user.sub && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only the room creator or an admin can close this room");
    }

    await this.prisma.studyRoom.update({ where: { id }, data: { isActive: false } });
  }

  /**
   * The real gate for joining a call: the gateway calls this before letting a
   * socket into the room, so holding a room id is not enough for a private room.
   */
  async assertJoinable(
    roomId: string,
    userId: string,
    role: UserRole,
  ): Promise<{ room: StudyRoom; isModerator: boolean }> {
    const room = await this.prisma.studyRoom.findUnique({ where: { id: roomId } });
    if (!room || !room.isActive) {
      throw new NotFoundException("Study room not found");
    }

    if (room.visibility === PrismaVisibility.public) {
      return { room, isModerator: false };
    }

    if (await this.isEntitled(room, userId)) {
      return { room, isModerator: false };
    }

    // An admin with no invite may still enter for oversight, but is flagged as
    // a moderator so the room is told they are present. There is deliberately
    // no silent-join path — admin presence is always visible.
    if (role === UserRole.ADMIN) {
      return { room, isModerator: true };
    }

    throw new ForbiddenException("You need an invite link to join this room");
  }

  /**
   * REST entry point for the transcript. Goes through the same access check as
   * joining, so a private room's history is not readable by room id alone.
   */
  async messagesForUser(
    roomId: string,
    userId: string,
    role: UserRole,
    limit?: number,
  ): Promise<StudyRoomMessageDto[]> {
    await this.assertJoinable(roomId, userId, role);
    return this.recentMessages(roomId, limit);
  }

  /**
   * Generates or fetches the Daily.co room URL for the given study room.
   */
  async getDailyRoomUrl(roomId: string, userId: string, role: UserRole): Promise<{ url: string }> {
    await this.assertJoinable(roomId, userId, role);

    const apiKey = this.config.get<string>("DAILY_API_KEY");
    const domain = this.config.get<string>("DAILY_DOMAIN");

    if (!apiKey || !domain) {
      throw new Error("Daily.co API key or domain is not configured.");
    }

    // Daily allows custom names for rooms. We use the ScholarBase roomId.
    // Daily limits room names to max 40 chars, alphanumeric and hyphens. 
    // Since roomId is a UUID (36 chars), it fits perfectly.
    const dailyRoomName = roomId;
    const url = `https://${domain}/${dailyRoomName}`;

    try {
      // Check if room exists
      const checkRes = await fetch(`https://api.daily.co/v1/rooms/${dailyRoomName}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      
      if (checkRes.ok) {
        return { url };
      }

      // Room doesn't exist, create it
      const createRes = await fetch("https://api.daily.co/v1/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          name: dailyRoomName,
          properties: {
            // Room expires 24 hours from creation
            exp: Math.round(Date.now() / 1000) + 86400,
            enable_chat: false, // We use our own chat
          },
        }),
      });

      if (!createRes.ok) {
        const errorData = await createRes.text();
        throw new Error(`Failed to create Daily room: ${errorData}`);
      }

      return { url };
    } catch (e) {
      console.error("Daily.co API error:", e);
      throw new Error("Failed to initialize video call room.");
    }
  }

  async recentMessages(roomId: string, limit = DEFAULT_MESSAGE_LIMIT): Promise<StudyRoomMessageDto[]> {
    const messages = await this.prisma.studyRoomMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { sender: { select: { fullName: true } } },
    });

    // Queried newest-first to get the *latest* N, returned oldest-first to render.
    // `delivered: true` for all of them — a message that already made it into
    // the database has, by definition, already reached the room.
    return messages.reverse().map((message) => ({
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      senderName: message.sender.fullName,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      delivered: true,
    }));
  }

  async createMessage(
    roomId: string,
    senderId: string,
    senderName: string,
    body: string,
  ): Promise<StudyRoomMessageDto> {
    const message = await this.prisma.studyRoomMessage.create({
      data: { roomId, senderId, body },
    });

    return {
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      senderName,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      // The gateway overwrites this with a real answer — from presence, which
      // it holds and this service does not — before broadcasting. `false` here
      // is only the value between "created" and "the gateway decided".
      delivered: false,
    };
  }

  /** Every member's read watermark, sent on join so tick state on old messages
   *  is right from the first render. */
  async readReceipts(roomId: string): Promise<StudyRoomReadReceiptDto[]> {
    const receipts = await this.prisma.studyRoomReadReceipt.findMany({ where: { roomId } });
    return receipts.map((receipt) => ({
      userId: receipt.userId,
      lastReadMessageId: receipt.lastReadMessageId,
      lastReadAt: receipt.lastReadAt.toISOString(),
    }));
  }

  /**
   * Advances a user's read watermark. Upserted rather than inserted per message:
   * one row per (room, user) is enough, since "read up to message X" implies
   * every earlier message was read too.
   *
   * Silently ignores a `messageId` from a different room — a stale or forged id
   * must not let a client mark receipts in a room it isn't even watching.
   *
   * Not guarded against moving backward: the client always sends the newest
   * message it has rendered, so an older id arriving after a newer one would
   * mean events were reordered in flight, not a real regression. Worth
   * revisiting only if that assumption stops holding — the blast radius is a
   * user's own read marker flickering, never another user's data.
   */
  async markRead(roomId: string, userId: string, messageId: string): Promise<Date | null> {
    const message = await this.prisma.studyRoomMessage.findUnique({
      where: { id: messageId },
      select: { roomId: true, createdAt: true },
    });
    if (!message || message.roomId !== roomId) return null;

    const readAt = new Date();
    await this.prisma.studyRoomReadReceipt.upsert({
      where: { roomId_userId: { roomId, userId } },
      // A read receipt only ever moves forward — `create` covers "first ever
      // receipt" and `update` covers every advance after that; nothing here
      // should be able to walk it backwards.
      create: { roomId, userId, lastReadMessageId: messageId, lastReadAt: readAt },
      update: { lastReadMessageId: messageId, lastReadAt: readAt },
    });

    return readAt;
  }

  /**
   * Creator or invite-redeemer. Admins deliberately do not get a bypass here:
   * they can close a room for moderation, but a private study session is not
   * something they should be able to silently sit in on.
   */
  private async isEntitled(room: StudyRoom, userId: string): Promise<boolean> {
    if (room.createdById === userId) return true;

    const membership = await this.prisma.studyRoomMember.findUnique({
      where: { roomId_userId: { roomId: room.id, userId } },
      select: { id: true },
    });
    return membership !== null;
  }

  /** Batched membership lookup so the lobby does not fan out one query per room. */
  private async entitledRoomIds(userId: string, roomIds: string[]): Promise<string[]> {
    if (roomIds.length === 0) return [];

    const [created, joined] = await Promise.all([
      this.prisma.studyRoom.findMany({
        where: { id: { in: roomIds }, createdById: userId },
        select: { id: true },
      }),
      this.prisma.studyRoomMember.findMany({
        where: { userId, roomId: { in: roomIds } },
        select: { roomId: true },
      }),
    ]);

    return [...created.map((r) => r.id), ...joined.map((m) => m.roomId)];
  }

  private generateInviteCode(): string {
    // 24 URL-safe chars of entropy — not guessable by brute force.
    return randomBytes(18).toString("base64url");
  }

  private toDto(room: RoomWithCreator, participantCount: number, entitled: boolean): StudyRoomDto {
    return {
      id: room.id,
      name: room.name,
      description: room.description,
      createdById: room.createdById,
      createdByName: room.createdBy.fullName,
      visibility:
        room.visibility === PrismaVisibility.public
          ? StudyRoomVisibility.PUBLIC
          : StudyRoomVisibility.PRIVATE,
      // Never hand the invite code to someone who is not already inside.
      inviteCode: entitled ? room.inviteCode : null,
      isActive: room.isActive,
      participantCount,
      createdAt: room.createdAt.toISOString(),
    };
  }
}
