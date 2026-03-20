FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl ca-certificates
WORKDIR /app
RUN corepack enable
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# --- STAGE 2: DEPS & BUILD ---
FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma/

ENV PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x

RUN --mount=type=cache,id=pnpm,target=/usr/local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

RUN pnpm exec prisma generate
RUN pnpm run build

RUN pnpm prune --prod

# --- STAGE 3: RUNNER ---
FROM base AS runner
RUN apk add --no-cache openssl
ENV NODE_ENV=production

WORKDIR /app
RUN addgroup --system --gid 1001 app && adduser --system --uid 1001 app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

RUN chown -R app:app /app
USER app

EXPOSE 3000
CMD ["node", "dist/main.js"]
