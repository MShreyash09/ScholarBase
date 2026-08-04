import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, StudyRoom, StudyRoomVisibility as PrismaVisibility } from "@prisma/client";
import { randomBytes } from "crypto";
import {
  parseInviteCode,
  StudyRoomDto,
  StudyRoomMessageDto,
  StudyRoomVisibility,
  UserRole,
} from "@scholarbase/shared-types";
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

  async findOne(id: string, userId: string): Promise<StudyRoomDto> {
    const room = await this.prisma.studyRoom.findUnique({
      where: { id },
      ...roomWithCreator,
    });

    if (!room || !room.isActive) {
      throw new NotFoundException("Study room not found");
    }

    const entitled = await this.isEntitled(room, userId);
    // 404 rather than 403 for private rooms: a wrong guess should not confirm
    // that a room with this id exists.
    if (room.visibility === PrismaVisibility.private && !entitled) {
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
  async assertJoinable(roomId: string, userId: string): Promise<StudyRoom> {
    const room = await this.prisma.studyRoom.findUnique({ where: { id: roomId } });
    if (!room || !room.isActive) {
      throw new NotFoundException("Study room not found");
    }

    if (room.visibility === PrismaVisibility.private && !(await this.isEntitled(room, userId))) {
      throw new ForbiddenException("You need an invite link to join this room");
    }

    return room;
  }

  /**
   * REST entry point for the transcript. Goes through the same access check as
   * joining, so a private room's history is not readable by room id alone.
   */
  async messagesForUser(
    roomId: string,
    userId: string,
    limit?: number,
  ): Promise<StudyRoomMessageDto[]> {
    await this.assertJoinable(roomId, userId);
    return this.recentMessages(roomId, limit);
  }

  async recentMessages(roomId: string, limit = DEFAULT_MESSAGE_LIMIT): Promise<StudyRoomMessageDto[]> {
    const messages = await this.prisma.studyRoomMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { sender: { select: { fullName: true } } },
    });

    // Queried newest-first to get the *latest* N, returned oldest-first to render.
    return messages.reverse().map((message) => ({
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      senderName: message.sender.fullName,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
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
    };
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
