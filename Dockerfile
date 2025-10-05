FROM node:22-slim

# deps nativas mínimas
RUN apt-get update -y && apt-get install -y \
    openssl ca-certificates dumb-init curl python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# 1) instalar deps (inclui dev, pois NODE_ENV ainda não é production)
COPY package*.json ./
RUN npm ci --quiet

# 2) copiar código e gerar prisma client
COPY . .
RUN npx prisma generate

# 3) build
RUN npm run build --verbose

# 4) debug + verificação: aceita dist/src/main.js ou dist/main.js
RUN echo "=== DEBUG: dist ===" && ls -la dist || true && \
    echo "=== DEBUG: possíveis entradas ===" && \
    (test -f dist/src/main.js || test -f dist/main.js)

# 5) produção: remover dev deps, mas manter @prisma/client
# (assegure que @prisma/client está em "dependencies" no package.json)
RUN npm prune --production --silent && \
    node -e "require('@prisma/client'); console.log('Prisma client OK')"

ENV NODE_ENV=production PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# 6) CMD mantém dist/src/main.js, com fallback para dist/main.js
CMD ["dumb-init","sh","-c","node dist/src/main.js || node dist/main.js"]
