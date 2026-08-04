import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, StudyRoom } from "@prisma/client";
import {
  StudyRoomDto,
  StudyRoomMessageDto,
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

  async findAll(): Promise<StudyRoomDto[]> {
    const rooms = await this.prisma.studyRoom.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      ...roomWithCreator,
    });

    const counts = this.presence.countsByRoom();
    return rooms.map((room) => this.toDto(room, counts.get(room.id) ?? 0));
  }

  async findOne(id: string): Promise<StudyRoomDto> {
    const room = await this.prisma.studyRoom.findUnique({
      where: { id },
      ...roomWithCreator,
    });

    if (!room || !room.isActive) {
      throw new NotFoundException("Study room not found");
    }

    return this.toDto(room, this.presence.count(room.id));
  }

  async create(dto: CreateStudyRoomDto, userId: string): Promise<StudyRoomDto> {
    const room = await this.prisma.studyRoom.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        createdById: userId,
      },
      ...roomWithCreator,
    });

    return this.toDto(room, 0);
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

  /** Throws unless the room exists and is open — used by the gateway on join. */
  async assertJoinable(roomId: string): Promise<StudyRoom> {
    const room = await this.prisma.studyRoom.findUnique({ where: { id: roomId } });
    if (!room || !room.isActive) {
      throw new NotFoundException("Study room not found");
    }
    return room;
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

  private toDto(room: RoomWithCreator, participantCount: number): StudyRoomDto {
    return {
      id: room.id,
      name: room.name,
      description: room.description,
      createdById: room.createdById,
      createdByName: room.createdBy.fullName,
      isActive: room.isActive,
      participantCount,
      createdAt: room.createdAt.toISOString(),
    };
  }
}
