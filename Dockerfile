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
RUN pnpm install --frozen-lockfile
# Generate dulu agar folder src/generated tercipta
RUN pnpm exec prisma generate 

COPY . .
RUN pnpm run build

# --- STAGE 3: RUNNER ---
FROM base AS runner
ENV NODE_ENV=production
RUN groupadd -g 1001 app && useradd -u 1001 -g app -s /bin/sh app
WORKDIR /app

# 1. Install dependencies produksi
COPY --chown=app:app package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --prefer-offline

# 2. Copy hasil build NestJS
COPY --from=builder --chown=app:app /app/dist ./dist

# 3. FIX: Copy folder generated ke dalam folder dist (sesuai ekspektasi error log kamu)
COPY --from=builder --chown=app:app /app/src/generated ./dist/generated

# 4. FIX: Copy binary engine Prisma agar bisa konek ke DB
COPY --from=builder --chown=app:app /app/node_modules/.prisma ./node_modules/.prisma

USER app
EXPOSE 3000
CMD ["node", "dist/main.js"]
