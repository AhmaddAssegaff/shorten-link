# --- STAGE 1: BASE ---
FROM node:22-slim AS base
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    libgnutls30 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN corepack enable
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# --- STAGE 2: BUILDER ---
FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma/

ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x

RUN pnpm install --frozen-lockfile
RUN pnpm exec prisma generate

COPY . .
RUN pnpm run build

# --- STAGE 3: RUNNER ---
FROM base AS runner
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --prefer-offline

COPY --from=builder /app/dist ./dist

RUN groupadd -g 1001 app && useradd -u 1001 -g app -s /bin/sh app
RUN chown -R app:app /app

USER app

EXPOSE 3000
CMD ["node", "dist/main.js"]
