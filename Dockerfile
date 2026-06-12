# syntax=docker/dockerfile:1

# ============================================
# Stage 1: Build frontend and backend
# ============================================
FROM node:20-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Vite bakes VITE_* variables into the frontend bundle at build time
ARG VITE_DISCORD_USER_ID
ARG VITE_ADMIN_DISCORD_ID
ARG VITE_GITHUB_USERNAME
ARG VITE_GITHUB_FEATURED_REPO
ARG VITE_SOCIAL_DISCORD
ARG VITE_SOCIAL_TELEGRAM
ARG VITE_SOCIAL_TWITTER
ARG VITE_SOCIAL_INSTAGRAM
ARG VITE_SOCIAL_YOUTUBE
ARG VITE_SOCIAL_TIKTOK
ARG VITE_SOCIAL_FACEBOOK
ENV VITE_DISCORD_USER_ID=$VITE_DISCORD_USER_ID \
    VITE_ADMIN_DISCORD_ID=$VITE_ADMIN_DISCORD_ID \
    VITE_GITHUB_USERNAME=$VITE_GITHUB_USERNAME \
    VITE_GITHUB_FEATURED_REPO=$VITE_GITHUB_FEATURED_REPO \
    VITE_SOCIAL_DISCORD=$VITE_SOCIAL_DISCORD \
    VITE_SOCIAL_TELEGRAM=$VITE_SOCIAL_TELEGRAM \
    VITE_SOCIAL_TWITTER=$VITE_SOCIAL_TWITTER \
    VITE_SOCIAL_INSTAGRAM=$VITE_SOCIAL_INSTAGRAM \
    VITE_SOCIAL_YOUTUBE=$VITE_SOCIAL_YOUTUBE \
    VITE_SOCIAL_TIKTOK=$VITE_SOCIAL_TIKTOK \
    VITE_SOCIAL_FACEBOOK=$VITE_SOCIAL_FACEBOOK

COPY . .
# Frontend: tsc type check + vite build -> dist/
# Backend: compile server/*.ts -> server/*.js (ESM)
RUN npm run build && npm run build:backend

# ============================================
# Stage 2: Production runtime
# ============================================
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/public ./public

# Run as non-root
RUN groupadd -g 1001 nodejs \
    && useradd -r -u 1001 -g nodejs nodejs \
    && chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 1500 1600

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.BACKEND_PORT || 1600) + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

CMD ["node", "server/index.js"]
