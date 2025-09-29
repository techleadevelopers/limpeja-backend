# Single-stage para simplicidade (testar primeiro; volte para multi se OK)
FROM node:22-slim

# Instala dependências do sistema (mais libs para build TS/Prisma)
RUN apt-get update -y && apt-get install -y \
    openssl \
    ca-certificates \
    dumb-init \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copia package files
COPY package*.json ./

# Instala deps (inclui dev para build)
RUN npm ci --quiet

# Copia código
COPY . .

# Gera Prisma
RUN npx prisma generate

# Build com verbose para logs detalhados
RUN npm run build --verbose || (echo "ERRO CRÍTICO: Build falhou!" && exit 1)

# DEBUG: Verifica dist/ detalhadamente
RUN echo "=== DEBUG BUILDER: Conteúdo de dist/ ===" && \
    ls -la dist/ && \
    if [ -f dist/main.js ]; then \
      echo "main.js existe! Primeiras linhas:" && head -n 5 dist/main.js; \
    else \
      echo "ERRO: main.js NÃO ENCONTRADO!"; \
      exit 1; \
    fi

# Gera Prisma no runtime (para prod)
RUN npx prisma generate

# Porta
ENV PORT=8080
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start
CMD ["dumb-init", "node", "dist/main.js"]