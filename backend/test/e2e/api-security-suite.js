/**
 * ScholarBase — E2E functional + OWASP API Security Top 10 (2023) suite.
 *
 * Black-box: drives the running backend over HTTP exactly as a client would,
 * so global pipes, guards, filters and CORS middleware are all exercised.
 *
 *   node test/e2e/api-security-suite.js            # against localhost:3000
 *   API_BASE=https://host/api node ... /suite.js   # against a deployment
 *
 * Emits a human summary plus machine-readable JSON at qa-results.json.
 *
 * NOTE: creates and then deletes throwaway accounts. Point it at a dev
 * database, never production.
 *
 * RUN WITH BREVO_API_KEY UNSET. The rate-limit and enumeration checks fire
 * ~20 password-reset and resend-verification requests at ADMIN_EMAIL. With a
 * live key those become real Brevo sends to an address that does not exist,
 * which burns the 300/day free quota and — worse — generates hard bounces that
 * damage sender reputation. With the key unset, MailService logs instead:
 *
 *   BREVO_API_KEY= node test/e2e/api-security-suite.js
 */
require("dotenv/config");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const API = process.env.API_BASE || "http://localhost:3000/api";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ALLOWED_DOMAIN = process.env.QA_DOMAIN || "mmcoe.edu.in";

// Wire values of the shared UserRole enum (packages/shared-types/src/enums.ts).
const ROLE_ADMIN = "admin";
const ROLE_STUDENT = "student";

const results = [];
let studentToken = null;
let studentRefresh = null;
let studentId = null;
let adminToken = null;
const createdEmails = [];

function record({ id, phase, owasp, name, expected, actual, status, severity = "-", evidence = "" }) {
  results.push({ id, phase, owasp, name, expected, actual, status, severity, evidence });
  const tag = { PASS: "PASS", FAIL: "FAIL", WARN: "WARN", INFO: "INFO" }[status];
  console.log(`[${tag}] ${id}  ${name}`);
  if (status === "FAIL" || status === "WARN") {
    console.log(`         expected: ${expected}`);
    console.log(`         actual  : ${actual}`);
  }
}

async function req(method, urlPath, { body, token, headers = {}, raw = false } = {}) {
  const h = { ...headers };
  let payload;
  // fetch() forbids a body on GET/HEAD; drop it so probe requests still fire.
  const bodyAllowed = !["GET", "HEAD"].includes(method.toUpperCase());
  if (body !== undefined && bodyAllowed) {
    if (raw) {
      payload = body;
    } else {
      h["content-type"] = "application/json";
      payload = JSON.stringify(body);
    }
  }
  if (token) h.authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${urlPath}`, { method, headers: h, body: payload });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON body */
  }
  return { status: res.status, headers: res.headers, text, json };
}

/**
 * Lazily-created Prisma client, shared by the verification helper and cleanup.
 * The suite needs direct database access because only the HMAC of a
 * verification token is ever persisted — the raw token exists solely inside the
 * email, which this process cannot read.
 */
let prismaClient = null;
function getPrisma() {
  if (!prismaClient) {
    const { PrismaClient } = require("@prisma/client");
    prismaClient = new PrismaClient();
  }
  return prismaClient;
}

/**
 * Plants a verification token for a user and returns the raw value, hashing it
 * exactly as AuthService.hashVerificationToken does. This lets the real
 * /auth/verify-email endpoint be exercised over HTTP rather than bypassed.
 */
async function plantVerificationToken(userId) {
  const raw = crypto.randomBytes(32).toString("hex");
  const secret = process.env.JWT_REFRESH_SECRET;
  const tokenHash = crypto
    .createHmac("sha256", `email-verification:${secret}`)
    .update(raw)
    .digest("hex");

  await getPrisma().emailVerificationToken.create({
    data: { userId, tokenHash, expiresAt: new Date(Date.now() + 3_600_000) },
  });
  return raw;
}

const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
function signHS256(payload, secret) {
  const h = b64url({ alg: "HS256", typ: "JWT" });
  const p = b64url(payload);
  const sig = crypto.createHmac("sha256", secret).update(`${h}.${p}`).digest("base64url");
  return `${h}.${p}.${sig}`;
}

// ---------------------------------------------------------------- E2E: auth

async function e2eAuth() {
  const health = await req("GET", "/health");
  record({
    id: "E2E-001",
    phase: "E2E",
    owasp: "-",
    name: "Health endpoint is public and healthy",
    expected: "200",
    actual: String(health.status),
    status: health.status === 200 ? "PASS" : "FAIL",
  });

  // Signup outside the allowlisted university domain must be refused.
  const badDomain = await req("POST", "/auth/signup", {
    body: { email: `qa-outsider-${Date.now()}@gmail.com`, password: "QaPassword123", fullName: "QA Outsider" },
  });
  record({
    id: "E2E-002",
    phase: "E2E",
    owasp: "-",
    name: "Signup refuses a non-university email domain",
    expected: "400",
    actual: String(badDomain.status),
    status: badDomain.status === 400 ? "PASS" : "FAIL",
  });

  const email = `qa-student-${Date.now()}@${ALLOWED_DOMAIN}`;
  const password = "QaPassword123";
  const signup = await req("POST", "/auth/signup", {
    body: { email, password, fullName: "QA Student" },
  });
  if (signup.status === 201 || signup.status === 200) createdEmails.push(email);

  const issuedNoSession = !signup.json?.accessToken && !signup.json?.refreshToken;
  record({
    id: "E2E-003",
    phase: "E2E",
    owasp: "API2",
    name: "Signup creates the account but issues NO session until the email is confirmed",
    expected: "201/200, a message, and no tokens",
    actual: `${signup.status}, tokens=${!issuedNoSession}, body=${(signup.text || "").slice(0, 80)}`,
    status: (signup.status === 201 || signup.status === 200) && issuedNoSession ? "PASS" : "FAIL",
    severity: issuedNoSession ? "-" : "High",
  });

  const dup = await req("POST", "/auth/signup", {
    body: { email, password, fullName: "QA Student" },
  });
  record({
    id: "E2E-004",
    phase: "E2E",
    owasp: "-",
    name: "Duplicate signup is rejected with 409",
    expected: "409",
    actual: String(dup.status),
    status: dup.status === 409 ? "PASS" : "FAIL",
  });

  // The gate itself: correct credentials must still be refused pre-confirmation.
  const unverifiedLogin = await req("POST", "/auth/login", { body: { email, password } });
  record({
    id: "E2E-005a",
    phase: "E2E",
    owasp: "API2",
    name: "Login is refused with 403 while the address is unconfirmed",
    expected: "403 (not 401 — 401 is hijacked by the client's refresh interceptor)",
    actual: `${unverifiedLogin.status}: ${(unverifiedLogin.json?.message || "").slice(0, 70)}`,
    status: unverifiedLogin.status === 403 ? "PASS" : "FAIL",
    severity: unverifiedLogin.status === 403 ? "-" : "Critical",
  });

  // Exercise the real verification endpoint. Only the HMAC is stored, so the
  // raw token is planted directly with the same hashing the service uses.
  const created = await getPrisma().user.findUnique({ where: { email } });
  studentId = created?.id;

  const badToken = await req("POST", "/auth/verify-email", { body: { token: "not-a-real-token" } });
  record({
    id: "E2E-005b",
    phase: "E2E",
    owasp: "-",
    name: "A bogus confirmation token is rejected with 400",
    expected: "400",
    actual: String(badToken.status),
    status: badToken.status === 400 ? "PASS" : "FAIL",
  });

  const rawToken = await plantVerificationToken(studentId);
  const verify = await req("POST", "/auth/verify-email", { body: { token: rawToken } });
  record({
    id: "E2E-005c",
    phase: "E2E",
    owasp: "-",
    name: "A valid confirmation token verifies the account",
    expected: "200",
    actual: `${verify.status}: ${(verify.json?.message || "").slice(0, 60)}`,
    status: verify.status === 200 ? "PASS" : "FAIL",
  });

  const replay = await req("POST", "/auth/verify-email", { body: { token: rawToken } });
  record({
    id: "E2E-005d",
    phase: "E2E",
    owasp: "-",
    name: "Re-opening a spent link is handled gracefully, not as an error",
    expected: "200 (already confirmed)",
    actual: `${replay.status}: ${(replay.json?.message || "").slice(0, 60)}`,
    status: replay.status === 200 ? "PASS" : "WARN",
    severity: replay.status === 200 ? "-" : "Low",
  });

  const login = await req("POST", "/auth/login", { body: { email, password } });
  studentToken = login.json?.accessToken;
  studentRefresh = login.json?.refreshToken;
  record({
    id: "E2E-005",
    phase: "E2E",
    owasp: "-",
    name: "Login succeeds once the address is confirmed",
    expected: "200/201 with accessToken",
    actual: `${login.status}, token=${Boolean(login.json?.accessToken)}`,
    status: login.json?.accessToken ? "PASS" : "FAIL",
  });

  const wrongPw = await req("POST", "/auth/login", { body: { email, password: "WrongPassword1" } });
  record({
    id: "E2E-006",
    phase: "E2E",
    owasp: "-",
    name: "Login with wrong password is rejected",
    expected: "401",
    actual: String(wrongPw.status),
    status: wrongPw.status === 401 ? "PASS" : "FAIL",
  });

  const me = await req("GET", "/auth/me", { token: studentToken });
  record({
    id: "E2E-007",
    phase: "E2E",
    owasp: "-",
    name: "GET /auth/me returns the caller's profile",
    expected: "200 with matching email",
    actual: `${me.status}, email=${me.json?.email}`,
    status: me.status === 200 && me.json?.email === email ? "PASS" : "FAIL",
  });

  const meNoAuth = await req("GET", "/auth/me");
  record({
    id: "E2E-008",
    phase: "E2E",
    owasp: "-",
    name: "GET /auth/me without a token is rejected",
    expected: "401",
    actual: String(meNoAuth.status),
    status: meNoAuth.status === 401 ? "PASS" : "FAIL",
  });

  // Refresh rotation: old token must stop working once exchanged.
  const refreshed = await req("POST", "/auth/refresh", { body: { refreshToken: studentRefresh } });
  const reuse = await req("POST", "/auth/refresh", { body: { refreshToken: studentRefresh } });
  record({
    id: "E2E-009",
    phase: "E2E",
    owasp: "API2",
    name: "Refresh token rotates and the consumed token is revoked (replay blocked)",
    expected: "first 200/201, replay 401",
    actual: `first=${refreshed.status}, replay=${reuse.status}`,
    status: refreshed.json?.accessToken && reuse.status === 401 ? "PASS" : "FAIL",
    severity: reuse.status === 401 ? "-" : "High",
  });
  if (refreshed.json?.refreshToken) studentRefresh = refreshed.json.refreshToken;
  if (refreshed.json?.accessToken) studentToken = refreshed.json.accessToken;

  const adminLogin = await req("POST", "/auth/login", {
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  adminToken = adminLogin.json?.accessToken;
  record({
    id: "E2E-010",
    phase: "E2E",
    owasp: "-",
    name: "Seeded admin can authenticate",
    expected: `200/201 with role="${ROLE_ADMIN}"`,
    actual: `${adminLogin.status}, role=${adminLogin.json?.user?.role}`,
    status: adminToken && adminLogin.json?.user?.role === ROLE_ADMIN ? "PASS" : "FAIL",
  });
}

// ------------------------------------------------------ E2E: catalog + files

async function e2eCatalog() {
  const subjects = await req("GET", "/subjects");
  record({
    id: "E2E-011",
    phase: "E2E",
    owasp: "-",
    name: "Subject catalog is publicly readable",
    expected: "200 with array",
    actual: `${subjects.status}, n=${Array.isArray(subjects.json) ? subjects.json.length : "n/a"}`,
    status: subjects.status === 200 && Array.isArray(subjects.json) ? "PASS" : "FAIL",
  });

  const papers = await req("GET", "/papers");
  const firstPaper = Array.isArray(papers.json) ? papers.json[0] : null;
  record({
    id: "E2E-012",
    phase: "E2E",
    owasp: "-",
    name: "Question paper list is publicly readable",
    expected: "200 with array",
    actual: `${papers.status}, n=${Array.isArray(papers.json) ? papers.json.length : "n/a"}`,
    status: papers.status === 200 ? "PASS" : "FAIL",
  });

  if (firstPaper) {
    const view = await req("GET", `/papers/${firstPaper.id}/view`);
    const dto = view.json || {};
    record({
      id: "E2E-013",
      phase: "E2E",
      owasp: "-",
      name: "Paper view URL is issued to anonymous users (papers are public by design)",
      expected: "200 with url/fileName/mimeType",
      actual: `${view.status}, keys=${Object.keys(dto).join(",")}`,
      status: view.status === 200 && dto.url && dto.mimeType ? "PASS" : "FAIL",
    });

    record({
      id: "E2E-014",
      phase: "E2E",
      owasp: "API3",
      name: "View DTO does not leak the internal storage key",
      expected: "no fileKey / bucket internals in body",
      actual: Object.keys(dto).join(","),
      status: !("fileKey" in dto) ? "PASS" : "FAIL",
      severity: !("fileKey" in dto) ? "-" : "Low",
    });

    const dl = await req("GET", `/papers/${firstPaper.id}/download`);
    record({
      id: "E2E-015",
      phase: "E2E",
      owasp: "-",
      name: "Paper download URL is issued",
      expected: "200 with url",
      actual: `${dl.status}`,
      status: dl.status === 200 && dl.json?.url ? "PASS" : "FAIL",
    });

    // Presigned URL should actually resolve at the storage provider.
    if (view.json?.url) {
      try {
        const head = await fetch(view.json.url, { method: "GET" });
        record({
          id: "E2E-016",
          phase: "E2E",
          owasp: "-",
          name: "Presigned view URL resolves at object storage",
          expected: "200 from storage",
          actual: `${head.status} ${head.headers.get("content-type") || ""}`,
          status: head.status === 200 ? "PASS" : "FAIL",
          severity: head.status === 200 ? "-" : "High",
          evidence: head.status !== 200 ? "DB row references an object missing from the bucket" : "",
        });
      } catch (e) {
        record({
          id: "E2E-016",
          phase: "E2E",
          owasp: "-",
          name: "Presigned view URL resolves at object storage",
          expected: "200 from storage",
          actual: `network error: ${e.message}`,
          status: "FAIL",
          severity: "High",
        });
      }
    }
  }

  const missing = await req("GET", "/papers/3f7c1e2a-0b5d-4c6e-9a1b-2c3d4e5f6a7b/view");
  record({
    id: "E2E-017",
    phase: "E2E",
    owasp: "-",
    name: "Unknown paper id returns 404, not 500",
    expected: "404",
    actual: String(missing.status),
    status: missing.status === 404 ? "PASS" : "FAIL",
  });

  const notes = await req("GET", "/notes");
  record({
    id: "E2E-018",
    phase: "E2E",
    owasp: "-",
    name: "Notes list is publicly readable (metadata only)",
    expected: "200",
    actual: String(notes.status),
    status: notes.status === 200 ? "PASS" : "FAIL",
  });
}

// -------------------------------------------------- OWASP API1 / API5: authz

async function owaspAuthorization() {
  // API5 BFLA — student must not reach admin-only functions.
  const adminOnly = [
    ["POST", "/papers", "Upload question paper"],
    ["POST", "/notes", "Upload note"],
    ["GET", "/study-rooms/admin/all", "Admin study-room oversight"],
    ["POST", "/subjects", "Create subject"],
    ["POST", "/year-levels", "Create year level"],
    ["POST", "/exam-types", "Create exam type"],
  ];

  let idx = 0;
  for (const [method, route, label] of adminOnly) {
    idx += 1;
    const asStudent = await req(method, route, { token: studentToken, body: {} });
    const forbidden = asStudent.status === 403;
    record({
      id: `SEC-API5-${String(idx).padStart(3, "0")}`,
      phase: "Security",
      owasp: "API5 Broken Function Level Authorization",
      name: `Student is denied admin function: ${label}`,
      expected: "403 Forbidden",
      actual: String(asStudent.status),
      status: forbidden ? "PASS" : "FAIL",
      severity: forbidden ? "-" : "Critical",
    });
  }

  // Same routes with no credentials at all.
  const anonAdmin = await req("GET", "/study-rooms/admin/all");
  record({
    id: "SEC-API5-007",
    phase: "Security",
    owasp: "API5 Broken Function Level Authorization",
    name: "Anonymous caller is denied the admin oversight endpoint",
    expected: "401",
    actual: String(anonAdmin.status),
    status: anonAdmin.status === 401 ? "PASS" : "FAIL",
    severity: anonAdmin.status === 401 ? "-" : "Critical",
  });

  // API1 BOLA — notes file access is the gated object in this app.
  const notes = await req("GET", "/notes");
  const firstNote = Array.isArray(notes.json) ? notes.json[0] : null;
  if (firstNote) {
    const anon = await req("GET", `/notes/${firstNote.id}/view`);
    record({
      id: "SEC-API1-001",
      phase: "Security",
      owasp: "API1 Broken Object Level Authorization",
      name: "Anonymous user cannot obtain a note view URL",
      expected: "401",
      actual: String(anon.status),
      status: anon.status === 401 ? "PASS" : "FAIL",
      severity: anon.status === 401 ? "-" : "High",
    });
    const anonDl = await req("GET", `/notes/${firstNote.id}/download`);
    record({
      id: "SEC-API1-002",
      phase: "Security",
      owasp: "API1 Broken Object Level Authorization",
      name: "Anonymous user cannot obtain a note download URL",
      expected: "401",
      actual: String(anonDl.status),
      status: anonDl.status === 401 ? "PASS" : "FAIL",
      severity: anonDl.status === 401 ? "-" : "High",
    });
  } else {
    record({
      id: "SEC-API1-001",
      phase: "Security",
      owasp: "API1 Broken Object Level Authorization",
      name: "Anonymous user cannot obtain a note view URL",
      expected: "401",
      actual: "no notes seeded — untested",
      status: "INFO",
    });
  }

  // API1 — a student must not read another user's identity via /auth/me.
  const meAsStudent = await req("GET", "/auth/me", { token: studentToken });
  record({
    id: "SEC-API1-003",
    phase: "Security",
    owasp: "API1 Broken Object Level Authorization",
    name: "/auth/me is scoped to the bearer's own account (no id parameter to tamper)",
    expected: "returns only the caller",
    actual: `id=${meAsStudent.json?.id === studentId ? "self" : "OTHER"}`,
    status: meAsStudent.json?.id === studentId ? "PASS" : "FAIL",
    severity: meAsStudent.json?.id === studentId ? "-" : "Critical",
  });

  // API1 — private study room should be unreachable by a non-member.
  const rooms = await req("GET", "/study-rooms", { token: studentToken });
  record({
    id: "SEC-API1-004",
    phase: "Security",
    owasp: "API1 Broken Object Level Authorization",
    name: "Study room listing requires authentication",
    expected: "200 for member, 401 anonymous",
    actual: `auth=${rooms.status}, anon=${(await req("GET", "/study-rooms")).status}`,
    status: rooms.status === 200 ? "PASS" : "INFO",
  });
}

// ------------------------------------------------------- OWASP API2: authn

async function owaspAuthentication() {
  const cases = [
    ["SEC-API2-001", "No Authorization header", undefined],
    ["SEC-API2-002", "Malformed token string", "not-a-jwt"],
    ["SEC-API2-003", "Structurally valid JWT signed with the wrong secret", signHS256({ sub: studentId, role: "ADMIN" }, "attacker-secret")],
    ["SEC-API2-004", "alg:none unsigned token (algorithm confusion)", `${b64url({ alg: "none", typ: "JWT" })}.${b64url({ sub: studentId, role: "ADMIN" })}.`],
    ["SEC-API2-005", "Expired token", signHS256({ sub: studentId, role: "ADMIN", exp: Math.floor(Date.now() / 1000) - 60 }, process.env.JWT_ACCESS_SECRET || "x")],
  ];

  for (const [id, name, token] of cases) {
    const res = await req("GET", "/auth/me", { token });
    record({
      id,
      phase: "Security",
      owasp: "API2 Broken Authentication",
      name: `Rejected: ${name}`,
      expected: "401",
      actual: String(res.status),
      status: res.status === 401 ? "PASS" : "FAIL",
      severity: res.status === 401 ? "-" : "Critical",
    });
  }

  // Privilege escalation via a self-signed token using the REAL secret would
  // succeed by design; the meaningful test is that role comes from the DB, not
  // from the token claim. Forge a token with the real access secret but a
  // tampered role and confirm admin routes still refuse it.
  const realSecret = process.env.JWT_ACCESS_SECRET;
  if (realSecret) {
    const forged = signHS256(
      { sub: studentId, email: "qa@x", role: "ADMIN", exp: Math.floor(Date.now() / 1000) + 300 },
      realSecret,
    );
    const res = await req("GET", "/study-rooms/admin/all", { token: forged });
    const blocked = res.status === 403 || res.status === 401;
    record({
      id: "SEC-API2-006",
      phase: "Security",
      owasp: "API2 Broken Authentication",
      name: "Role claim tampering: token says ADMIN, database says student",
      expected: "403/401 — role must be re-checked server-side",
      actual: String(res.status),
      status: blocked ? "PASS" : "FAIL",
      severity: blocked ? "-" : "Critical",
      evidence: blocked
        ? "Role is resolved from the database, not trusted from the JWT claim"
        : "Server trusted the role claim inside the JWT",
    });
  }

  // Logout must actually revoke.
  const logout = await req("POST", "/auth/logout", {
    token: studentToken,
    body: { refreshToken: studentRefresh },
  });
  const afterLogout = await req("POST", "/auth/refresh", { body: { refreshToken: studentRefresh } });
  record({
    id: "SEC-API2-007",
    phase: "Security",
    owasp: "API2 Broken Authentication",
    name: "Logout revokes the refresh token",
    expected: "logout 204, subsequent refresh 401",
    actual: `logout=${logout.status}, refresh=${afterLogout.status}`,
    status: afterLogout.status === 401 ? "PASS" : "FAIL",
    severity: afterLogout.status === 401 ? "-" : "High",
  });
}

// ------------------------------- OWASP API3: property-level authz / exposure

async function owaspPropertyLevel() {
  // Mass assignment: try to self-provision an admin account at signup.
  const email = `qa-escalate-${Date.now()}@${ALLOWED_DOMAIN}`;
  const res = await req("POST", "/auth/signup", {
    body: { email, password: "QaPassword123", fullName: "QA Escalate", role: "admin" },
  });
  if (res.status === 201 || res.status === 200) createdEmails.push(email);

  const rejected = res.status === 400;
  const createdAsStudent = res.json?.user?.role === ROLE_STUDENT;
  record({
    id: "SEC-API3-001",
    phase: "Security",
    owasp: "API3 Broken Object Property Level Authorization",
    name: "Mass assignment: extra 'role' field at signup cannot grant admin",
    expected: `400 (whitelist rejects unknown property) or account created as "${ROLE_STUDENT}"`,
    actual: `${res.status}, role=${res.json?.user?.role ?? "n/a"}`,
    status: rejected || createdAsStudent ? "PASS" : "FAIL",
    severity: rejected || createdAsStudent ? "-" : "Critical",
    evidence: rejected ? "ValidationPipe forbidNonWhitelisted rejected the payload" : "",
  });

  // Excessive data exposure: no password material in any auth response.
  const login = await req("POST", "/auth/login", {
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  const bodyText = login.text || "";
  const leaks = ["passwordHash", "$argon2", "tokenHash"].filter((s) => bodyText.includes(s));
  record({
    id: "SEC-API3-002",
    phase: "Security",
    owasp: "API3 Broken Object Property Level Authorization",
    name: "Login response contains no password hash or token hash",
    expected: "no credential material in body",
    actual: leaks.length ? `leaked: ${leaks.join(",")}` : "clean",
    status: leaks.length === 0 ? "PASS" : "FAIL",
    severity: leaks.length === 0 ? "-" : "Critical",
  });

  // Public paper listing should not expose uploader identity or storage keys.
  const papers = await req("GET", "/papers");
  const sample = Array.isArray(papers.json) ? papers.json[0] : null;
  if (sample) {
    const sensitive = ["fileKey", "checksum"].filter((k) => k in sample);
    record({
      id: "SEC-API3-003",
      phase: "Security",
      owasp: "API3 Broken Object Property Level Authorization",
      name: "Public paper DTO omits storage key and checksum",
      expected: "no fileKey/checksum",
      actual: sensitive.length ? `exposed: ${sensitive.join(",")}` : `fields: ${Object.keys(sample).join(",")}`,
      status: sensitive.length === 0 ? "PASS" : "WARN",
      severity: sensitive.length === 0 ? "-" : "Low",
    });
  }
}

// ------------------------------ OWASP API4/API6: resource consumption & flows

async function owaspResourceConsumption() {
  // Brute force: fire sequential bad logins and see whether anything throttles.
  const attempts = 25;
  const codes = [];
  const started = Date.now();
  for (let i = 0; i < attempts; i += 1) {
    const r = await req("POST", "/auth/login", {
      body: { email: ADMIN_EMAIL, password: `wrong-${i}` },
    });
    codes.push(r.status);
  }
  const elapsed = Date.now() - started;
  const throttled = codes.filter((c) => c === 429).length;
  record({
    id: "SEC-API4-001",
    phase: "Security",
    owasp: "API4 Unrestricted Resource Consumption",
    name: `Brute-force protection on login (${attempts} bad attempts)`,
    expected: "some 429 Too Many Requests / lockout",
    actual: `0 throttled, all ${codes.length} answered ${[...new Set(codes)].join("/")} in ${elapsed}ms`,
    status: throttled > 0 ? "PASS" : "FAIL",
    severity: throttled > 0 ? "-" : "High",
    evidence: "No rate limiter (@nestjs/throttler) is registered in AppModule",
  });

  // API6: password-reset flow abuse — unlimited emails to one address.
  const resetCodes = [];
  for (let i = 0; i < 6; i += 1) {
    const r = await req("POST", "/auth/forgot-password", { body: { email: ADMIN_EMAIL } });
    resetCodes.push(r.status);
  }
  const resetThrottled = resetCodes.filter((c) => c === 429).length;
  record({
    id: "SEC-API6-001",
    phase: "Security",
    owasp: "API6 Unrestricted Access to Sensitive Business Flows",
    name: "Password-reset requests are rate limited per address",
    expected: "throttling after a few requests",
    actual: `${resetCodes.length} accepted (${[...new Set(resetCodes)].join("/")}), 0 throttled`,
    status: resetThrottled > 0 ? "PASS" : "FAIL",
    severity: resetThrottled > 0 ? "-" : "Medium",
    evidence: "Each request consumes provider email quota (Brevo free tier: 300/day)",
  });

  // Oversized payload handling.
  const big = "x".repeat(2 * 1024 * 1024);
  const bigRes = await req("POST", "/auth/login", { body: { email: `${big}@x.com`, password: "p" } });
  record({
    id: "SEC-API4-002",
    phase: "Security",
    owasp: "API4 Unrestricted Resource Consumption",
    name: "Oversized JSON body is rejected rather than processed",
    expected: "413 / 400",
    actual: String(bigRes.status),
    status: [413, 400, 401].includes(bigRes.status) ? "PASS" : "WARN",
    severity: [413, 400, 401].includes(bigRes.status) ? "-" : "Medium",
  });

  // Enumeration oracle: compare timing of registered vs unregistered address.
  const timeIt = async (addr) => {
    const t0 = process.hrtime.bigint();
    await req("POST", "/auth/forgot-password", { body: { email: addr } });
    return Number(process.hrtime.bigint() - t0) / 1e6;
  };
  const unknownTimes = [];
  const knownTimes = [];
  for (let i = 0; i < 4; i += 1) {
    unknownTimes.push(await timeIt(`ghost-${i}-${Date.now()}@${ALLOWED_DOMAIN}`));
    knownTimes.push(await timeIt(ADMIN_EMAIL));
  }
  const avg = (a) => a.reduce((s, n) => s + n, 0) / a.length;
  const unknownAvg = avg(unknownTimes);
  const knownAvg = avg(knownTimes);
  const ratio = knownAvg / unknownAvg;
  record({
    id: "SEC-API6-002",
    phase: "Security",
    owasp: "API6 Unrestricted Access to Sensitive Business Flows",
    name: "Forgot-password timing does not reveal whether an account exists",
    expected: "comparable latency for known vs unknown addresses",
    actual: `registered ${knownAvg.toFixed(1)}ms vs unregistered ${unknownAvg.toFixed(1)}ms (${ratio.toFixed(2)}x)`,
    status: ratio < 1.5 ? "PASS" : "FAIL",
    severity: ratio < 1.5 ? "-" : "Medium",
    evidence: "Registered path performs 2 extra DB writes plus an awaited outbound mail call",
  });

  // Response-body uniformity (the defence the code actually implements).
  // Resend-verification must be as enumeration-safe as forgot-password: it also
  // distinguishes "registered", "unregistered" and "already verified".
  const resendKnown = await req("POST", "/auth/resend-verification", { body: { email: ADMIN_EMAIL } });
  const resendUnknown = await req("POST", "/auth/resend-verification", {
    body: { email: `nobody-${Date.now()}@${ALLOWED_DOMAIN}` },
  });
  record({
    id: "SEC-API6-004",
    phase: "Security",
    owasp: "API6 Unrestricted Access to Sensitive Business Flows",
    name: "Resend-verification answers identically for known, unknown and already-verified addresses",
    expected: "same status and body",
    actual: `${resendKnown.status}/${resendUnknown.status}, identical=${resendKnown.text === resendUnknown.text}`,
    status:
      resendKnown.status === resendUnknown.status && resendKnown.text === resendUnknown.text
        ? "PASS"
        : "FAIL",
    severity: "-",
  });

  const known = await req("POST", "/auth/forgot-password", { body: { email: ADMIN_EMAIL } });
  const unknown = await req("POST", "/auth/forgot-password", {
    body: { email: `nobody-${Date.now()}@${ALLOWED_DOMAIN}` },
  });
  record({
    id: "SEC-API6-003",
    phase: "Security",
    owasp: "API6 Unrestricted Access to Sensitive Business Flows",
    name: "Forgot-password response body/status is identical for both cases",
    expected: "same status and body",
    actual: `${known.status}/${unknown.status}, identical=${known.text === unknown.text}`,
    status: known.status === unknown.status && known.text === unknown.text ? "PASS" : "FAIL",
    severity: "-",
  });
}

// --------------------------------- OWASP API7/API8/API9/API10: config & misc

async function owaspConfiguration() {
  const res = await req("GET", "/health", {
    headers: { Origin: "https://evil.example.com" },
  });
  const acao = res.headers.get("access-control-allow-origin");
  const permissive = acao === "*" || acao === "https://evil.example.com";
  record({
    id: "SEC-API8-001",
    phase: "Security",
    owasp: "API8 Security Misconfiguration",
    name: "CORS does not reflect/allow arbitrary origins",
    expected: "origin allowlist (not * or reflected)",
    actual: `Access-Control-Allow-Origin: ${acao ?? "(absent)"}`,
    status: permissive ? "FAIL" : "PASS",
    severity: permissive ? "Medium" : "-",
    evidence: permissive ? "main.ts uses NestFactory.create(AppModule, { cors: true })" : "",
  });

  const headerChecks = [
    ["x-content-type-options", "nosniff", "Medium"],
    ["x-frame-options", "DENY/SAMEORIGIN", "Medium"],
    ["strict-transport-security", "max-age=...", "Medium"],
    ["content-security-policy", "a policy", "Medium"],
  ];
  let hIdx = 1;
  for (const [header, expected, severity] of headerChecks) {
    hIdx += 1;
    const present = res.headers.get(header);
    record({
      id: `SEC-API8-${String(hIdx).padStart(3, "0")}`,
      phase: "Security",
      owasp: "API8 Security Misconfiguration",
      name: `Security header present: ${header}`,
      expected,
      actual: present ?? "(absent)",
      status: present ? "PASS" : "FAIL",
      severity: present ? "-" : severity,
      evidence: present ? "" : "helmet middleware is not registered",
    });
  }

  const poweredBy = res.headers.get("x-powered-by");
  record({
    id: "SEC-API9-001",
    phase: "Security",
    owasp: "API9 Improper Inventory Management",
    name: "Server does not advertise its framework via X-Powered-By",
    expected: "(absent)",
    actual: poweredBy ?? "(absent)",
    status: poweredBy ? "FAIL" : "PASS",
    severity: poweredBy ? "Low" : "-",
  });

  // Error handling must not leak stack traces or SQL.
  const boom = await req("POST", "/auth/login", { body: "{not json", raw: true, headers: { "content-type": "application/json" } });
  const leaky = /at\s+\/|node_modules|prisma\.|SELECT\s|\.ts:\d+/i.test(boom.text || "");
  record({
    id: "SEC-API8-006",
    phase: "Security",
    owasp: "API8 Security Misconfiguration",
    name: "Malformed request does not leak stack traces or internals",
    expected: "generic error body",
    actual: leaky ? "internals present in body" : `clean (${boom.status})`,
    status: leaky ? "FAIL" : "PASS",
    severity: leaky ? "High" : "-",
    evidence: (boom.text || "").slice(0, 160),
  });

  // Unhandled verbs / undocumented surface. undici refuses to emit TRACE at
  // all, so a rejection here means the client blocked it, not the server.
  let traceActual;
  let traceStatus;
  try {
    const trace = await req("TRACE", "/health");
    traceActual = String(trace.status);
    traceStatus = [404, 405, 501].includes(trace.status) ? "PASS" : "WARN";
  } catch (e) {
    traceActual = `not sent by client (${e.message})`;
    traceStatus = "INFO";
  }
  record({
    id: "SEC-API9-002",
    phase: "Security",
    owasp: "API9 Improper Inventory Management",
    name: "TRACE verb is not served",
    expected: "404/405",
    actual: traceActual,
    status: traceStatus,
    severity: "-",
  });

  // Undocumented/dangerous verbs that the client CAN send.
  for (const verb of ["PUT", "PATCH", "DELETE"]) {
    const r = await req(verb, "/health");
    record({
      id: `SEC-API9-00${3 + ["PUT", "PATCH", "DELETE"].indexOf(verb)}`,
      phase: "Security",
      owasp: "API9 Improper Inventory Management",
      name: `${verb} on a GET-only route is not served`,
      expected: "404/405",
      actual: String(r.status),
      status: [404, 405].includes(r.status) ? "PASS" : "WARN",
      severity: [404, 405].includes(r.status) ? "-" : "Low",
    });
  }

  // API7 SSRF — no endpoint accepts a caller-supplied URL to fetch. Verify that
  // the one outbound integration (Brevo) uses a hardcoded endpoint.
  const mailSrc = fs.readFileSync(
    path.join(__dirname, "..", "..", "src", "modules", "mail", "mail.service.ts"),
    "utf8",
  );
  const hardcoded = /const BREVO_ENDPOINT = "https:\/\/api\.brevo\.com/.test(mailSrc);
  record({
    id: "SEC-API7-001",
    phase: "Security",
    owasp: "API7 Server Side Request Forgery",
    name: "No user-controlled URL is fetched server-side",
    expected: "outbound endpoints are hardcoded",
    actual: hardcoded ? "Brevo endpoint is a module constant" : "endpoint may be configurable",
    status: hardcoded ? "PASS" : "WARN",
    severity: hardcoded ? "-" : "Medium",
  });

  // API10 — response from the third-party mail API is not echoed to clients.
  const echoesProvider = /return .*response\.(text|json)\(\)|throw new Error\(await response/.test(mailSrc);
  record({
    id: "SEC-API10-001",
    phase: "Security",
    owasp: "API10 Unsafe Consumption of APIs",
    name: "Third-party (Brevo) response is not reflected to API clients",
    expected: "provider errors logged server-side only",
    actual: echoesProvider ? "provider body may reach the client" : "provider body is logged, generic error thrown",
    status: echoesProvider ? "WARN" : "PASS",
    severity: echoesProvider ? "Low" : "-",
  });

  // Injection sanity: Prisma is parameterised, but confirm behaviour.
  const inject = await req("GET", "/papers?subjectId=' OR '1'='1");
  record({
    id: "SEC-INJ-001",
    phase: "Security",
    owasp: "API8 Security Misconfiguration",
    name: "SQL-injection style input is rejected by validation, not passed to the ORM",
    expected: "400",
    actual: String(inject.status),
    status: inject.status === 400 ? "PASS" : "WARN",
    severity: inject.status === 400 ? "-" : "Medium",
  });

  const xss = await req("POST", "/auth/signup", {
    body: {
      email: `qa-xss-${Date.now()}@${ALLOWED_DOMAIN}`,
      password: "QaPassword123",
      fullName: "<script>alert(1)</script>",
    },
  });
  if (xss.json?.user?.email) createdEmails.push(xss.json.user.email);
  const storedRaw = xss.json?.user?.fullName === "<script>alert(1)</script>";
  record({
    id: "SEC-INJ-002",
    phase: "Security",
    owasp: "API3 Broken Object Property Level Authorization",
    name: "Script payload in fullName is stored raw (relies on React escaping at render)",
    expected: "stored escaped, or documented as render-time escaped",
    actual: storedRaw ? "stored verbatim" : "modified on store",
    status: storedRaw ? "WARN" : "PASS",
    severity: storedRaw ? "Low" : "-",
    evidence: "React escapes by default; risk is limited to any future non-React consumer",
  });
}

// --------------------------------------------------------------- cleanup

async function cleanup() {
  try {
    if (createdEmails.length) {
      // Tokens cascade with the user row, so deleting the account is enough.
      const del = await getPrisma().user.deleteMany({ where: { email: { in: createdEmails } } });
      console.log(`\nCleanup: removed ${del.count} throwaway QA account(s).`);
    }
  } catch (e) {
    console.log(`\nCleanup FAILED (remove manually: ${createdEmails.join(", ")}): ${e.message}`);
  } finally {
    if (prismaClient) await prismaClient.$disconnect().catch(() => undefined);
  }
}

(async () => {
  console.log(`ScholarBase QA suite -> ${API}\n`);
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("ADMIN_EMAIL / ADMIN_PASSWORD must be set (they are read from backend/.env).");
    process.exit(1);
  }

  try {
    await e2eAuth();
    await e2eCatalog();
    await owaspAuthorization();
    await owaspAuthentication();
    await owaspPropertyLevel();
    await owaspResourceConsumption();
    await owaspConfiguration();
  } catch (err) {
    console.error("\nSuite aborted:", err);
  } finally {
    await cleanup();
  }

  const tally = results.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }), {});
  console.log("\n================ SUMMARY ================");
  console.log(
    `Total ${results.length} | PASS ${tally.PASS || 0} | FAIL ${tally.FAIL || 0} | WARN ${tally.WARN || 0} | INFO ${tally.INFO || 0}`,
  );
  const failures = results.filter((r) => r.status === "FAIL" || r.status === "WARN");
  if (failures.length) {
    console.log("\nIssues:");
    for (const f of failures) {
      console.log(`  [${f.severity}] ${f.id} ${f.name}\n        -> ${f.actual}`);
    }
  }

  fs.writeFileSync(path.join(process.cwd(), "qa-results.json"), JSON.stringify(results, null, 2));
  console.log("\nMachine-readable results written to qa-results.json");
})();
