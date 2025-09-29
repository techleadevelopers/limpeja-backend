# Single-stage (simples p/ validar; depois, se quiser, volte para multi-stage)
# Se der zica com Prisma no Node 22, troque para: FROM node:20-slim
FROM node:22-slim

# deps de sistema para build (bcrypt, prisma, etc.) + healthcheck
RUN apt-get update -y && apt-get install -y \
    openssl ca-certificates dumb-init curl python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# 1) instalar deps
COPY package*.json ./
RUN npm ci --quiet

# 2) copiar código + prisma e gerar client
COPY . .
RUN npx prisma generate

# 3) build (gera dist/src/main.js)
RUN npm run build --verbose || (echo "ERRO CRÍTICO: Build falhou!" && exit 1)

# 4) DEBUG: confirmar que o entrypoint existe em dist/src/main.js
RUN echo "=== DEBUG: conteúdo de dist/ ===" && ls -la dist/ dist/src || true && \
    if [ -f dist/src/main.js ]; then \
      echo "OK: dist/src/main.js encontrado"; \
    else \
      echo "ERRO: dist/src/main.js NÃO encontrado!"; \
      exit 1; \
    fi

# 5) otimizar imagem (remover devDeps) — mantém @prisma/client (DEVE estar em "dependencies")
RUN npm prune --production --silent && node -e "require('@prisma/client'); console.log('Prisma client OK')"

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start correto para seu layout atual
CMD ["dumb-init", "node", "dist/src/main.js"]
