/**
 * ScholarBase — realtime (study room) regression suite.
 *
 * Drives two authenticated socket clients against the running gateway and
 * checks every realtime module: presence, chat, typing, the shared whiteboard,
 * the screen-share pointer, and WebRTC signalling relay — including the
 * authorization rules, which are the parts that must never regress.
 *
 *   node test/e2e/realtime-suite.js
 *
 * Creates throwaway accounts and a throwaway room, and deletes both at the end.
 * Point it at a development database, never production.
 */
require("dotenv/config");
const { io } = require("socket.io-client");

const API = process.env.API_BASE || "http://localhost:3000";
const DOMAIN = process.env.QA_DOMAIN || "mmcoe.edu.in";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const results = [];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function record({ id, module: mod, name, expected, actual, status, severity = "-" }) {
  results.push({ id, module: mod, name, expected, actual, status, severity });
  console.log(`[${status}] ${id.padEnd(14)} ${name}`);
  if (status !== "PASS") {
    console.log(`               expected: ${expected}`);
    console.log(`               actual  : ${actual}`);
  }
}

async function api(path, options = {}) {
  const res = await fetch(`${API}/api${path}`, {
    ...options,
    headers: { "content-type": "application/json", ...(options.headers || {}) },
  });
  const text = await res.text();
  try {
    return { status: res.status, json: JSON.parse(text) };
  } catch {
    return { status: res.status, json: null };
  }
}

async function login(email, password) {
  const r = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  if (!r.json?.accessToken) throw new Error(`login failed for ${email}: ${r.status}`);
  return r.json;
}

/** Signs up a throwaway student and marks it verified directly, since the
 * login gate now requires a confirmed address and we have no inbox here. */
async function makeStudent(prisma, label) {
  const email = `qa.rt.${label}.${Date.now()}@${DOMAIN}`;
  await api("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password: "QaPassword123", fullName: `QA ${label}` }),
  });
  await prisma.user.updateMany({ where: { email }, data: { emailVerifiedAt: new Date() } });
  return { email, ...(await login(email, "QaPassword123")) };
}

function connect(token) {
  const socket = io(`${API}/study-rooms`, { transports: ["websocket"], auth: { token } });
  const seen = [];
  const record = (event) => (payload) => seen.push({ event, payload });
  [
    "room:joined",
    "room:participant-joined",
    "room:participant-left",
    "chat:message",
    "chat:typing",
    "webrtc:signal",
    "media:state",
    "whiteboard:state",
    "whiteboard:stroke",
    "whiteboard:grants",
    "whiteboard:undo",
    "whiteboard:cleared",
    "whiteboard:draw-requested",
    "screen:pointer",
    "room:error",
  ].forEach((e) => socket.on(e, record(e)));
  return { socket, seen, of: (e) => seen.filter((x) => x.event === e) };
}

(async () => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("ADMIN_EMAIL / ADMIN_PASSWORD must be set (read from backend/.env)");
    process.exit(1);
  }

  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  const created = [];
  let roomId = null;

  try {
    const owner = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
    const student = await makeStudent(prisma, "student");
    created.push(student.email);

    const room = await api("/study-rooms", {
      method: "POST",
      headers: { authorization: `Bearer ${owner.accessToken}` },
      body: JSON.stringify({ name: `Realtime QA ${Date.now()}`, visibility: "public" }),
    });
    roomId = room.json?.id;
    if (!roomId) throw new Error(`could not create room: ${room.status}`);

    const A = connect(owner.accessToken);
    const B = connect(student.accessToken);
    await Promise.all([
      new Promise((r) => A.socket.on("connect", r)),
      new Promise((r) => B.socket.on("connect", r)),
    ]);

    // ---------------------------------------------------------------- presence
    A.socket.emit("room:join", { roomId });
    await wait(500);
    B.socket.emit("room:join", { roomId });
    await wait(800);

    record({
      id: "RT-PRES-001",
      module: "Presence",
      name: "Joining emits a roster to the joiner",
      expected: "room:joined with self + participants",
      actual: `joined events=${A.of("room:joined").length}`,
      status: A.of("room:joined").length === 1 ? "PASS" : "FAIL",
    });

    record({
      id: "RT-PRES-002",
      module: "Presence",
      name: "Existing members are told when someone joins",
      expected: "participant-joined on the earlier client",
      actual: `${A.of("room:participant-joined").length} event(s)`,
      status: A.of("room:participant-joined").length >= 1 ? "PASS" : "FAIL",
    });

    // -------------------------------------------------------------------- chat
    B.socket.emit("chat:send", { roomId, body: "hello from the realtime suite" });
    await wait(800);
    const gotMsg = A.of("chat:message").some((m) => m.payload.body.includes("realtime suite"));
    record({
      id: "RT-CHAT-001",
      module: "Chat",
      name: "A message reaches the other participant",
      expected: "chat:message delivered",
      actual: gotMsg ? "delivered" : "not received",
      status: gotMsg ? "PASS" : "FAIL",
    });

    const longBody = "x".repeat(5000);
    const beforeLong = A.of("chat:message").length;
    B.socket.emit("chat:send", { roomId, body: longBody });
    await wait(700);
    const overLimitBlocked = A.of("chat:message").length === beforeLong;
    record({
      id: "RT-CHAT-002",
      module: "Chat",
      name: "An over-length message is rejected, not broadcast",
      expected: "no broadcast",
      actual: overLimitBlocked ? "rejected" : "broadcast anyway",
      status: overLimitBlocked ? "PASS" : "FAIL",
      severity: overLimitBlocked ? "-" : "Medium",
    });

    B.socket.emit("chat:typing", { roomId, isTyping: true });
    await wait(600);
    record({
      id: "RT-CHAT-003",
      module: "Chat",
      name: "Typing indicator is relayed",
      expected: "chat:typing on the peer",
      actual: `${A.of("chat:typing").length} event(s)`,
      status: A.of("chat:typing").length >= 1 ? "PASS" : "FAIL",
    });

    // -------------------------------------------------------------- whiteboard
    A.socket.emit("whiteboard:claim", { roomId });
    await wait(700);
    const claimed = A.of("whiteboard:state").at(-1);
    record({
      id: "RT-WB-001",
      module: "Whiteboard",
      name: "Owner can claim the board",
      expected: "whiteboard:state naming the owner",
      actual: `owner=${claimed?.payload?.ownerName ?? "none"}`,
      status: claimed?.payload?.ownerSocketId ? "PASS" : "FAIL",
    });

    const secondClaim = B.of("room:error").length;
    B.socket.emit("whiteboard:claim", { roomId });
    await wait(600);
    record({
      id: "RT-WB-002",
      module: "Whiteboard",
      name: "A second person cannot seize an owned board",
      expected: "refused with an error",
      actual: B.of("room:error").length > secondClaim ? "refused" : "allowed",
      status: B.of("room:error").length > secondClaim ? "PASS" : "FAIL",
      severity: B.of("room:error").length > secondClaim ? "-" : "High",
    });

    const beforeUngranted = A.of("whiteboard:stroke").length;
    B.socket.emit("whiteboard:stroke", {
      roomId, strokeId: "rt-nogrant", color: "#f00", width: 3,
      points: [0.1, 0.1, 0.2, 0.2], done: true,
    });
    await wait(700);
    const ungrantedBlocked = A.of("whiteboard:stroke").length === beforeUngranted;
    record({
      id: "RT-WB-003",
      module: "Whiteboard",
      name: "SECURITY — drawing without a grant is ignored",
      expected: "no stroke broadcast",
      actual: ungrantedBlocked ? "ignored" : "broadcast (BUG)",
      status: ungrantedBlocked ? "PASS" : "FAIL",
      severity: ungrantedBlocked ? "-" : "High",
    });

    B.socket.emit("whiteboard:request-draw", { roomId });
    await wait(600);
    record({
      id: "RT-WB-004",
      module: "Whiteboard",
      name: "Ask-to-draw reaches the owner only",
      expected: "draw-requested on owner, not on others",
      actual: `owner=${A.of("whiteboard:draw-requested").length}, other=${B.of("whiteboard:draw-requested").length}`,
      status:
        A.of("whiteboard:draw-requested").length >= 1 &&
        B.of("whiteboard:draw-requested").length === 0
          ? "PASS"
          : "FAIL",
    });

    A.socket.emit("whiteboard:grant", { roomId, userId: student.user.id });
    await wait(700);
    const granted = B.of("whiteboard:grants").at(-1)?.payload?.grants ?? [];
    record({
      id: "RT-WB-005",
      module: "Whiteboard",
      name: "Owner can grant the pen",
      expected: "grant broadcast including the student",
      actual: JSON.stringify(granted),
      status: granted.includes(student.user.id) ? "PASS" : "FAIL",
    });

    B.socket.emit("whiteboard:stroke", {
      roomId, strokeId: "rt-granted", color: "#00f", width: 4,
      points: [0.3, 0.3, 0.6, 0.6], done: true,
    });
    await wait(700);
    const drew = A.of("whiteboard:stroke").some((s) => s.payload.strokeId === "rt-granted");
    record({
      id: "RT-WB-006",
      module: "Whiteboard",
      name: "A granted student's stroke reaches the room",
      expected: "stroke broadcast",
      actual: drew ? "received" : "missing",
      status: drew ? "PASS" : "FAIL",
    });

    const badCoords = A.of("whiteboard:stroke").length;
    B.socket.emit("whiteboard:stroke", {
      roomId, strokeId: "rt-bad", color: "#000", width: 2,
      points: [5, -3, 0.5, 0.5], done: true,
    });
    await wait(600);
    record({
      id: "RT-WB-007",
      module: "Whiteboard",
      name: "Out-of-range coordinates are rejected",
      expected: "no broadcast",
      actual: A.of("whiteboard:stroke").length === badCoords ? "rejected" : "accepted (BUG)",
      status: A.of("whiteboard:stroke").length === badCoords ? "PASS" : "FAIL",
      severity: A.of("whiteboard:stroke").length === badCoords ? "-" : "Medium",
    });

    B.socket.emit("whiteboard:undo", { roomId });
    await wait(700);
    const undone = A.of("whiteboard:undo").at(-1)?.payload?.strokeId;
    record({
      id: "RT-WB-008",
      module: "Whiteboard",
      name: "Undo removes the caller's own stroke",
      expected: "undo of rt-granted",
      actual: String(undone),
      status: undone === "rt-granted" ? "PASS" : "FAIL",
    });

    const clearErrors = B.of("room:error").length;
    B.socket.emit("whiteboard:clear", { roomId });
    await wait(600);
    record({
      id: "RT-WB-009",
      module: "Whiteboard",
      name: "SECURITY — a non-owner cannot clear the board",
      expected: "refused",
      actual: B.of("room:error").length > clearErrors ? "refused" : "cleared (BUG)",
      status: B.of("room:error").length > clearErrors ? "PASS" : "FAIL",
      severity: B.of("room:error").length > clearErrors ? "-" : "High",
    });

    A.socket.emit("whiteboard:clear", { roomId });
    await wait(600);
    record({
      id: "RT-WB-010",
      module: "Whiteboard",
      name: "Owner can clear the board",
      expected: "cleared broadcast",
      actual: `${B.of("whiteboard:cleared").length} event(s)`,
      status: B.of("whiteboard:cleared").length >= 1 ? "PASS" : "FAIL",
    });

    // ----------------------------------------------------------- screen pointer
    const pointerBefore = A.of("screen:pointer").length;
    B.socket.emit("screen:pointer", { roomId, x: 0.4, y: 0.4, visible: true });
    await wait(600);
    record({
      id: "RT-PTR-001",
      module: "Screen pointer",
      name: "SECURITY — pointer is dropped when nobody is sharing",
      expected: "no relay",
      actual: A.of("screen:pointer").length === pointerBefore ? "dropped" : "relayed (BUG)",
      status: A.of("screen:pointer").length === pointerBefore ? "PASS" : "FAIL",
      severity: A.of("screen:pointer").length === pointerBefore ? "-" : "Medium",
    });

    A.socket.emit("media:state", {
      roomId, inCall: true, audioEnabled: true, videoEnabled: false, screenEnabled: true,
    });
    await wait(700);
    B.socket.emit("screen:pointer", { roomId, x: 0.25, y: 0.75, visible: true });
    await wait(700);
    const ptr = A.of("screen:pointer").at(-1)?.payload;
    record({
      id: "RT-PTR-002",
      module: "Screen pointer",
      name: "Pointer relays while a screen share is active",
      expected: "x=0.25 y=0.75 with the sender's name",
      actual: ptr ? `x=${ptr.x} y=${ptr.y} from ${ptr.fullName}` : "not received",
      status: ptr && ptr.x === 0.25 && ptr.y === 0.75 ? "PASS" : "FAIL",
    });

    const ptrBad = A.of("screen:pointer").length;
    B.socket.emit("screen:pointer", { roomId, x: 9, y: -2, visible: true });
    B.socket.emit("screen:pointer", { roomId, x: null, y: 0.5, visible: true });
    await wait(700);
    record({
      id: "RT-PTR-003",
      module: "Screen pointer",
      name: "Malformed / out-of-range pointer coordinates are rejected",
      expected: "no relay",
      actual: A.of("screen:pointer").length === ptrBad ? "rejected" : "relayed (BUG)",
      status: A.of("screen:pointer").length === ptrBad ? "PASS" : "FAIL",
      severity: A.of("screen:pointer").length === ptrBad ? "-" : "Medium",
    });

    // ------------------------------------------------------- webrtc signalling
    const sigBefore = A.of("webrtc:signal").length;
    B.socket.emit("webrtc:signal", {
      roomId, targetSocketId: A.socket.id, kind: "offer", data: { sdp: "fake" },
    });
    await wait(600);
    record({
      id: "RT-SIG-001",
      module: "WebRTC signalling",
      name: "Signals route to a peer in the same room",
      expected: "delivered",
      actual: A.of("webrtc:signal").length > sigBefore ? "delivered" : "dropped",
      status: A.of("webrtc:signal").length > sigBefore ? "PASS" : "FAIL",
    });

    const strayBefore = A.of("webrtc:signal").length;
    B.socket.emit("webrtc:signal", {
      roomId, targetSocketId: "not-a-real-socket", kind: "offer", data: { sdp: "x" },
    });
    await wait(600);
    record({
      id: "RT-SIG-002",
      module: "WebRTC signalling",
      name: "SECURITY — signals to a non-member socket are refused",
      expected: "no relay",
      actual: A.of("webrtc:signal").length === strayBefore ? "refused" : "relayed (BUG)",
      status: A.of("webrtc:signal").length === strayBefore ? "PASS" : "FAIL",
      severity: A.of("webrtc:signal").length === strayBefore ? "-" : "High",
    });

    // ------------------------------------------------------------- leave/cleanup
    B.socket.emit("room:leave", { roomId });
    await wait(800);
    record({
      id: "RT-PRES-003",
      module: "Presence",
      name: "Leaving notifies the room",
      expected: "participant-left",
      actual: `${A.of("room:participant-left").length} event(s)`,
      status: A.of("room:participant-left").length >= 1 ? "PASS" : "FAIL",
    });

    A.socket.close();
    B.socket.close();
  } catch (err) {
    console.error("\nSuite aborted:", err.message);
  } finally {
    try {
      if (roomId) await prisma.studyRoom.deleteMany({ where: { id: roomId } });
      if (created.length) {
        const del = await prisma.user.deleteMany({ where: { email: { in: created } } });
        console.log(`\nCleanup: removed ${del.count} account(s) and the test room.`);
      }
    } catch (e) {
      console.log(`\nCleanup failed: ${e.message}`);
    }
    await prisma.$disconnect();
  }

  const tally = results.reduce((a, r) => ({ ...a, [r.status]: (a[r.status] || 0) + 1 }), {});
  console.log("\n================ REALTIME SUMMARY ================");
  console.log(`Total ${results.length} | PASS ${tally.PASS || 0} | FAIL ${tally.FAIL || 0}`);
  const byModule = {};
  results.forEach((r) => {
    byModule[r.module] = byModule[r.module] || { pass: 0, fail: 0 };
    if (r.status === "PASS") byModule[r.module].pass += 1;
    else byModule[r.module].fail += 1;
  });
  Object.entries(byModule).forEach(([m, s]) =>
    console.log(`  ${m.padEnd(20)} ${s.pass} passed${s.fail ? `, ${s.fail} FAILED` : ""}`),
  );

  require("fs").writeFileSync("qa-realtime-results.json", JSON.stringify(results, null, 2));
  process.exit(results.some((r) => r.status === "FAIL") ? 1 : 0);
})();
