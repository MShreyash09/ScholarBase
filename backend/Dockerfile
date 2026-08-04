# Production image. Build from the monorepo root:
#   docker build -f backend/Dockerfile -t scholarbase-backend .
# (docker-compose.prod.yml sets context: .. accordingly.)

FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /workspace

COPY package.json pnpm-workspace.yaml ./
COPY packages/shared-types ./packages/shared-types
COPY backend ./backend

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @scholarbase/shared-types build
RUN pnpm --filter @scholarbase/backend prisma:generate
RUN pnpm --filter @scholarbase/backend build

FROM node:22-alpine AS runtime
RUN corepack enable
WORKDIR /workspace

COPY package.json pnpm-workspace.yaml ./
COPY --from=build /workspace/packages/shared-types ./packages/shared-types
COPY --from=build /workspace/backend/package.json ./backend/package.json
COPY --from=build /workspace/backend/prisma ./backend/prisma

RUN pnpm install --prod --frozen-lockfile

COPY --from=build /workspace/backend/dist ./backend/dist
COPY --from=build /workspace/backend/node_modules/.prisma ./backend/node_modules/.prisma

WORKDIR /workspace/backend
EXPOSE 3000
CMD ["node", "dist/main.js"]
