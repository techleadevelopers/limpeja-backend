<img src="https://drive.google.com/uc?id=1PkFFe5bAEVf-x-nPD3BMO21gptKfFosu" alt="LimpeJá-App Logo" width="80" margin-top="3">
 LimpeJá — Backend (NestJS + Prisma + Redis + PostgreSQL)

Arquitetura do Sistema
<img src="https://drive.google.com/uc?id=1dFSaBKW6AIs1_DLeOAsUfv5Zl5BkPdI_" alt="archtect Logo" border-radius="20" >

🚀 Visão Geral
O LimpeJá é o backend de um marketplace completo de serviços de limpeza, conectando clientes a prestadores verificados.
O sistema inclui agendamentos, pagamentos PIX, disputas, chat em tempo real, verificação de identidade, missões, fidelidade, ranking, segurança e processamento assíncrono via filas.

Desenvolvido com foco em alta confiabilidade, modularidade, segurança e escalabilidade.

🧩 Arquitetura

Stack Principal:

NestJS (arquitetura modular, DI, Guards, Pipes)
Prisma ORM + PostgreSQL
Redis + Bull Queues
Google Cloud Storage + Vision API (OCR, face-match)
JWT/Auth (API + WebSocket)
Swagger/OpenAPI
Sentry (monitoramento e tracing)

Camadas principais:
API REST + WebSocket
Domínio modular (30+ módulos)
Jobs assíncronos (notificações, verificações, assinaturas)
Serviços externos (pagamentos, geocoding, SMS, e-mail, OCR)

📌 O diagrama completo de arquitetura está disponível em /docs/architecture.png.

🏗️ Principais Módulos do Backend

O backend segue uma abordagem modular. Principais domínios:

Core
Auth
Users
Clients
Providers
Services (catálogo)
Provider Services
Availability
Bookings
Payments (PIX, saques)
Pricing
Offers & Coupons
Earnings
Withdrawals
Search
Ranking
Reviesw
Notifications
Chat (WebSocket)
Verification (OCR/selfie)
Safety (incidentes/pânico)
Referrals
Loyalty
Missions
Disputes
Guarantee
Subscriptions

Documentação completa de cada módulo:
➡️ /docs/modules/*.md

🔄 Fluxos Críticos

Agendamento + Pagamento PIX
Cliente seleciona provedor
Pricing → regras dinâmicas + cupons

Booking criado
Pagamento PIX → callback do provedor
Booking confirmado
Conclusão → Review → Loyalty → Missions

Verificação de prestadores
Upload de documento → GCS
OCR + Face Match → Vision API
Status: PENDING → UNDER_REVIEW → VERIFIED

Chat seguro

Só abre após booking confirmado
WebSocket com JWT
Bloqueia quando booking conclui/cancela

Disputas
Cliente/Provedor abre
Admin resolve → possibilidade de refund

Eventos notificados via fila
⚙️ Infraestrutura

PostgreSQL com índices otimizados (geolocalização, disponibilidade, ranking)

Redis como broker de filas
Sentry em toda request + workers
Cache com TTL estratégico
Rate limiting (ThrottlerModule)



Swagger:
/api/docs

📂 Estrutura
src/
  app/
  auth/
  users/
  providers/
  bookings/
  payments/
  pricing/
  ...
  queues/
  common/
  shared/
  prisma/
docs/
  architecture.png
  modules/
     bookings.md
     payments.md
     verification.md
     ...

🛡️ Segurança

JWT (API + WebSocket)
Guards por papel (CLIENT, PROVIDER, ADMIN)
Sanitização de PII
Logs mascarados
Auditoria de transações financeiras
Antifraude no fluxo PIX

📈 Escalabilidade

Separação API e Workers
Filas para trabalhos pesados
Redis para throttling + cache
Prisma pooling

Módulos independentes (DDD-lite)
Resiliência com idempotência em webhooks e jobs

🧠 Observabilidade

Tracing (Sentry)
Logs estruturados
Health-check para orquestradores
Métricas das filas (Bull-board pronta para conectar)

📜 Licença

MIT

🔍 Documentação Completa

Toda a documentação detalhada (60+ páginas) foi movida para:
➡️ /docs
