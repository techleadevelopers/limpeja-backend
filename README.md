<div align="center">
  <img src="https://drive.google.com/uc?id=1PkFFe5bAEVf-x-nPD3BMO21gptKfFosu" alt="LimpeJá Logo" width="80" />

  <h1 style="color:#2c3e50; font-size:2.6em; margin:16px 0 8px;">LimpeJá — Backend</h1>

  <p style="color:#7f8c8d; font-size:1.1em; margin-bottom:20px;">
    <strong>NestJS · Prisma · PostgreSQL · Redis · PIX · WebSockets</strong><br/>
    Backend de nível <strong>enterprise</strong> para marketplace de serviços de limpeza, projetado para <strong>escala</strong>, <strong>segurança financeira</strong>, <strong>observabilidade</strong> e <strong>evolução contínua</strong>.
  </p>
</div>

<div style="background-color:#f8f9fa; padding:30px; border-radius:12px; border:1px solid #dee2e6; margin-bottom:40px;">

<h2 style="color:#34495e; border-bottom:2px solid #e0e0e0; padding-bottom:10px;">🚀 Visão Geral</h2>

<p style="color:#555; line-height:1.6;">
O <strong>LimpeJá Backend</strong> é o núcleo transacional e operacional da plataforma LimpeJá. Ele conecta <strong>clientes</strong>, <strong>prestadores verificados</strong> e <strong>administradores</strong>, orquestrando:
</p>

<ul style="color:#555; line-height:1.6;">
  <li>Agendamentos complexos</li>
  <li>Pagamentos PIX com retenção e liberação (ledger contábil)</li>
  <li>Saques e conciliação financeira</li>
  <li>Chat seguro em tempo real</li>
  <li>Disputas, reembolsos e garantias</li>
  <li>Verificação de identidade (OCR + selfie)</li>
  <li>Programas de fidelidade, missões e ranking</li>
</ul>

<p style="color:#555; line-height:1.6;">
Tudo foi construído com foco em <strong>consistência financeira</strong>, <strong>idempotência</strong>, <strong>auditoria</strong> e <strong>resiliência</strong>.
</p>

</div>

<div style="background-color:#ffffff; padding:30px; border-radius:12px; border:1px solid #dee2e6; margin-bottom:40px;">

<h2 style="color:#34495e; border-bottom:2px solid #e0e0e0; padding-bottom:10px;">🧩 Arquitetura do Sistema</h2>

<div align="center" style="margin:20px 0;">
  <img src="https://drive.google.com/uc?id=1dFSaBKW6AIs1_DLeOAsUfv5Zl5BkPdI_" alt="Arquitetura LimpeJá" style="max-width:100%; border-radius:8px;" />
</div>

<h3 style="color:#2c3e50;">Stack Principal</h3>

<ul style="color:#555; line-height:1.6;">
  <li><strong>NestJS</strong> — Arquitetura modular, DI, Guards, Pipes</li>
  <li><strong>Prisma ORM</strong> — Tipagem forte + migrações seguras</li>
  <li><strong>PostgreSQL</strong> — Dados transacionais e financeiros</li>
  <li><strong>Redis</strong> — Cache, filas e rate-limit</li>
  <li><strong>Bull Queues</strong> — Processamento assíncrono</li>
  <li><strong>WebSockets</strong> — Chat e eventos em tempo real</li>
  <li><strong>JWT Auth</strong> — API e WS</li>
  <li><strong>Swagger / OpenAPI</strong> — Documentação viva</li>
  <li><strong>Sentry</strong> — Tracing, erros e performance</li>
</ul>

<p style="color:#555;"><strong>📌 Diagrama completo:</strong> <code>/docs/architecture.png</code></p>

</div>

<div style="background-color:#f8f9fa; padding:30px; border-radius:12px; border:1px solid #dee2e6; margin-bottom:40px;">

<h2 style="color:#34495e; border-bottom:2px solid #e0e0e0; padding-bottom:10px;">🏗️ Organização por Domínio</h2>

<p style="color:#555; line-height:1.6;">O backend segue uma abordagem <strong>DDD-lite</strong>, com módulos independentes e responsabilidades claras.</p>

<h3>Núcleo</h3>
<ul><li>Auth</li><li>Users</li><li>Clients</li><li>Providers</li><li>Roles & Permissions</li></ul>

<h3>Operacional</h3>
<ul><li>Services</li><li>Provider Services</li><li>Availability</li><li>Bookings</li><li>Pricing</li><li>Offers & Coupons</li></ul>

<h3>Financeiro (Alta criticidade)</h3>
<ul><li>Payments (PIX)</li><li>Earnings (Ledger)</li><li>Withdrawals</li><li>Refunds</li><li>Guarantees</li></ul>

<h3>Experiência & Engajamento</h3>
<ul><li>Chat</li><li>Notifications</li><li>Reviews</li><li>Ranking</li><li>Loyalty</li><li>Missions</li><li>Referrals</li></ul>

<h3>Segurança & Compliance</h3>
<ul><li>Verification</li><li>Safety</li><li>Disputes</li><li>Subscriptions</li></ul>

<p style="color:#555;"><strong>📚 Documentação:</strong> <code>/docs/modules/*.md</code></p>

</div>

<div style="background-color:#ffffff; padding:30px; border-radius:12px; border:1px solid #dee2e6; margin-bottom:40px;">

<h2 style="color:#34495e; border-bottom:2px solid #e0e0e0; padding-bottom:10px;">🔄 Fluxos Críticos</h2>

<h3>1️⃣ Agendamento + Pagamento PIX</h3>
<ol><li>Cliente escolhe provedor</li><li>Pricing aplica regras e cupons</li><li>Booking criado</li><li>PIX gerado</li><li>Webhook confirma pagamento</li><li>Booking → <strong>CONFIRMED</strong></li><li>Ledger: HOLD / FEE</li></ol>

<h3>2️⃣ Conclusão do Serviço</h3>
<ol><li>Prestador conclui</li><li>Booking → <strong>FINISHED</strong></li><li>Ledger: EARNING / liberação do HOLD</li><li>Valor disponível para saque</li></ol>

<h3>3️⃣ Saques</h3>
<ul><li>Idempotency-key</li><li>Aprovação manual</li><li>Webhook de payout</li><li>Ledger WITHDRAWAL</li></ul>

<h3>4️⃣ Disputas e Reembolsos</h3>
<ul><li>Abertura de disputa</li><li>Booking → <strong>PENDING_DISPUTE</strong></li><li>Resolução administrativa</li></ul>

</div>

<div style="background-color:#f8f9fa; padding:30px; border-radius:12px; border:1px solid #dee2e6; margin-bottom:40px;">

<h2 style="color:#34495e; border-bottom:2px solid #e0e0e0; padding-bottom:10px;">⚙️ Infraestrutura</h2>
<ul><li>PostgreSQL otimizado</li><li>Redis (filas, cache, rate-limit)</li><li>Workers separados</li><li>Prisma com pooling</li></ul>

</div>

<div style="background-color:#ffffff; padding:30px; border-radius:12px; border:1px solid #dee2e6; margin-bottom:40px;">

<h2 style="color:#34495e; border-bottom:2px solid #e0e0e0; padding-bottom:10px;">🛡️ Segurança</h2>
<ul><li>JWT API + WS</li><li>RBAC</li><li>Sanitização de PII</li><li>Auditoria financeira</li><li>Antifraude PIX</li></ul>

</div>

<div style="background-color:#f8f9fa; padding:30px; border-radius:12px; border:1px solid #dee2e6; margin-bottom:40px;">

<h2 style="color:#34495e; border-bottom:2px solid #e0e0e0; padding-bottom:10px;">📂 Estrutura do Projeto</h2>
<pre><code>src/
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
</code></pre>

</div>

<div style="background-color:#ffffff; padding:30px; border-radius:12px; border:1px solid #dee2e6;">

<h2 style="color:#34495e;">🏁 Status do Projeto</h2>
<ul><li>✅ Produção-ready</li><li>✅ Arquitetura auditável</li><li>✅ Financeiro consistente</li><li>✅ Escalável e observável</li></ul>

<blockquote>Este backend foi projetado para <strong>due diligence técnica</strong>, <strong>auditoria financeira</strong> e <strong>crescimento sem retrabalho</strong>.</blockquote>

</div>
