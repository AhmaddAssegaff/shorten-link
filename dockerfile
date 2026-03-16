FROM node:22-alpine AS deps

RUN apk add --no-cache libc6-compat

RUN corepack enable
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app

USER app
WORKDIR /app

COPY --chown=app:app package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder

RUN corepack enable
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
USER app
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=app:app . .

RUN pnpm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 app \
    && adduser --system --uid 1001 app

USER app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
