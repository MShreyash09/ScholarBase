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
  MarkReadPayload,
  SendMessagePayload,
  STUDY_ROOM_MESSAGE_MAX_LENGTH,
  STUDY_ROOM_NAMESPACE,
  StudyRoomClientEvent,
  StudyRoomParticipantDto,
  StudyRoomServerEvent,
  TypingPayload,
  UserRole,
  WhiteboardClaimPayload,
  WhiteboardClearPayload,
  WhiteboardGrantPayload,
  WhiteboardRequestDrawPayload,
  WhiteboardStrokePayload,
  WhiteboardUndoPayload,
  WHITEBOARD_MAX_POINTS_PER_CHUNK,
  WHITEBOARD_MAX_STROKE_WIDTH,
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
   *
   * This runs as connection middleware rather than in handleConnection because
   * middleware is guaranteed to finish before any packet from the socket is
   * dispatched. Authenticating in handleConnection races against the client,
   * which can emit `room:join` the instant it sees `connect` — and then the
   * handler runs with `socket.data.user` still unset.
   */
  afterInit(server: Server): void {
    server.use(async (socket, next) => {
      try {
        const token = this.extractToken(socket);
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

        socket.data.user = {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role === "admin" ? UserRole.ADMIN : UserRole.STUDENT,
        } satisfies SocketUser;

        next();
      } catch (error) {
        this.logger.warn(`Rejected socket ${socket.id}: ${(error as Error).message}`);
        next(new Error("Authentication failed"));
      }
    });
  }

  /**
   * Ends a live session. Called after a room is closed so that closing is a
   * real moderation action rather than just hiding the room from the lobby —
   * anyone mid-chat or mid-call is told and dropped out of the room. Sockets
   * stay connected so the client can navigate away cleanly.
   */
  closeRoom(roomId: string, message: string): void {
    this.server.to(roomId).emit(StudyRoomServerEvent.CLOSED, { roomId, message });
    this.server.in(roomId).socketsLeave(roomId);
    this.presence.clearRoom(roomId);
  }

  handleDisconnect(client: Socket): void {
    for (const { roomId, participant } of this.presence.removeSocketEverywhere(client.id)) {
      this.server.to(roomId).emit(StudyRoomServerEvent.PARTICIPANT_LEFT, {
        roomId,
        socketId: participant.socketId,
        userId: participant.userId,
      });
      // If this socket owned the board, presence has already released it — tell
      // the room so the slot shows as free and someone else can take it.
      this.broadcastBoardMeta(roomId);
    }
  }

  @SubscribeMessage(StudyRoomClientEvent.JOIN)
  async handleJoin(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: JoinRoomPayload,
  ): Promise<void> {
    const roomId = payload?.roomId;
    if (!roomId) return this.fail(client, "A room id is required to join");

    const user = client.data.user;

    // Private rooms require redeemed membership, so a leaked room id on its own
    // gets no further than this check. An admin without an invite is allowed in
    // for oversight, but comes back flagged as a moderator — never hidden.
    let isModerator = false;
    try {
      ({ isModerator } = await this.studyRoomsService.assertJoinable(roomId, user.id, user.role));
    } catch {
      return this.fail(client, "You need an invite link to join this room");
    }
    const participant: StudyRoomParticipantDto = {
      socketId: client.id,
      userId: user.id,
      fullName: user.fullName,
      role: user.role,
      isModerator,
    };

    await client.join(roomId);
    // Snapshot the peers before adding self, so `participants` is "everyone else".
    const participants = this.presence.list(roomId);
    this.presence.add(roomId, participant);

    const [recentMessages, readReceipts] = await Promise.all([
      this.studyRoomsService.recentMessages(roomId),
      this.studyRoomsService.readReceipts(roomId),
    ]);

    client.emit(StudyRoomServerEvent.JOINED, {
      roomId,
      self: participant,
      participants,
      recentMessages,
      readReceipts,
    });

    client.to(roomId).emit(StudyRoomServerEvent.PARTICIPANT_JOINED, { roomId, participant });

    // A late joiner needs the board as it stands. Sent only to them, and only
    // when a board exists — rooms that never opened one send nothing.
    const board = this.presence.getBoard(roomId);
    if (board) {
      client.emit(StudyRoomServerEvent.WHITEBOARD_STATE, {
        roomId,
        ownerSocketId: board.ownerSocketId,
        ownerName: board.ownerName,
        strokes: board.strokes,
        grants: [...board.grants],
      });
    }
  }

  /** Tells the room who owns the board and who may draw. Emitted whenever
   * either changes, including when an owner disconnects. */
  private broadcastBoardMeta(roomId: string): void {
    const board = this.presence.getBoard(roomId);
    if (!board) return;

    this.server.to(roomId).emit(StudyRoomServerEvent.WHITEBOARD_GRANTS, {
      roomId,
      ownerSocketId: board.ownerSocketId,
      ownerName: board.ownerName,
      grants: [...board.grants],
    });
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
      this.broadcastBoardMeta(roomId);
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

    // "Delivered" is presence, not a per-device receipt: true if anyone else
    // was actually connected to the room at the moment this went out. That is
    // the honest limit of a fire-and-forget room broadcast — good enough for a
    // grey double-tick, and superseded the instant a real read receipt arrives.
    message.delivered = this.presence.list(roomId).some((p) => p.userId !== user.id);

    // Echoed to the sender too, so every client renders the persisted row.
    this.server.to(roomId).emit(StudyRoomServerEvent.MESSAGE, message);
  }

  /**
   * Advances the caller's read watermark and tells the room. One event per
   * "caught up", not one per message — the client sends the newest message id
   * it has actually rendered, debounced, and every earlier message is implied
   * read along with it.
   */
  @SubscribeMessage(StudyRoomClientEvent.MARK_READ)
  async handleMarkRead(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: MarkReadPayload,
  ): Promise<void> {
    const roomId = payload?.roomId;
    const messageId = payload?.messageId;
    if (!roomId || !messageId || !this.isInRoom(client, roomId)) return;

    const user = client.data.user;
    const readAt = await this.studyRoomsService.markRead(roomId, user.id, messageId);
    if (!readAt) return;

    // Excludes the sender: a client already knows its own read state the
    // instant it sends this, and doesn't need the round trip to render it.
    client.to(roomId).emit(StudyRoomServerEvent.READ_RECEIPT, {
      roomId,
      userId: user.id,
      lastReadMessageId: messageId,
      lastReadAt: readAt.toISOString(),
    });
  }

  @SubscribeMessage(StudyRoomClientEvent.TYPING)
  handleTyping(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: TypingPayload,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    const user = client.data.user;
    this.server.to(roomId).emit(StudyRoomServerEvent.TYPING, {
      roomId,
      userId: user.id,
      fullName: user.fullName,
      isTyping: Boolean(payload.isTyping),
    });
  }

  // --- whiteboard ----------------------------------------------------------
  //
  // Every rule below is enforced here rather than in the browser. The client
  // hides the pen when you cannot draw, but that is a courtesy — a hand-written
  // socket frame ignores the UI, exactly as with the screen-share claim above.

  @SubscribeMessage(StudyRoomClientEvent.WHITEBOARD_CLAIM)
  handleWhiteboardClaim(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: WhiteboardClaimPayload,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    const user = client.data.user;
    if (!this.presence.claimBoard(roomId, client.id, user.fullName)) {
      return this.fail(client, "Someone else is running the whiteboard.");
    }

    const board = this.presence.getBoard(roomId);
    if (!board) return;

    // The claimant gets the full board; everyone else just needs to know who
    // owns it now.
    client.emit(StudyRoomServerEvent.WHITEBOARD_STATE, {
      roomId,
      ownerSocketId: board.ownerSocketId,
      ownerName: board.ownerName,
      strokes: board.strokes,
      grants: [...board.grants],
    });
    this.broadcastBoardMeta(roomId);
  }

  @SubscribeMessage(StudyRoomClientEvent.WHITEBOARD_RELEASE)
  handleWhiteboardRelease(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: WhiteboardClaimPayload,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    // Strokes survive: releasing hands the pen over, it does not erase the work.
    this.presence.releaseBoard(roomId, client.id);
    this.broadcastBoardMeta(roomId);
  }

  @SubscribeMessage(StudyRoomClientEvent.WHITEBOARD_STROKE)
  handleWhiteboardStroke(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: WhiteboardStrokePayload,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    const user = client.data.user;
    if (!this.presence.canDraw(roomId, client.id, user.id)) return;

    const strokeId = typeof payload.strokeId === "string" ? payload.strokeId : "";
    const points = Array.isArray(payload.points) ? payload.points : [];
    if (!strokeId || points.length === 0) return;
    // Points arrive as a flat [x,y,…] list, so an odd length is malformed.
    if (points.length % 2 !== 0) return;
    if (points.length > WHITEBOARD_MAX_POINTS_PER_CHUNK * 2) return;
    // Coordinates are normalized; anything outside 0–1 is not from our client.
    if (!points.every((n) => typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1)) {
      return;
    }

    const width = Math.min(Math.max(Number(payload.width) || 1, 1), WHITEBOARD_MAX_STROKE_WIDTH);
    const color = typeof payload.color === "string" ? payload.color.slice(0, 32) : "#000000";

    const accepted = this.presence.appendStroke(
      roomId,
      { id: strokeId, authorId: user.id, authorName: user.fullName, color, width },
      points,
    );
    // Rejected when the stroke id belongs to somebody else — a client must not
    // be able to extend another person's line.
    if (!accepted) return;

    // To everyone but the sender: the drawer already rendered it locally, and
    // echoing would fight their in-progress line.
    client.to(roomId).emit(StudyRoomServerEvent.WHITEBOARD_STROKE, {
      roomId,
      strokeId,
      color,
      width,
      points,
      done: Boolean(payload.done),
      authorId: user.id,
      authorName: user.fullName,
    });
  }

  @SubscribeMessage(StudyRoomClientEvent.WHITEBOARD_UNDO)
  handleWhiteboardUndo(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: WhiteboardUndoPayload,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    const user = client.data.user;
    if (!this.presence.canDraw(roomId, client.id, user.id)) return;

    // Scoped to the caller's own strokes inside presence, so undo can never
    // reach across and delete someone else's work.
    const strokeId = this.presence.undoLastStroke(roomId, user.id);
    if (!strokeId) return;

    this.server.to(roomId).emit(StudyRoomServerEvent.WHITEBOARD_UNDO, { roomId, strokeId });
  }

  @SubscribeMessage(StudyRoomClientEvent.WHITEBOARD_CLEAR)
  handleWhiteboardClear(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: WhiteboardClearPayload,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    // Wiping everyone's work is the owner's call alone.
    if (!this.presence.isBoardOwner(roomId, client.id)) {
      return this.fail(client, "Only whoever opened the whiteboard can clear it.");
    }

    this.presence.clearStrokes(roomId);
    this.server.to(roomId).emit(StudyRoomServerEvent.WHITEBOARD_CLEARED, { roomId });
  }

  @SubscribeMessage(StudyRoomClientEvent.WHITEBOARD_REQUEST_DRAW)
  handleWhiteboardRequestDraw(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: WhiteboardRequestDrawPayload,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    const board = this.presence.getBoard(roomId);
    if (!board?.ownerSocketId) return;

    const user = client.data.user;
    // Deliberately transient: a request is a nudge, not stored state, so an
    // ignored one leaves nothing behind to clean up.
    this.server.to(board.ownerSocketId).emit(StudyRoomServerEvent.WHITEBOARD_DRAW_REQUESTED, {
      roomId,
      userId: user.id,
      fullName: user.fullName,
    });
  }

  @SubscribeMessage(StudyRoomClientEvent.WHITEBOARD_GRANT)
  handleWhiteboardGrant(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: WhiteboardGrantPayload,
  ): void {
    this.setWhiteboardGrant(client, payload, true);
  }

  @SubscribeMessage(StudyRoomClientEvent.WHITEBOARD_REVOKE)
  handleWhiteboardRevoke(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: WhiteboardGrantPayload,
  ): void {
    this.setWhiteboardGrant(client, payload, false);
  }

  private setWhiteboardGrant(
    client: AuthedSocket,
    payload: WhiteboardGrantPayload,
    allowed: boolean,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    if (!this.presence.isBoardOwner(roomId, client.id)) {
      return this.fail(client, "Only whoever opened the whiteboard can change who draws.");
    }

    const userId = typeof payload.userId === "string" ? payload.userId : "";
    if (!userId) return;
    // Only people actually in the room can be granted, so a stale or invented
    // id cannot accumulate in the grant set.
    if (!this.presence.list(roomId).some((p) => p.userId === userId)) return;

    if (this.presence.setGrant(roomId, userId, allowed) === undefined) return;
    this.broadcastBoardMeta(roomId);
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
