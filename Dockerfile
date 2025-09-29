# ---- builder ----
FROM node:20-slim AS builder
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app

# instalar deps só do backend
COPY backend-cleaning/package*.json ./
RUN npm ci --quiet

# copiar código do backend e prisma
COPY backend-cleaning/ ./

# prisma + build
RUN npx prisma generate
RUN npm run build

# ---- runtime ----
FROM node:20-slim AS runtime
RUN apt-get update -y && apt-get install -y openssl ca-certificates dumb-init curl && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app

COPY backend-cleaning/package*.json ./
RUN npm ci --only=production --quiet && npm cache clean --force

COPY --from=builder /usr/src/app/prisma ./prisma
RUN npx prisma generate

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma/client ./node_modules/.prisma/client

ENV PORT=8080 NODE_ENV=production
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD curl -f http://localhost:8080/health || exit 1

CMD ["dumb-init","node","dist/main.js"]
