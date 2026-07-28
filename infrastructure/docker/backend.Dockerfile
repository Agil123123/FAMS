# ==========================================================
# FAMS Backend - Multi-stage Dockerfile (Monorepo)
# ==========================================================

# ── Stage 1: Install dependencies ─────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Copy root workspace config + lockfile
COPY package.json package-lock.json ./
# Copy both workspace package.json files (npm ci needs all workspace packages in lockfile)
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install all deps first (for build), then prod-only (for runner)
RUN npm ci && \
    cp -r node_modules /prod_modules_all && \
    npm ci --omit=dev && \
    cp -r node_modules /prod_modules

# ── Stage 2: Build ────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /prod_modules_all ./node_modules
COPY backend/ .

RUN npx prisma generate && \
    npm run build

# ── Stage 3: Production ──────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs

COPY --from=deps /prod_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

# Copy only the prisma generated client (needed at runtime)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]
