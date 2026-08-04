# Production image. Build from the monorepo root:
#   docker build -f frontend/Dockerfile -t scholarbase-frontend .
# (docker-compose.prod.yml sets context: .. accordingly.)

FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /workspace

COPY package.json pnpm-workspace.yaml ./
COPY packages/shared-types ./packages/shared-types
COPY frontend ./frontend

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @scholarbase/shared-types build
RUN pnpm --filter @scholarbase/frontend build

FROM nginx:alpine AS runtime
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/frontend/dist /usr/share/nginx/html

EXPOSE 80
