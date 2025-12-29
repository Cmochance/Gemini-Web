# Gemini Web Backend - Dockerfile

FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
COPY prisma ./prisma/
# 使用 npm install 而非 npm ci（兼容无 package-lock.json 的情况）
RUN npm install --legacy-peer-deps
RUN npx prisma generate
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 expressjs
RUN apk add --no-cache tini

COPY --from=builder --chown=expressjs:nodejs /app/dist ./dist
COPY --from=builder --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=expressjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=expressjs:nodejs /app/package.json ./

ENV NODE_ENV=production
ENV PORT=31001
EXPOSE 31001
USER expressjs

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:31001/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/app.js"]

