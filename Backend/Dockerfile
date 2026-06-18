# ═══════════════════════════════════════════════════════════════════
# SmartWallet Backend — Dockerfile  (Node 20 Alpine)
#
# Stages:
#   deps        → instala dependencias (base compartida)
#   development → dev server con ts-node/nodemon (usado por docker-compose)
#   builder     → compila TypeScript a JS
#   production  → imagen mínima lista para EC2 / contenedor en producción
# ═══════════════════════════════════════════════════════════════════

# ── Stage 1: instalar dependencias ──────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copiar manifiestos primero → mejor cache de capas
COPY package*.json ./

# ci = instalación determinista según package-lock.json
RUN npm ci


# ── Stage 2: desarrollo (docker-compose dev) ────────────────────────
FROM node:20-alpine AS development

WORKDIR /app

# devDependencies incluidas: ts-node, nodemon, types…
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json  ./
COPY tsconfig.json  ./
COPY nodemon.json   ./

# src/ e index.ts se montan como volúmenes desde el host → hot-reload

EXPOSE 3000

CMD ["npm", "run", "dev"]


# ── Stage 3: compilar TypeScript ────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


# ── Stage 4: imagen de producción (mínima, sin devDeps) ─────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

# Solo dependencias de producción
RUN npm ci --omit=dev && npm cache clean --force

# Copiar código compilado
COPY --from=builder /app/dist ./dist

# Usuario sin privilegios (principio de mínimo privilegio)
RUN addgroup -g 1001 -S nodejs \
 && adduser  -S nodejs -u 1001 -G nodejs

USER nodejs

EXPOSE 3000

# Health check que usa el endpoint /api/v1/health ya implementado
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health || exit 1

CMD ["node", "dist/index.js"]
