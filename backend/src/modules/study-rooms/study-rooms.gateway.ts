import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import {
  JoinRoomPayload,
  LeaveRoomPayload,
  MediaStatePayload,
  SendMessagePayload,
  SignalPayload,
  STUDY_ROOM_MESSAGE_MAX_LENGTH,
  STUDY_ROOM_NAMESPACE,
  StudyRoomClientEvent,
  StudyRoomParticipantDto,
  StudyRoomServerEvent,
  TypingPayload,
  UserRole,
} from "@scholarbase/shared-types";
import { PrismaService } from "../../prisma/prisma.service";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { StudyRoomsService } from "./study-rooms.service";
import { StudyRoomsPresence } from "./study-rooms.presence";

interface SocketUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

/** Socket carrying the user resolved during the handshake. */
type AuthedSocket = Socket & { data: { user: SocketUser } };

@WebSocketGateway({
  namespace: STUDY_ROOM_NAMESPACE,
  cors: { origin: true, credentials: true },
})
export class StudyRoomsGateway implements OnGatewayInit, OnGatewayDisconnect {
  private readonly logger = new Logger(StudyRoomsGateway.name);

  @WebSocketServer()
  private readonly server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly studyRoomsService: StudyRoomsService,
    private readonly presence: StudyRoomsPresence,
  ) {}

  /**
   * The global JwtAuthGuard only covers HTTP, so the socket handshake is
   * authenticated here instead: no valid access token, no connection.
   */
  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);
      if (!token) {
        throw new Error("Missing access token");
      }

      const payload = await this.jwt.verifyAsync<AuthenticatedUser>(token, {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      });

      // fullName isn't in the JWT, and it's needed on every message and tile.
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, fullName: true, role: true },
      });

      if (!user) {
        throw new Error("User no longer exists");
      }

      client.data.user = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role === "admin" ? UserRole.ADMIN : UserRole.STUDENT,
      } satisfies SocketUser;
    } catch (error) {
      this.logger.warn(`Rejected socket ${client.id}: ${(error as Error).message}`);
      client.emit(StudyRoomServerEvent.ERROR, { message: "Authentication failed" });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    for (const { roomId, participant } of this.presence.removeSocketEverywhere(client.id)) {
      this.server.to(roomId).emit(StudyRoomServerEvent.PARTICIPANT_LEFT, {
        roomId,
        socketId: participant.socketId,
        userId: participant.userId,
      });
    }
  }

  @SubscribeMessage(StudyRoomClientEvent.JOIN)
  async handleJoin(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: JoinRoomPayload,
  ): Promise<void> {
    const roomId = payload?.roomId;
    if (!roomId) return this.fail(client, "A room id is required to join");

    try {
      await this.studyRoomsService.assertJoinable(roomId);
    } catch {
      return this.fail(client, "That study room is not available");
    }

    const user = client.data.user;
    const participant: StudyRoomParticipantDto = {
      socketId: client.id,
      userId: user.id,
      fullName: user.fullName,
      role: user.role,
      inCall: false,
      audioEnabled: false,
      videoEnabled: false,
    };

    await client.join(roomId);
    // Snapshot the peers before adding self, so `participants` is "everyone else".
    const participants = this.presence.list(roomId);
    this.presence.add(roomId, participant);

    const recentMessages = await this.studyRoomsService.recentMessages(roomId);

    client.emit(StudyRoomServerEvent.JOINED, {
      roomId,
      self: participant,
      participants,
      recentMessages,
    });

    client.to(roomId).emit(StudyRoomServerEvent.PARTICIPANT_JOINED, { roomId, participant });
  }

  @SubscribeMessage(StudyRoomClientEvent.LEAVE)
  async handleLeave(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: LeaveRoomPayload,
  ): Promise<void> {
    const roomId = payload?.roomId;
    if (!roomId) return;

    const participant = this.presence.remove(roomId, client.id);
    await client.leave(roomId);

    if (participant) {
      this.server.to(roomId).emit(StudyRoomServerEvent.PARTICIPANT_LEFT, {
        roomId,
        socketId: participant.socketId,
        userId: participant.userId,
      });
    }
  }

  @SubscribeMessage(StudyRoomClientEvent.SEND_MESSAGE)
  async handleMessage(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: SendMessagePayload,
  ): Promise<void> {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) {
      return this.fail(client, "Join the room before sending messages");
    }

    const body = typeof payload.body === "string" ? payload.body.trim() : "";
    if (!body) return;
    if (body.length > STUDY_ROOM_MESSAGE_MAX_LENGTH) {
      return this.fail(client, `Messages are limited to ${STUDY_ROOM_MESSAGE_MAX_LENGTH} characters`);
    }

    const user = client.data.user;
    const message = await this.studyRoomsService.createMessage(roomId, user.id, user.fullName, body);

    // Echoed to the sender too, so every client renders the persisted row.
    this.server.to(roomId).emit(StudyRoomServerEvent.MESSAGE, message);
  }

  @SubscribeMessage(StudyRoomClientEvent.TYPING)
  handleTyping(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: TypingPayload,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    const user = client.data.user;
    client.to(roomId).emit(StudyRoomServerEvent.TYPING, {
      roomId,
      userId: user.id,
      fullName: user.fullName,
      isTyping: Boolean(payload.isTyping),
    });
  }

  /**
   * Relays SDP offers/answers and ICE candidates between two sockets in the
   * same room. Media itself is peer-to-peer; the server never sees it.
   */
  @SubscribeMessage(StudyRoomClientEvent.SIGNAL)
  handleSignal(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: SignalPayload,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    const target = payload.targetSocketId;
    // Only route to a socket that is actually a peer in this room — this stops
    // a signed-in user from spraying signalling at arbitrary sockets.
    if (!target || !this.presence.get(roomId, target)) return;

    const user = client.data.user;
    this.server.to(target).emit(StudyRoomServerEvent.SIGNAL, {
      roomId,
      fromSocketId: client.id,
      fromUserId: user.id,
      fromName: user.fullName,
      kind: payload.kind,
      data: payload.data,
    });
  }

  @SubscribeMessage(StudyRoomClientEvent.MEDIA_STATE)
  handleMediaState(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: MediaStatePayload,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    const state = {
      inCall: Boolean(payload.inCall),
      audioEnabled: Boolean(payload.audioEnabled),
      videoEnabled: Boolean(payload.videoEnabled),
    };

    const participant = this.presence.updateMediaState(roomId, client.id, state);
    if (!participant) return;

    client.to(roomId).emit(StudyRoomServerEvent.MEDIA_STATE, {
      roomId,
      socketId: client.id,
      userId: participant.userId,
      ...state,
    });
  }

  private isInRoom(client: Socket, roomId: string): boolean {
    return client.rooms.has(roomId);
  }

  private fail(client: Socket, message: string): void {
    client.emit(StudyRoomServerEvent.ERROR, { message });
  }

  private extractToken(client: Socket): string | undefined {
    const fromAuth = client.handshake.auth?.token;
    if (typeof fromAuth === "string" && fromAuth.length > 0) {
      return fromAuth;
    }

    const header = client.handshake.headers.authorization;
    return header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  }
}
