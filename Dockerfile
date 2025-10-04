FROM node:22-slim

RUN apt-get update -y && apt-get install -y \
    openssl ca-certificates dumb-init curl python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --quiet

COPY . .
RUN npx prisma generate
RUN npm run build --verbose

RUN echo "=== DEBUG: dist ===" && ls -la dist/ dist/src || true && \
    test -f dist/src/main.js

# agora @nestjs/swagger E @prisma/client devem existir em produção
RUN npm prune --production --silent && \
    node -e "require('@prisma/client'); require('@nestjs/swagger'); console.log('Runtime deps OK')"

ENV NODE_ENV=production PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["dumb-init","node","dist/src/main.js"]