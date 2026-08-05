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

  add(roomId: string, participant: StudyRoomParticipantDto): void {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = new Map();
      this.rooms.set(roomId, room);
    }
    room.set(participant.socketId, participant);
  }

  remove(roomId: string, socketId: string): StudyRoomParticipantDto | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    const participant = room.get(socketId);
    room.delete(socketId);
    if (room.size === 0) {
      this.rooms.delete(roomId);
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
        if (room.size === 0) {
          this.rooms.delete(roomId);
        }
      }
    }

    return removed;
  }

  /** Drops the whole room's presence at once — used when a room is closed. */
  clearRoom(roomId: string): void {
    this.rooms.delete(roomId);
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
