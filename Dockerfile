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
RUN pnpm config set side-effects-cache false
RUN pnpm install --frozen-lockfile
RUN pnpm exec prisma generate

COPY . .
RUN pnpm run build

# --- STAGE 3: RUNNER ---
FROM base AS runner
ENV NODE_ENV=production
RUN groupadd -g 1001 app && useradd -u 1001 -g app -s /bin/sh app
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER app
EXPOSE 3000
CMD ["node", "dist/main.js"]
