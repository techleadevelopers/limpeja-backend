# Stage 1: Builder (instala deps, gera Prisma, compila TS)
FROM node:22-slim AS builder

# Instala dependências do sistema para Prisma e build (openssl, ca-certificates para SSL/PostGIS)
RUN apt-get update -y && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copia package files primeiro (para cache de layers otimizado)
COPY package*.json ./

# Instala todas as deps (incluindo dev para build) - usa ci para determinístico
RUN npm ci --quiet

# Copia o código fonte (inclui prisma/)
COPY . .

# Gera o Prisma Client (atualiza tipos e binaries)
RUN npx prisma generate

# Roda o build (compila src/ para dist/)
RUN npm run build

# DEBUG: Verifica se dist/main.js foi gerado (logs no Railway mostrarão)
RUN ls -la dist/ || echo "ERRO: Pasta dist/ vazia ou não gerada!" && ls -la dist/main.js || echo "ERRO: main.js não encontrado em dist/"

# Stage 2: Production (imagem leve, só runtime)
FROM node:22-slim AS production

# Instala dependências do sistema (openssl e ca-certificates para Prisma/PostGIS, dumb-init para signals)
RUN apt-get update -y && \
    apt-get install -y \
        openssl \
        ca-certificates \
        dumb-init && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copia package.json e instala SÓ deps de produção (prune devDeps)
COPY package*.json ./
RUN npm ci --only=production --quiet && npm cache clean --force

# Copia o Prisma schema e gera client no runtime (garante compatibilidade com env/prod)
COPY --from=builder /usr/src/app/prisma ./prisma
RUN npx prisma generate

# Copia a app compilada (dist/) e o Prisma client gerado
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma/client ./node_modules/.prisma/client

# DEBUG: Verifica dist/ na production (logs mostrarão se cópia falhou)
RUN ls -la dist/ || echo "ERRO: Pasta dist/ vazia na production!" && ls -la dist/main.js || echo "ERRO: main.js não encontrado na production!"

# NÃO setar DATABASE_URL aqui - passe via Railway env vars
ENV PORT=8080
EXPOSE 8080

# Healthcheck (verifica /health do app)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start: Usa dumb-init; fallback para node se falhar
CMD ["dumb-init", "node", "dist/main.js"]