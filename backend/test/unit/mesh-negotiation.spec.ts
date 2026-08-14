/**
 * UT-MESH — who offers to whom when several people join a call at once.
 *
 * This pins down the fix for the "3-2-1" report from a live session: with three
 * students on a call, one saw everyone, one saw two, one saw only themselves.
 * It was never a network problem — they were on the same Wi-Fi — it was the
 * offer/answer protocol.
 *
 * The old rule was "whoever joins offers to everyone already in the call".
 * Each client announces `inCall: true` *before* building its offer list, so
 * when two people click Join within a few milliseconds each can see the other
 * as already in the call, and both send an offer. The second offer lands while
 * the receiver is in `have-local-offer`, setRemoteDescription throws
 * InvalidStateError, and — with no try/catch and no retry anywhere — that pair
 * stayed dead for the rest of the session.
 *
 * The logic is pure, so it is modelled here rather than driven through real
 * peer connections.
 */

type SocketId = string;

/** What one client currently believes about the others. */
interface ClientView {
  self: SocketId;
  /** Peers this client has seen announce `inCall` so far. */
  seesInCall: Set<SocketId>;
}

const pairKey = (a: SocketId, b: SocketId) => [a, b].sort().join("|");

/** Old rule: offer to everyone you can see is already on the call. */
function offersUnderOldRule(view: ClientView): SocketId[] {
  return [...view.seesInCall].filter((peer) => peer !== view.self);
}

/** New rule: the lower socket id is the only one that offers. */
function offersUnderNewRule(view: ClientView, connected: Set<string>): SocketId[] {
  return [...view.seesInCall].filter(
    (peer) =>
      peer !== view.self &&
      !connected.has(pairKey(view.self, peer)) &&
      view.self < peer,
  );
}

interface RoundResult {
  connected: Set<string>;
  glared: Set<string>;
  offerCounts: Map<string, number>;
}

function runRound(
  views: ClientView[],
  rule: "old" | "new",
  connected: Set<string>,
): RoundResult {
  const offerCounts = new Map<string, number>();

  for (const view of views) {
    const targets =
      rule === "old" ? offersUnderOldRule(view) : offersUnderNewRule(view, connected);
    for (const target of targets) {
      const key = pairKey(view.self, target);
      offerCounts.set(key, (offerCounts.get(key) ?? 0) + 1);
    }
  }

  const nextConnected = new Set(connected);
  const glared = new Set<string>();
  for (const [key, count] of offerCounts) {
    // Exactly one offer negotiates cleanly. Two is glare: both sides are in
    // have-local-offer and the connection dies.
    if (count === 1) nextConnected.add(key);
    else if (count >= 2) glared.add(key);
  }

  return { connected: nextConnected, glared, offerCounts };
}

/** Three students, ids chosen so ordering is unambiguous. */
const A = "aaa-socket";
const B = "bbb-socket";
const C = "ccc-socket";

/** Everyone has heard everyone — the state a moment after simultaneous joins. */
function fullVisibility(): ClientView[] {
  return [
    { self: A, seesInCall: new Set([A, B, C]) },
    { self: B, seesInCall: new Set([A, B, C]) },
    { self: C, seesInCall: new Set([A, B, C]) },
  ];
}

/**
 * The real 3-2-1 shape: media-state frames are still in flight, so each client
 * has a different idea of who is on the call. A and B heard each other; C's
 * announcement went out but C has not yet heard anyone.
 */
function partialVisibility(): ClientView[] {
  return [
    { self: A, seesInCall: new Set([A, B, C]) },
    { self: B, seesInCall: new Set([A, B, C]) },
    { self: C, seesInCall: new Set([C]) }, // heard nobody yet
  ];
}

/**
 * The one case the id rule alone does not settle: the side that owes the offer
 * is the side that has not heard about its peer.
 */
function initiatorBlind(): ClientView[] {
  return [
    { self: A, seesInCall: new Set([A]) }, // A owes B an offer but cannot see B
    { self: B, seesInCall: new Set([A, B]) },
  ];
}

const ALL_PAIRS = [pairKey(A, B), pairKey(A, C), pairKey(B, C)];

describe("UT-MESH the old rule reproduces the failure", () => {
  it("UT-MESH-001: simultaneous joins make BOTH sides offer — glare on every pair", () => {
    const { glared, connected } = runRound(fullVisibility(), "old", new Set());

    // Every pair collides: this is the bug, not an edge case.
    expect([...glared].sort()).toEqual([...ALL_PAIRS].sort());
    expect(connected.size).toBe(0);
  });

  it("UT-MESH-002: with frames still in flight, one pair dies while the others work", () => {
    const { connected, glared, offerCounts } = runRound(partialVisibility(), "old", new Set());

    // A and B saw each other, so both offered -> collision -> that pair is dead.
    expect(glared.has(pairKey(A, B))).toBe(true);
    expect(offerCounts.get(pairKey(A, B))).toBe(2);

    // C heard nobody, so only one side offered to it and those pairs happen to
    // survive. The result is precisely the asymmetry the students reported:
    // C sees both, while A and B cannot see each other.
    expect(connected.has(pairKey(A, C))).toBe(true);
    expect(connected.has(pairKey(B, C))).toBe(true);
  });

  it("UT-MESH-003: retrying cannot save it — the rule itself has no arbitration", () => {
    // Even if the old code HAD retried (it did not: no timer, no
    // participant-change handler, no failure recovery), the same two clients
    // would collide again every single time.
    const first = runRound(partialVisibility(), "old", new Set());
    const second = runRound(fullVisibility(), "old", first.connected);

    expect(second.glared.has(pairKey(A, B))).toBe(true);
    expect(second.offerCounts.get(pairKey(A, B))).toBe(2);
  });
});

describe("UT-MESH the id rule removes glare by construction", () => {
  it("UT-MESH-004: with everyone visible, every pair gets exactly one offer", () => {
    const { connected, glared, offerCounts } = runRound(fullVisibility(), "new", new Set());

    expect(glared.size).toBe(0);
    expect([...connected].sort()).toEqual([...ALL_PAIRS].sort());
    for (const key of ALL_PAIRS) expect(offerCounts.get(key)).toBe(1);
  });

  it("UT-MESH-005: no pair can ever double-offer, whoever clicks first", () => {
    // Both orderings of the same pair resolve to one offerer.
    const both: ClientView[] = [
      { self: A, seesInCall: new Set([A, B]) },
      { self: B, seesInCall: new Set([A, B]) },
    ];
    const { offerCounts } = runRound(both, "new", new Set());
    expect(offerCounts.get(pairKey(A, B))).toBe(1);
  });

  it("UT-MESH-006: the same in-flight state that broke the old rule now connects everything", () => {
    const { connected, glared } = runRound(partialVisibility(), "new", new Set());

    // Identical inputs to UT-MESH-002, which lost the A<->B pair.
    expect(glared.size).toBe(0);
    expect([...connected].sort()).toEqual([...ALL_PAIRS].sort());
  });

  it("UT-MESH-006b: a pair whose initiator is still blind is pending, not broken", () => {
    const first = runRound(initiatorBlind(), "new", new Set());

    // A owes the offer but has not heard about B, so nothing happens yet —
    // crucially, nothing is destroyed either.
    expect(first.glared.size).toBe(0);
    expect(first.connected.size).toBe(0);

    // Once A hears about B, the reconcile pass closes it.
    const views: ClientView[] = [
      { self: A, seesInCall: new Set([A, B]) },
      { self: B, seesInCall: new Set([A, B]) },
    ];
    const second = runRound(views, "new", first.connected);
    expect(second.connected.has(pairKey(A, B))).toBe(true);
  });

  it("UT-MESH-007: reconciliation completes the mesh on the next pass", () => {
    // Round 1 with frames in flight, round 2 once everyone has heard everyone —
    // which is what the participant-change and interval passes now guarantee.
    const first = runRound(partialVisibility(), "new", new Set());
    const second = runRound(fullVisibility(), "new", first.connected);

    expect(second.glared.size).toBe(0);
    expect([...second.connected].sort()).toEqual([...ALL_PAIRS].sort());
  });

  it("UT-MESH-008: reconciling again is idempotent — no duplicate offers", () => {
    const first = runRound(fullVisibility(), "new", new Set());
    const second = runRound(fullVisibility(), "new", first.connected);

    // Already-connected pairs are skipped, so a 3-second timer cannot spam
    // offers at a healthy mesh.
    expect(second.offerCounts.size).toBe(0);
    expect([...second.connected].sort()).toEqual([...ALL_PAIRS].sort());
  });

  it("UT-MESH-009: scales — a room of six has one offerer per pair and no glare", () => {
    const ids = ["s1", "s2", "s3", "s4", "s5", "s6"];
    const views: ClientView[] = ids.map((self) => ({ self, seesInCall: new Set(ids) }));

    const { connected, glared, offerCounts } = runRound(views, "new", new Set());

    // 6 people -> 15 pairs, each negotiated exactly once.
    expect(glared.size).toBe(0);
    expect(connected.size).toBe(15);
    for (const count of offerCounts.values()) expect(count).toBe(1);
  });
});
