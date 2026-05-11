# ─── Build Stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
# We don't need .env here because it's usually injected at runtime for server actions
# but for Next.js build-time envs, they need to be present.
# For simplicity in this dev/test setup, we assume public vars are okay or provided.
RUN npm run build

# ─── Runner Stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only the necessary files for production
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
