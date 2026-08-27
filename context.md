# ScholarBase Project Context

## Project Overview
ScholarBase is a platform for an autonomous university that provides previous-year question papers, notes, live study rooms, and an AI Q&A assistant. The platform is fully open-source and implements a phased architecture. Currently, it supports:
- Phase 1: Question papers
- Phase 2: Notes
- Phase 3: Live study rooms (chat + audio/video)
- Phase 4 (Upcoming): AI Q&A assistant (Python/FastAPI RAG service)

## Tech Stack
- **Database/Storage**: PostgreSQL + pgvector, MinIO (Object Storage), Redis
- **Backend**: NestJS (TypeScript), Prisma ORM
- **Frontend**: React, Vite, TypeScript, Tailwind CSS (themed for mmcoe.edu.in)
- **Monorepo Tooling**: pnpm workspaces
- **Infrastructure**: Docker & Docker Compose (Traefik for prod routing)

## Core Features & Access Model
1. **Public/Anonymous**: Can browse and download question papers.
2. **Student (Logged In)**: Can download notes, open/join live study rooms (chat + A/V).
3. **Admin**: Manages year levels, subjects, exam types, uploads papers/notes, and moderates study rooms (including closing them or joining them transparently).

### Live Study Rooms
- WebRTC mesh network for Audio/Video (server only relays SDP/ICE).
- Socket.io for text chat and presence.
- Rooms can be public or private (accessed via an invite link with a 24-character secret code).
- Admins have full oversight capabilities for moderation.

## Repository Layout
- `frontend/`: React + Vite + TS app
- `backend/`: NestJS API serving auth, papers, notes, study-rooms
- `packages/shared-types/`: DTOs and enums shared across the stack
- `infra/`: Docker compose configurations for local and production deployments

## Deployment
Can be deployed via a single server (using the provided docker-compose with Traefik) or split across managed platforms like Vercel (frontend) and a persistent Node service (backend) with managed Postgres and S3.
