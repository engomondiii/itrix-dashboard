# Railway builds from this Dockerfile (it takes precedence over Nixpacks),
# which makes the deploy the same build we run locally: corepack-pinned pnpm,
# frozen lockfile, sharp's native build allowed by pnpm-workspace.yaml.

FROM node:22-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# The preinstall guard (scripts/only-pnpm.mjs) runs during install.
COPY scripts ./scripts
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS run
ENV NODE_ENV=production
COPY --from=build /app ./
# Railway injects PORT; the start script binds ${PORT:-3001}.
EXPOSE 3001
CMD ["pnpm", "start"]
