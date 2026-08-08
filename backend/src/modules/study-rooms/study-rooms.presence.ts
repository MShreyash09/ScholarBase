import { Injectable } from "@nestjs/common";
import { StudyRoomParticipantDto } from "@scholarbase/shared-types";

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
export class StudyRoomsPresence {
  private readonly rooms = new Map<string, Map<string, StudyRoomParticipantDto>>();

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
    if (room.size === 0) {
      this.rooms.delete(roomId);
      this.presenters.delete(roomId);
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
        if (room.size === 0) {
          this.rooms.delete(roomId);
          this.presenters.delete(roomId);
        }
      }
    }

    return removed;
  }

  /** Drops the whole room's presence at once — used when a room is closed. */
  clearRoom(roomId: string): void {
    this.rooms.delete(roomId);
    this.presenters.delete(roomId);
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

  updateMediaState(
    roomId: string,
    socketId: string,
    state: { inCall: boolean; audioEnabled: boolean; videoEnabled: boolean; screenEnabled: boolean },
  ): StudyRoomParticipantDto | undefined {
    const participant = this.rooms.get(roomId)?.get(socketId);
    if (!participant) return undefined;

    participant.inCall = state.inCall;
    participant.audioEnabled = state.audioEnabled;
    participant.videoEnabled = state.videoEnabled;
    participant.screenEnabled = state.screenEnabled;
    return participant;
  }
}
