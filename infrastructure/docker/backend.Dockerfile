# ==========================================================
# FAMS Backend - Multi-stage Dockerfile
# ==========================================================

# ── Stage 1: Install dependencies ─────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --only=production && \
    cp -R node_modules /prod_modules && \
    npm ci

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

RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs

COPY --from=deps /prod_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]
