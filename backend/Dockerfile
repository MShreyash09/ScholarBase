# Production image. Build from the monorepo root:
#   docker build -f backend/Dockerfile -t scholarbase-backend .
# (docker-compose.prod.yml sets context: .. accordingly.)

FROM node:22-alpine AS build
RUN apk add --no-cache openssl
RUN corepack enable
WORKDIR /workspace

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared-types ./packages/shared-types
COPY backend ./backend

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @scholarbase/shared-types build
RUN pnpm --filter @scholarbase/backend prisma:generate
RUN pnpm --filter @scholarbase/backend build

FROM node:22-alpine AS runtime
RUN apk add --no-cache openssl
RUN corepack enable
WORKDIR /workspace

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY --from=build /workspace/packages/shared-types ./packages/shared-types
COPY --from=build /workspace/backend/package.json ./backend/package.json
COPY --from=build /workspace/backend/prisma ./backend/prisma

# Not --prod: the Prisma CLI and ts-node (both devDependencies) have to survive
# into this image. The start command below runs `prisma migrate deploy` on
# every boot, and `pnpm seed:admin` (run manually post-deploy, see README) needs
# ts-node to execute prisma/seed-admin.ts. A stripped prod-only install left
# both broken — migrations silently never ran against a fresh database.
RUN pnpm install --frozen-lockfile

# Regenerated rather than copied from the build stage: under pnpm's workspace
# layout the generated client lives inside the pnpm virtual store at a
# version-qualified path (node_modules/.pnpm/@prisma+client@<v>_prisma@<v>/...),
# not at the plain `backend/node_modules/.prisma` path a naive COPY --from
# would expect — that copy silently doesn't exist. Regenerating here is a few
# seconds and works regardless of the store layout.
RUN pnpm --filter @scholarbase/backend prisma:generate

COPY --from=build /workspace/backend/dist ./backend/dist

WORKDIR /workspace/backend
EXPOSE 3000
# migrate deploy is idempotent (tracks applied migrations in _prisma_migrations),
# so running it on every container start — including plain restarts, not just
# fresh deploys — is safe and is what makes schema changes actually reach a
# hosted database without a manual step.
CMD ["sh", "-c", "pnpm run prisma:deploy && node dist/main.js"]
