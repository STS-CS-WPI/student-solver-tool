##### BASE
FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

##### DEPS
FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml .npmrc ./
# The postinstall script generates the Prisma client, but does not need migrations.
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN pnpm install --frozen-lockfile

##### BUILDER
FROM deps AS builder
COPY next.config.js postcss.config.js tsconfig.json ./
COPY public ./public
COPY src ./src
ENV NEXT_TELEMETRY_DISABLED=1
RUN SKIP_ENV_VALIDATION=1 pnpm run build

##### RUNNER
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
EXPOSE 3000

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

CMD ["node", "server.js"]

##### MIGRATOR (has prisma cli)
FROM base AS migrator
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-workspace.yaml .npmrc ./
COPY prisma/schema.prisma ./prisma/schema.prisma
COPY prisma/migrations ./prisma/migrations
CMD ["pnpm", "prisma", "migrate", "deploy"]
