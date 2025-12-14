<div style="background-color: #f8f9fa; padding: 30px; border-radius: 12px; border: 1px solid #dee2e6;">

<div style="text-align: center; margin-bottom: 40px;">
    <img src="https://drive.google.com/uc?id=1PkFFe5bAEVf-x-nPD3BMO21gptKfFosu" alt="LimpeJá-App Logo" width="100" style="margin-top: 3px; border-radius: 15px;">
 NestJS · Prisma · PostgreSQL · Redis · PIX · WebSockets

Backend de nível enterprise para marketplace de serviços de limpeza, projetado para escala, segurança financeira, observabilidade e evolução contínua.
        Backend de nível enterprise para marketplace de serviços, projetado para escala, segurança financeira observabilidade e evolução contínua.
  🚀 Visão Geral

O LimpeJá Backend é o núcleo transacional e operacional da plataforma LimpeJá. Ele conecta clientes, prestadores verificados e administradores, orquestrando:

Agendamentos complexos

Pagamentos PIX com retenção e liberação (ledger contábil)

Saques e conciliação financeira

Chat seguro em tempo real

Disputas, reembolsos e garantias

Verificação de identidade (OCR + selfie)

Programas de fidelidade, missões e ranking

Tudo foi construído com foco em consistência financeira, idempotência, auditoria e resiliência.

🧩 Arquitetura do Sistema
Stack Principal

NestJS — Arquitetura modular, DI, Guards, Pipes

Prisma ORM — Tipagem forte + migrações seguras

PostgreSQL — Dados transacionais e financeiros

Redis — Cache, filas e rate-limit

Bull Queues — Processamento assíncrono

WebSockets — Chat e eventos em tempo real

JWT Auth — API e WS

Swagger / OpenAPI — Documentação viva

Sentry — Tracing, erros e performance

📌 Diagrama completo:
        <img src="https://drive.google.com/uc?id=1dFSaBKW6AIs1_DLeOAsUfv5Zl5BkPdI_" alt="Diagrama de Arquitetura do Backend LimpeJá" style="width: 100%; max-width: 800px; border-radius: 8px;">
    </div>
    🏗️ Organização por Domínio

O backend segue uma abordagem DDD-lite, com módulos independentes e responsabilidades claras.

Núcleo

Auth

Users

Clients

Providers

Roles & Permissions

Operacional

Services (catálogo)

Provider Services

Availability

Bookings

Pricing

Offers & Coupons

Financeiro (Alta criticidade)

Payments (PIX)

Earnings (Ledger)

Withdrawals

Refunds

Guarantees

Experiência & Engajamento

Chat (WebSocket)

Notifications

Reviews

Ranking

Loyalty

Missions

Referrals

Segurança & Compliance

Verification (OCR + Selfie)

Safety (incidentes / pânico)

Disputes

Subscriptions

📚 Documentação detalhada por módulo: ➡️ /docs/modules/*.md

🔄 Fluxos Críticos
1️⃣ Agendamento + Pagamento PIX

Cliente escolhe provedor

Pricing aplica regras dinâmicas e cupons

Booking criado

PIX gerado (Orders / QR Code)

Webhook confirma pagamento

Booking → CONFIRMED

Ledger:

HOLD (valor bruto)

FEE (comissão)

2️⃣ Conclusão do Serviço

Prestador conclui serviço

Booking → FINISHED

Ledger:

EARNING (valor líquido)

HOLD negativo (liberação)

Valor disponível para saque

💡 Modelo garante:

Auditoria completa

Nenhum dinheiro “invisível”

Reconciliação simples

3️⃣ Saques (Withdrawals)

Solicitação com idempotency-key

Aprovação manual (admin)

Webhook confirma payout

Ledger WITHDRAWAL (valor negativo)

4️⃣ Disputas e Reembolsos

Cliente ou prestador abre disputa

Booking → PENDING_DISPUTE

Admin resolve:

Liberação

Reembolso parcial ou total

Tudo registrado no ledger.

⚙️ Infraestrutura

PostgreSQL com índices otimizados (geolocalização, disponibilidade, ranking)

Redis como:

Broker de filas

Cache com TTL estratégico

Rate limiting

Workers separados da API

Prisma com pooling

🛡️ Segurança

JWT (API + WebSocket)

Guards por papel (CLIENT, PROVIDER, ADMIN)

Sanitização de PII

Logs mascarados

Auditoria financeira completa

Antifraude no fluxo PIX

Webhooks com verificação de assinatura

📈 Escalabilidade

Separação clara API / Workers

Processamento assíncrono

Módulos independentes

Idempotência em:

Webhooks

Jobs

Saques

🧠 Observabilidade

Sentry tracing em todas as requests

Logs estruturados

Health checks

Métricas de filas (Bull-board pronta)

📂 Estrutura do Projeto
src/
  auth/
  users/
  providers/
  bookings/
  payments/
  earnings/
  withdrawals/
  chat/
  notifications/
  queues/
  common/
  shared/
  prisma/
docs/
  architecture.png
  modules/
    bookings.md
    payments.md
    earnings.md
    verification.md
🔍 Documentação da API

Swagger:

/api/docs
📜 Licença

MIT

🏁 Status do Projeto

✅ Produção-ready
✅ Arquitetura auditável
✅ Financeiro consistente
✅ Escalável e observável

Este backend foi projetado para passar due diligence técnica, auditoria financeira e crescer sem retrabalho.