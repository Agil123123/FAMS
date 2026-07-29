# ==========================================================
# FAMS Backend - Multi-stage Dockerfile (Monorepo)
# ==========================================================

# ── Stage 1: Install dependencies ─────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Native module compilation (argon2 needs python3 + make + g++)
RUN apk add --no-cache python3 make g++

# Copy root workspace config + lockfile
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Single install — works for both build and runtime
RUN npm ci

# ── Stage 2: Build ────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY backend/ .

RUN npx prisma generate && \
    npm run build

# ── Stage 3: Production ──────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Prisma engine needs libssl 1.1 (Alpine ships 3.x by default)
RUN apk add --no-cache openssl1.1-compat

RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

# Generate Prisma client (needed for runtime enum validation)
RUN npx prisma generate

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && chown nestjs:nestjs /app/logs

USER nestjs

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
