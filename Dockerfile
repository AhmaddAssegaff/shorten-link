# --- STAGE 1: BASE ---
FROM node:22-slim AS base
RUN apt-get update && apt-get install -y openssl ca-certificates libgnutls30 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN corepack enable
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# --- STAGE 2: BUILDER ---
FROM base AS builder
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm config set ignore-scripts false
RUN pnpm config set side-effects-cache false

RUN pnpm install --frozen-lockfile --prefer-offline
RUN pnpm exec prisma generate

COPY . .
RUN pnpm run build

# buang devDependencies
RUN pnpm prune --prod

# --- STAGE 3: RUNNER ---
FROM node:22-slim AS runner
RUN apt-get update && apt-get install -y openssl ca-certificates libgnutls30 && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
WORKDIR /app

RUN groupadd -g 1001 app && useradd -u 1001 -g app -s /bin/sh app

COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/package.json ./package.json
COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/prisma ./prisma

USER app
EXPOSE 3000
CMD ["node", "dist/main.js"]
