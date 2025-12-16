# ---- STAGE 1: BUILD ----
FROM node:22-slim AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# ---- STAGE 2: PRODUCTION ----
FROM node:22-slim

WORKDIR /usr/src/app

# Dependências do sistema
RUN apt-get update -y && apt-get install -y openssl dumb-init && rm -rf /var/lib/apt/lists/*

# Copiar build e dependências
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

# Comando correto para iniciar a aplicação
CMD ["dumb-init","node","dist/src/main.js"]
