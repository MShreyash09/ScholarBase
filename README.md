# ScholarBase

Previous-year question papers, notes, live study rooms, and an AI Q&A assistant for an
autonomous university. Fully open-source stack: PostgreSQL + pgvector, MinIO, Redis (from
phase 3 onward), NestJS (TypeScript), React, and a Python/FastAPI RAG service (phase 4).

See [`docs/adr` and the architecture plan] for the full design. This repo currently implements
**phase 1 (question papers), phase 2 (notes), and phase 3 (live study rooms)**.

## Access model

- **Public**: browse and download question papers, no account needed.
- **Logged in (student)**: also download notes, and open/join live study rooms (chat + audio/video).
- **Admin**: everything a student can do, plus managing year levels, subjects, exam types, and
  uploading papers/notes, and closing anyone's study room. Admin accounts are never created via
  public signup — see "Seed the first admin" below.

Signup is restricted to the email domains listed in `ALLOWED_EMAIL_DOMAINS`; `seed:admin` writes
those into the `allowed_email_domains` table, so **it must be run before anyone can register**.

## Prerequisites

- Node.js 22+, [pnpm](https://pnpm.io) 10+ (`corepack enable` or `npm i -g pnpm`)
- Docker + Docker Compose (for Postgres/MinIO locally)

## First-time setup

```bash
pnpm install
pnpm --filter @scholarbase/shared-types build
```

Start Postgres + MinIO:

```bash
cp infra/.env.example infra/.env   # edit values if you want
docker compose -f infra/docker-compose.yml --env-file infra/.env up -d
```

Configure the backend:

```bash
cp backend/.env.example backend/.env   # edit ALLOWED_EMAIL_DOMAINS, ADMIN_*, secrets
pnpm --filter @scholarbase/backend prisma:generate
pnpm --filter @scholarbase/backend prisma:deploy   # applies backend/prisma/migrations
pnpm --filter @scholarbase/backend seed:admin       # creates the one admin account
```

Configure the frontend:

```bash
cp frontend/.env.example frontend/.env
```

## Running locally

```bash
pnpm dev:backend    # NestJS API on http://localhost:3000 (routes under /api)
pnpm dev:frontend   # Vite dev server on http://localhost:5173
```

Log in as the seeded admin at `/login`, then go to `/admin` to add a year level, a subject, an
exam type, and upload a question paper or notes file. Everything else (browsing, downloads) is
visible immediately without logging in, except notes downloads which require any logged-in
account.

## Study rooms

Any logged-in user can open a room at `/study-rooms`. Rooms are **private by default**:

- A **private** room is never listed for anyone but its creator and the people who redeemed its
  invite. The creator shares a link (`/study-rooms/join/<code>`) via the *Copy invite link* button;
  the recipient either clicks it or pastes it into the *Join with an invite link* field in the lobby.
  Redeeming stores membership, so the link is only needed once.
- A **public** room is listed for every signed-in student, as before.

Knowing a private room's id is deliberately not enough to get in. The invite code is a separate
24-character secret, and membership is checked in three places — the lobby query, `GET
/study-rooms/:id` (404, so a guess can't confirm the room exists), and the socket `room:join`
handler, which is the gate that actually protects the call.

**Moderation.** The Admin page lists *every* open room, including private ones the admin isn't a
member of (`GET /study-rooms/admin/all`, admin-only), so any session can be ended. Closing a room
is a real action, not just a delisting: everyone in it is sent `room:closed`, removed from the
room, and can't rejoin.

From that panel an admin can also **Join** any room for oversight, including a private one they
were never invited to. This is deliberately **not** covert: the admin enters as a normal
participant, is flagged `isModerator`, and shows in everyone's participant list with a "Moderator"
badge — the owner is notified of the join like any other. There is no hidden-presence path, by
design: silently intercepting a private call is covert interception of a private communication,
so the feature makes admin oversight transparent instead. Admins still do **not** receive the
invite code for a private room (`inviteCode` stays null for them), so oversight can't be turned
into a way to silently re-enter later or reshare the room.

A room has two layers:

- **Chat** — a socket.io gateway on the `/study-rooms` namespace (`backend/src/modules/study-rooms`).
  Messages are persisted, and the last 50 are replayed when you join. Presence and typing
  indicators are in-memory only. A floating toast surfaces "X is typing…" even while the chat
  panel is closed (it starts closed by default), so a peer composing a message is never invisible.
  Messages carry WhatsApp-style ticks — sent, delivered (someone else was in the room when it was
  sent), and read (blue, once a read receipt arrives) — backed by one watermark row per
  `(room, user)` in `study_room_read_receipts` rather than a row per message per reader.
- **Audio & video** — press *Join audio & video*. Peers connect in a **mesh** of WebRTC
  connections; the server only relays SDP offers/answers and ICE candidates and never sees media.

Notes on the media layer:

- `getUserMedia` only works on `localhost` or over HTTPS. In production that means the frontend
  must be served over TLS.
- Mesh topology is fine for the handful of people a study room holds. A large room would need an
  SFU instead — every participant currently uploads one stream per peer.
- **A TURN server is required for anyone outside your own network.** STUN alone only works when
  the two browsers can reach each other directly, and two students on different home ISPs usually
  cannot: carrier-grade NAT is frequently *symmetric*, which makes the public address STUN
  discovers unusable by the far side. Every candidate pair then fails and the call sits silent.
- ICE servers are served at runtime by `GET /api/study-rooms/ice-servers`, not baked into the
  frontend bundle, because TURN credentials are minted with an expiry. Configure them on the
  **backend**:
  - `TURN_URLS` — comma-separated, list both `?transport=udp` and `?transport=tcp`.
  - `TURN_STATIC_AUTH_SECRET` — coturn shared secret (`--use-auth-secret`); the backend derives a
    per-session `<expiry>:<userId>` / HMAC-SHA1 credential pair from it.
  - or `TURN_USERNAME` + `TURN_PASSWORD` for a hosted provider that issues fixed credentials.
  `infra/docker-compose.prod.yml` ships a `coturn` service wired to these. With no TURN configured
  the app still runs and now says so explicitly in the call panel instead of failing silently.
- `VITE_ICE_SERVERS` still works as a local override when testing a relay by hand.
- Presence lives in a single process's memory, so running more than one backend replica needs the
  socket.io Redis adapter plus a shared presence store.

## Repo layout

```
frontend/            React + Vite + TS, Tailwind themed to match mmcoe.edu.in (maroon/Poppins/pill buttons)
backend/              NestJS API: auth, year-levels, subjects, exam-types, papers, notes, study-rooms
packages/shared-types/  DTOs + enums shared by frontend and backend (dual CJS/ESM build)
infra/                docker-compose.yml (local dev infra), docker-compose.prod.yml (Traefik + built images)
```

`rag-service/` (Python, phase 4) isn't built yet — see the architecture plan for how it slots in
without needing infra changes to the earlier phases.

## Production

Two ways to run this in production, depending on what infra you have:

**Single server (recommended if you have one).** `infra/docker-compose.prod.yml`
builds real images for backend/frontend behind Traefik (automatic HTTPS via Let's
Encrypt), plus Postgres, MinIO with persistent volumes, and a daily `pg_dump`
backup sidecar — everything in one place, no per-service env-var juggling. Copy
`infra/.env.example` values plus `ACME_EMAIL`/`API_DOMAIN`/`APP_DOMAIN`, then:

```bash
docker compose -f infra/docker-compose.prod.yml --env-file infra/.env up -d --build
docker compose -f infra/docker-compose.prod.yml exec backend sh -c "ADMIN_EMAIL=... ADMIN_PASSWORD=... pnpm seed:admin"
```

The backend container runs `prisma migrate deploy` automatically on every start
(see `backend/Dockerfile`), so the schema is always up to date before the app
starts serving — no separate migration step needed.

**Split across managed platforms** (e.g. free tiers: Vercel for the frontend,
a host that runs a persistent Node process — like Render's Web Service — for
the backend, since the study-rooms WebSocket gateway keeps presence in-process
and can't run on a stateless/serverless function). In that case:

- The backend still needs a real Postgres (with the `citext` extension) and,
  since a platform like Render's free Web Service has no persistent disk, real
  object storage rather than a self-hosted MinIO container — point the
  `MINIO_*` env vars at an S3-compatible provider like Cloudflare R2 instead
  (see the comment in `backend/.env.example`; `StorageService` is already
  generic S3, no code change needed).
- `GET /api/health` is a public, DB-free liveness endpoint — use it as the
  platform's health check target, and optionally as an external keep-alive
  ping if the platform sleeps its free tier after idle time.
- Point the frontend's `VITE_API_BASE_URL` at the backend's public URL, and
  add `frontend/vercel.json`'s SPA rewrite if deploying to Vercel (already in
  the repo) so client-side routes don't 404 on refresh.
