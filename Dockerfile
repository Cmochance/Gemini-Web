# ==========================================
# Gemini Web Frontend - Production Dockerfile
# ==========================================

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies for building native modules
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ARG BACKEND_ENDPOINT
ENV BACKEND_ENDPOINT=${BACKEND_ENDPOINT}

RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=30000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set proper ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 30000

ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:30000 || exit 1

CMD ["node", "server.js"]
