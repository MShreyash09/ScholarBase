import { Injectable, OnModuleDestroy } from "@nestjs/common";
import {
  StudyRoomParticipantDto,
  WhiteboardStroke,
  WHITEBOARD_EMPTY_ROOM_GRACE_MS,
  WHITEBOARD_MAX_STROKES,
} from "@scholarbase/shared-types";

/**
 * A room's shared drawing surface.
 *
 * Held separately from the participant map because it has to outlive it: when
 * the last person leaves, `rooms` drops the entry immediately, but the board
 * lingers for a grace period in case they were only reloading.
 */
interface Board {
  ownerSocketId: string | null;
  ownerName: string | null;
  strokes: WhiteboardStroke[];
  /** userIds the owner has allowed to draw. */
  grants: Set<string>;
  /** Pending wipe, scheduled when the room empties and cancelled on rejoin. */
  wipeTimer?: NodeJS.Timeout;
}

/**
 * In-memory registry of who is connected to which room.
 *
 * Presence is deliberately not persisted: it is only meaningful for the
 * lifetime of a socket, and a crashed process should not leave ghost
 * participants in the database. The trade-off is that this only holds for a
 * single backend instance — running more than one would need the socket.io
 * Redis adapter plus a shared store here.
 */
@Injectable()
export class StudyRoomsPresence implements OnModuleDestroy {
  private readonly rooms = new Map<string, Map<string, StudyRoomParticipantDto>>();

  /** roomId -> shared whiteboard. Absent until someone opens one. */
  private readonly boards = new Map<string, Board>();

  /**
   * roomId -> socketId of the one participant allowed to share their screen.
   *
   * Calls are a full mesh, so every screen share is uploaded once per peer. Two
   * people sharing 720p at the same time in a room of four is four extra
   * uploads for no benefit nobody asked for — a study room has one presenter.
   * Held here rather than derived from `screenEnabled` flags so that the claim
   * is decided by one authority instead of racing between clients.
   */
  private readonly presenters = new Map<string, string>();

  add(roomId: string, participant: StudyRoomParticipantDto): void {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = new Map();
      this.rooms.set(roomId, room);
    }
    room.set(participant.socketId, participant);
    // Somebody is back before the grace period elapsed — keep their board.
    this.cancelBoardWipe(roomId);
  }

  /**
   * Takes the room's single screen-share slot. Succeeds if it is free, already
   * held by this socket, or held by a socket that is no longer in the room —
   * that last case matters because a presenter whose tab crashed never sends a
   * "stopped sharing" event, and without it the slot would be held forever.
   */
  claimPresenter(roomId: string, socketId: string): boolean {
    const current = this.presenters.get(roomId);
    if (current && current !== socketId && this.rooms.get(roomId)?.has(current)) {
      return false;
    }
    this.presenters.set(roomId, socketId);
    return true;
  }

  /** No-op unless this socket actually holds the slot, so a late "stopped
   * sharing" from a previous presenter can't evict the current one. */
  releasePresenter(roomId: string, socketId: string): void {
    if (this.presenters.get(roomId) === socketId) {
      this.presenters.delete(roomId);
    }
  }

  currentPresenter(roomId: string): string | undefined {
    return this.presenters.get(roomId);
  }

  remove(roomId: string, socketId: string): StudyRoomParticipantDto | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    const participant = room.get(socketId);
    room.delete(socketId);
    this.releasePresenter(roomId, socketId);
    this.releaseBoard(roomId, socketId);
    if (room.size === 0) {
      this.rooms.delete(roomId);
      this.presenters.delete(roomId);
      // The board is NOT dropped here — it waits out the grace period.
      this.scheduleBoardWipe(roomId);
    }
    return participant;
  }

  /** Removes a socket from every room it was in — used on disconnect. */
  removeSocketEverywhere(socketId: string): { roomId: string; participant: StudyRoomParticipantDto }[] {
    const removed: { roomId: string; participant: StudyRoomParticipantDto }[] = [];

    for (const [roomId, room] of this.rooms) {
      const participant = room.get(socketId);
      if (participant) {
        removed.push({ roomId, participant });
        room.delete(socketId);
        this.releasePresenter(roomId, socketId);
        this.releaseBoard(roomId, socketId);
        if (room.size === 0) {
          this.rooms.delete(roomId);
          this.presenters.delete(roomId);
          this.scheduleBoardWipe(roomId);
        }
      }
    }

    return removed;
  }

  /** Drops the whole room's presence at once — used when a room is closed.
   *
   * The board goes immediately here, with no grace period: unlike everyone
   * happening to leave, a closed room is not coming back. */
  clearRoom(roomId: string): void {
    this.rooms.delete(roomId);
    this.presenters.delete(roomId);
    this.destroyBoard(roomId);
  }

  // --- whiteboard ----------------------------------------------------------

  /**
   * Takes the room's board. Mirrors `claimPresenter`: succeeds if the board is
   * free, already this socket's, or held by a socket that has since left — so
   * an owner whose tab crashed cannot freeze the board for everyone else.
   */
  claimBoard(roomId: string, socketId: string, ownerName: string): boolean {
    const board = this.boards.get(roomId);
    const current = board?.ownerSocketId;
    if (current && current !== socketId && this.rooms.get(roomId)?.has(current)) {
      return false;
    }

    if (!board) {
      this.boards.set(roomId, {
        ownerSocketId: socketId,
        ownerName,
        strokes: [],
        grants: new Set(),
      });
      return true;
    }

    board.ownerSocketId = socketId;
    board.ownerName = ownerName;
    return true;
  }

  /** No-op unless this socket actually owns the board. Strokes are kept: the
   * drawing outlives whoever happened to open it. */
  releaseBoard(roomId: string, socketId: string): void {
    const board = this.boards.get(roomId);
    if (board?.ownerSocketId === socketId) {
      board.ownerSocketId = null;
      board.ownerName = null;
      // Grants were the departed owner's to give, so they go with them.
      board.grants.clear();
    }
  }

  getBoard(roomId: string): Board | undefined {
    return this.boards.get(roomId);
  }

  /** Owner always may; anyone else needs an explicit grant. */
  canDraw(roomId: string, socketId: string, userId: string): boolean {
    const board = this.boards.get(roomId);
    if (!board) return false;
    if (board.ownerSocketId === socketId) return true;
    return board.grants.has(userId);
  }

  isBoardOwner(roomId: string, socketId: string): boolean {
    return this.boards.get(roomId)?.ownerSocketId === socketId;
  }

  setGrant(roomId: string, userId: string, allowed: boolean): string[] | undefined {
    const board = this.boards.get(roomId);
    if (!board) return undefined;
    if (allowed) board.grants.add(userId);
    else board.grants.delete(userId);
    return [...board.grants];
  }

  /**
   * Appends a chunk of an in-progress stroke, creating the stroke on its first
   * chunk. Returns false when the chunk is rejected, which happens if the board
   * is gone or the stroke belongs to someone else — a client must not be able
   * to extend another person's line.
   */
  appendStroke(
    roomId: string,
    stroke: { id: string; authorId: string; authorName: string; color: string; width: number },
    points: number[],
  ): boolean {
    const board = this.boards.get(roomId);
    if (!board) return false;

    const existing = board.strokes.find((s) => s.id === stroke.id);
    if (existing) {
      if (existing.authorId !== stroke.authorId) return false;
      existing.points.push(...points);
      return true;
    }

    board.strokes.push({ ...stroke, points: [...points] });
    // Oldest-first eviction keeps memory bounded on a long session.
    if (board.strokes.length > WHITEBOARD_MAX_STROKES) {
      board.strokes.splice(0, board.strokes.length - WHITEBOARD_MAX_STROKES);
    }
    return true;
  }

  /** Removes the caller's most recent stroke and returns its id. Scoped to the
   * caller so undo can never delete someone else's work. */
  undoLastStroke(roomId: string, authorId: string): string | undefined {
    const board = this.boards.get(roomId);
    if (!board) return undefined;

    for (let i = board.strokes.length - 1; i >= 0; i -= 1) {
      if (board.strokes[i].authorId === authorId) {
        const [removed] = board.strokes.splice(i, 1);
        return removed.id;
      }
    }
    return undefined;
  }

  clearStrokes(roomId: string): void {
    const board = this.boards.get(roomId);
    if (board) board.strokes = [];
  }

  /** Wipes an empty room's board after the grace period. Deliberately delayed:
   * a simultaneous reload by the last participants must not destroy the work. */
  private scheduleBoardWipe(roomId: string): void {
    const board = this.boards.get(roomId);
    if (!board || board.wipeTimer) return;

    board.wipeTimer = setTimeout(() => {
      // Re-check: someone may have rejoined and left again in the meantime.
      if (this.count(roomId) === 0) this.destroyBoard(roomId);
    }, WHITEBOARD_EMPTY_ROOM_GRACE_MS);
    // Don't hold the process open just for a pending wipe.
    board.wipeTimer.unref?.();
  }

  private cancelBoardWipe(roomId: string): void {
    const board = this.boards.get(roomId);
    if (board?.wipeTimer) {
      clearTimeout(board.wipeTimer);
      board.wipeTimer = undefined;
    }
  }

  private destroyBoard(roomId: string): void {
    const board = this.boards.get(roomId);
    if (board?.wipeTimer) clearTimeout(board.wipeTimer);
    this.boards.delete(roomId);
  }

  /** Clears pending timers so tests and shutdowns don't leak them. */
  onModuleDestroy(): void {
    for (const board of this.boards.values()) {
      if (board.wipeTimer) clearTimeout(board.wipeTimer);
    }
    this.boards.clear();
  }

  get(roomId: string, socketId: string): StudyRoomParticipantDto | undefined {
    return this.rooms.get(roomId)?.get(socketId);
  }

  list(roomId: string): StudyRoomParticipantDto[] {
    return [...(this.rooms.get(roomId)?.values() ?? [])];
  }

  count(roomId: string): number {
    return this.rooms.get(roomId)?.size ?? 0;
  }

  /** Live participant counts keyed by room id, for the room list endpoint. */
  countsByRoom(): Map<string, number> {
    const counts = new Map<string, number>();
    for (const [roomId, room] of this.rooms) {
      counts.set(roomId, room.size);
    }
    return counts;
  }
}
