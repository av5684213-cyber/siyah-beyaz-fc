# ═══════════════════════════════════════════════════════════
# Siyah Beyaz FC — Standalone Docker Dağıtımı
# ═══════════════════════════════════════════════════════════
#
# Kullanım:
#   docker build -t siyah-beyaz-fc .
#   docker run -p 3000:3000 --env-file .env siyah-beyaz-fc
#
# Vercel deploy için bu dosya gerekli DEĞİLDİR.
# Sadece self-hosted / Docker dağıtımı içindir.
# ═══════════════════════════════════════════════════════════

FROM node:20-alpine AS base

# --- Bağımlılıkları yükle ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# --- Build aşaması (standalone output aktif) ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# next.config.ts'de DOCKER_STANDALONE=1 ile output: standalone aktif edilir
ENV DOCKER_STANDALONE=1

RUN npm run build

# --- Production image ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
