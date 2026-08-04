# ScholarBase

Previous-year question papers, notes, live study rooms, and an AI Q&A assistant for an
autonomous university. Fully open-source stack: PostgreSQL + pgvector, MinIO, Redis (from
phase 3 onward), NestJS (TypeScript), React, and a Python/FastAPI RAG service (phase 4).

See [`docs/adr` and the architecture plan] for the full design. This repo currently implements
**phase 1 (question papers) and phase 2 (notes)**, with the auth/access model already in place
for later phases.

## Access model

- **Public**: browse and download question papers, no account needed.
- **Logged in (student)**: also download notes, and (from phase 3/4) join live study rooms and
  ask the AI assistant.
- **Admin**: manages year levels, subjects, exam types, and uploads papers/notes. Admin accounts
  are never created via public signup — see "Seed the first admin" below.

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

## Repo layout

```
frontend/            React + Vite + TS, Tailwind themed to match mmcoe.edu.in (maroon/Poppins/pill buttons)
backend/              NestJS API: auth, year-levels, subjects, exam-types, papers, notes
packages/shared-types/  DTOs + enums shared by frontend and backend (dual CJS/ESM build)
infra/                docker-compose.yml (local dev infra), docker-compose.prod.yml (Traefik + built images)
```

`rag-service/` (Python, phase 4) and the live-study-room WebSocket layer (phase 3) aren't built
yet — see the architecture plan for how they slot in without needing infra changes to phases 1–2.

## Production

`infra/docker-compose.prod.yml` builds real images for backend/frontend behind Traefik
(automatic HTTPS via Let's Encrypt) and runs a daily `pg_dump` backup sidecar. Copy
`infra/.env.example` values plus `ACME_EMAIL`/`API_DOMAIN`/`APP_DOMAIN`, then:

```bash
docker compose -f infra/docker-compose.prod.yml --env-file infra/.env up -d --build
docker compose -f infra/docker-compose.prod.yml exec backend sh -c "ADMIN_EMAIL=... ADMIN_PASSWORD=... pnpm seed:admin"
```
