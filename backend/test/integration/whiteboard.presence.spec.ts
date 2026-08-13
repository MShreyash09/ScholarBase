/**
 * IT-WB — the shared whiteboard's state machine, in StudyRoomsPresence.
 *
 * The rules worth pinning here are the ones that bite in a live room: an owner
 * whose tab crashes must not freeze the board, undo must never reach another
 * person's strokes, and an empty room must not lose its work the instant two
 * people happen to reload together.
 */
import { StudyRoomsPresence } from "../../src/modules/study-rooms/study-rooms.presence";
import {
  UserRole,
  WHITEBOARD_EMPTY_ROOM_GRACE_MS,
  WHITEBOARD_MAX_STROKES,
  type StudyRoomParticipantDto,
} from "@scholarbase/shared-types";

const ROOM = "room-1";

function participant(socketId: string, userId: string, fullName = userId): StudyRoomParticipantDto {
  return {
    socketId,
    userId,
    fullName,
    role: UserRole.STUDENT,
    isModerator: false,
    inCall: false,
    audioEnabled: false,
    videoEnabled: false,
    screenEnabled: false,
  };
}

/** Room with a host and a student already present. */
function roomWithTwo() {
  const presence = new StudyRoomsPresence();
  presence.add(ROOM, participant("sock-host", "user-host", "Host"));
  presence.add(ROOM, participant("sock-student", "user-student", "Student"));
  return presence;
}

afterEach(() => jest.useRealTimers());

describe("IT-WB board ownership", () => {
  it("IT-WB-001: the first claimant owns the board", () => {
    const p = roomWithTwo();
    expect(p.claimBoard(ROOM, "sock-host", "Host")).toBe(true);
    expect(p.isBoardOwner(ROOM, "sock-host")).toBe(true);
    expect(p.getBoard(ROOM)?.ownerName).toBe("Host");
  });

  it("IT-WB-002: a second person cannot take a board that is actively owned", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");

    expect(p.claimBoard(ROOM, "sock-student", "Student")).toBe(false);
    expect(p.isBoardOwner(ROOM, "sock-host")).toBe(true);
  });

  it("IT-WB-003: re-claiming your own board is a no-op, not a failure", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    expect(p.claimBoard(ROOM, "sock-host", "Host")).toBe(true);
  });

  it("IT-WB-004: a board held by a socket that has left can be claimed (crashed-owner recovery)", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");

    // Host's tab dies without releasing.
    p.remove(ROOM, "sock-host");

    expect(p.claimBoard(ROOM, "sock-student", "Student")).toBe(true);
    expect(p.isBoardOwner(ROOM, "sock-student")).toBe(true);
  });

  it("IT-WB-005: releasing keeps the strokes — it hands over the pen, it does not erase", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    p.appendStroke(
      ROOM,
      { id: "s1", authorId: "user-host", authorName: "Host", color: "#000", width: 2 },
      [0.1, 0.1, 0.2, 0.2],
    );

    p.releaseBoard(ROOM, "sock-host");

    expect(p.getBoard(ROOM)?.ownerSocketId).toBeNull();
    expect(p.getBoard(ROOM)?.strokes).toHaveLength(1);
  });

  it("IT-WB-006: grants are dropped when the owner leaves — they were the owner's to give", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    p.setGrant(ROOM, "user-student", true);
    expect(p.canDraw(ROOM, "sock-student", "user-student")).toBe(true);

    p.releaseBoard(ROOM, "sock-host");

    expect(p.canDraw(ROOM, "sock-student", "user-student")).toBe(false);
  });

  it("IT-WB-007: releasing a board you do not own does nothing", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");

    p.releaseBoard(ROOM, "sock-student");

    expect(p.isBoardOwner(ROOM, "sock-host")).toBe(true);
  });
});

describe("IT-WB draw permission", () => {
  it("IT-WB-008: the owner may always draw", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    expect(p.canDraw(ROOM, "sock-host", "user-host")).toBe(true);
  });

  it("IT-WB-009: everyone else is refused until granted, and again once revoked", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");

    expect(p.canDraw(ROOM, "sock-student", "user-student")).toBe(false);

    p.setGrant(ROOM, "user-student", true);
    expect(p.canDraw(ROOM, "sock-student", "user-student")).toBe(true);

    p.setGrant(ROOM, "user-student", false);
    expect(p.canDraw(ROOM, "sock-student", "user-student")).toBe(false);
  });

  it("IT-WB-010: nobody can draw on a room that has no board", () => {
    const p = roomWithTwo();
    expect(p.canDraw(ROOM, "sock-host", "user-host")).toBe(false);
  });
});

describe("IT-WB strokes", () => {
  it("IT-WB-011: chunks with the same id extend one stroke rather than creating many", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    const meta = { id: "s1", authorId: "user-host", authorName: "Host", color: "#000", width: 2 };

    p.appendStroke(ROOM, meta, [0.1, 0.1]);
    p.appendStroke(ROOM, meta, [0.2, 0.2]);

    const strokes = p.getBoard(ROOM)!.strokes;
    expect(strokes).toHaveLength(1);
    expect(strokes[0].points).toEqual([0.1, 0.1, 0.2, 0.2]);
  });

  it("IT-WB-012: SECURITY — you cannot extend somebody else's stroke", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    p.appendStroke(
      ROOM,
      { id: "s1", authorId: "user-host", authorName: "Host", color: "#000", width: 2 },
      [0.1, 0.1],
    );

    const hijack = p.appendStroke(
      ROOM,
      { id: "s1", authorId: "user-student", authorName: "Student", color: "#f00", width: 9 },
      [0.9, 0.9],
    );

    expect(hijack).toBe(false);
    expect(p.getBoard(ROOM)!.strokes[0].points).toEqual([0.1, 0.1]);
  });

  it("IT-WB-013: undo removes only the caller's most recent stroke", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    p.setGrant(ROOM, "user-student", true);

    const add = (id: string, authorId: string) =>
      p.appendStroke(ROOM, { id, authorId, authorName: authorId, color: "#000", width: 2 }, [0, 0]);

    add("host-1", "user-host");
    add("student-1", "user-student");
    add("host-2", "user-host");

    // The newest stroke overall is the student's? No — host-2 is. But the
    // student's undo must still take student-1, not the newest on the board.
    expect(p.undoLastStroke(ROOM, "user-student")).toBe("student-1");
    expect(p.getBoard(ROOM)!.strokes.map((s) => s.id)).toEqual(["host-1", "host-2"]);
  });

  it("IT-WB-014: undo with nothing of your own returns undefined and changes nothing", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    p.appendStroke(
      ROOM,
      { id: "s1", authorId: "user-host", authorName: "Host", color: "#000", width: 2 },
      [0, 0],
    );

    expect(p.undoLastStroke(ROOM, "user-student")).toBeUndefined();
    expect(p.getBoard(ROOM)!.strokes).toHaveLength(1);
  });

  it("IT-WB-015: the stroke buffer is bounded, dropping oldest first", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");

    for (let i = 0; i < WHITEBOARD_MAX_STROKES + 25; i += 1) {
      p.appendStroke(
        ROOM,
        { id: `s${i}`, authorId: "user-host", authorName: "Host", color: "#000", width: 2 },
        [0, 0],
      );
    }

    const strokes = p.getBoard(ROOM)!.strokes;
    expect(strokes).toHaveLength(WHITEBOARD_MAX_STROKES);
    expect(strokes[0].id).toBe("s25");
  });

  it("IT-WB-016: clear empties the strokes but keeps the board and its owner", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    p.appendStroke(
      ROOM,
      { id: "s1", authorId: "user-host", authorName: "Host", color: "#000", width: 2 },
      [0, 0],
    );

    p.clearStrokes(ROOM);

    expect(p.getBoard(ROOM)!.strokes).toHaveLength(0);
    expect(p.isBoardOwner(ROOM, "sock-host")).toBe(true);
  });
});

describe("IT-WB empty-room lifecycle", () => {
  it("IT-WB-017: the board survives the room emptying, until the grace period elapses", () => {
    jest.useFakeTimers();
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    p.appendStroke(
      ROOM,
      { id: "s1", authorId: "user-host", authorName: "Host", color: "#000", width: 2 },
      [0, 0],
    );

    p.remove(ROOM, "sock-host");
    p.remove(ROOM, "sock-student");
    expect(p.count(ROOM)).toBe(0);
    // Still there a moment after everyone left.
    expect(p.getBoard(ROOM)?.strokes).toHaveLength(1);

    jest.advanceTimersByTime(WHITEBOARD_EMPTY_ROOM_GRACE_MS + 1000);
    expect(p.getBoard(ROOM)).toBeUndefined();
  });

  it("IT-WB-018: rejoining inside the grace window saves the board (the reload case)", () => {
    jest.useFakeTimers();
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    p.appendStroke(
      ROOM,
      { id: "s1", authorId: "user-host", authorName: "Host", color: "#000", width: 2 },
      [0, 0],
    );

    p.remove(ROOM, "sock-host");
    p.remove(ROOM, "sock-student");

    // Everyone reloaded at once and came back before the timer fired.
    jest.advanceTimersByTime(WHITEBOARD_EMPTY_ROOM_GRACE_MS / 2);
    p.add(ROOM, participant("sock-host-2", "user-host", "Host"));

    jest.advanceTimersByTime(WHITEBOARD_EMPTY_ROOM_GRACE_MS + 1000);

    expect(p.getBoard(ROOM)?.strokes).toHaveLength(1);
  });

  it("IT-WB-019: closing the room drops the board immediately, with no grace period", () => {
    jest.useFakeTimers();
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");

    // A closed room is not coming back, unlike everyone happening to leave.
    p.clearRoom(ROOM);

    expect(p.getBoard(ROOM)).toBeUndefined();
  });

  it("IT-WB-020: a disconnect releases the board across every room the socket was in", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");

    p.removeSocketEverywhere("sock-host");

    // Student is still present, so the board lives on — just unowned.
    expect(p.getBoard(ROOM)?.ownerSocketId).toBeNull();
    expect(p.claimBoard(ROOM, "sock-student", "Student")).toBe(true);
  });
});
