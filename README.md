<div style="background-color: #f8f9fa; padding: 30px; border-radius: 12px; border: 1px solid #dee2e6;">

<div style="text-align: center; margin-bottom: 40px;">
    <img src="https://drive.google.com/uc?id=1PkFFe5bAEVf-x-nPD3BMO21gptKfFosu" alt="LimpeJá-App Logo" width="100" style="margin-top: 3px; border-radius: 15px;">
    <h1 style="color: #212529; font-size: 32px; margin-top: 15px; margin-bottom: 5px; font-weight: 700;">
        LimpeJá — Backend Core System
    </h1>
    <p style="color: #495057; font-size: 18px; font-weight: 400; margin-top: 0;">
        <span style="font-weight: 600; color: #007bff;">NestJS</span> · <span style="font-weight: 600; color: #007bff;">Prisma</span> · <span style="font-weight: 600; color: #007bff;">PostgreSQL</span> · <span style="font-weight: 600; color: #007bff;">Redis</span> · <span style="font-weight: 600; color: #007bff;">PIX</span>
    </p>
    <div style="color: #6c757d; font-size: 16px; border-top: 2px solid #e9ecef; padding-top: 15px; margin-top: 15px;">
        Backend de nível enterprise para marketplace de serviços, projetado para escala, segurança financeira, observabilidade e evolução contínua.
    </div>
</div>

<div style="margin-bottom: 40px;">
    <h2 style="color: #212529; border-left: 4px solid #007bff; padding-left: 10px; margin-bottom: 20px; font-size: 24px;">
        🚀 Visão Geral: O Núcleo Transacional
    </h2>
    <p style="color: #495057; line-height: 1.6;">
        O LimpeJá Backend é o núcleo transacional e operacional da plataforma. Ele conecta clientes, prestadores verificados e administradores, orquestrando fluxos complexos e críticos:
    </p>
    <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 20px;">
        <span style="background-color: #e9ecef; color: #343a40; padding: 8px 15px; border-radius: 20px; font-weight: 500;">Agendamentos e Logística</span>
        <span style="background-color: #e9ecef; color: #343a40; padding: 8px 15px; border-radius: 20px; font-weight: 500;">Pagamentos PIX (Ledger Contábil)</span>
        <span style="background-color: #e9ecef; color: #343a40; padding: 8px 15px; border-radius: 20px; font-weight: 500;">Verificação KYC (OCR + Selfie)</span>
        <span style="background-color: #e9ecef; color: #343a40; padding: 8px 15px; border-radius: 20px; font-weight: 500;">Chat Seguro em Tempo Real</span>
        <span style="background-color: #e9ecef; color: #343a40; padding: 8px 15px; border-radius: 20px; font-weight: 500;">Saques e Conciliação Financeira</span>
    </div>
    <p style="color: #495057; line-height: 1.6; margin-top: 20px; border-left: 3px solid #dc3545; padding-left: 10px;">
        Tudo foi construído com foco em **consistência financeira**, **idempotência**, **auditoria** e **resiliência**.
    </p>
</div>

<div style="margin-bottom: 40px;">
    <h2 style="color: #212529; border-left: 4px solid #007bff; padding-left: 10px; margin-bottom: 20px; font-size: 24px;">
        🧩 Arquitetura do Sistema
    </h2>

    <div style="text-align: center; margin-bottom: 30px; border: 1px solid #ced4da; padding: 10px; border-radius: 8px;">
        <img src="https://drive.google.com/uc?id=1dFSaBKW6AIs1_DLeOAsUfv5Zl5BkPdI_" alt="Diagrama de Arquitetura do Backend LimpeJá" style="width: 100%; max-width: 800px; border-radius: 8px;">
    </div>
    
    <div style="background-color: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
        <h3 style="color: #007bff; margin-top: 0; font-size: 20px;">Stack Principal</h3>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 15px;">
            <li style="flex-basis: 48%; color: #343a40;"><strong>NestJS:</strong> Arquitetura modular, DI, Guards, Pipes.</li>
            <li style="flex-basis: 48%; color: #343a40;"><strong>Prisma ORM:</strong> Tipagem forte + migrações seguras.</li>
            <li style="flex-basis: 48%; color: #343a40;"><strong>PostgreSQL:</strong> Dados transacionais e financeiros (com PostGIS).</li>
            <li style="flex-basis: 48%; color: #343a40;"><strong>Redis / Bull Queues:</strong> Processamento assíncrono e cache.</li>
            <li style="flex-basis: 48%; color: #343a40;"><strong>WebSockets:</strong> Chat e eventos em tempo real.</li>
            <li style="flex-basis: 48%; color: #343a40;"><strong>Sentry:</strong> Tracing, erros e performance.</li>
        </ul>
    </div>
    <p style="text-align: right; color: #6c757d; font-size: 14px; margin-top: 10px;">
        📌 Diagrama completo: <a href="/docs/architecture.png" style="color: #007bff; text-decoration: none;">/docs/architecture.png</a>
    </p>
</div>

<div style="margin-bottom: 40px;">
    <h2 style="color: #212529; border-left: 4px solid #007bff; padding-left: 10px; margin-bottom: 20px; font-size: 24px;">
        🏗️ Organização por Domínio (DDD-lite)
    </h2>
    <p style="color: #495057; line-height: 1.6;">
        O backend adota uma arquitetura modular, onde cada domínio é um módulo independente com responsabilidades claras.
    </p>

    <div style="display: flex; flex-wrap: wrap; margin-top: 15px;">
        <div style="flex-basis: 32%; background-color: #e6f7ff; padding: 15px; border-radius: 8px; margin-right: 2%; margin-bottom: 15px; border-left: 3px solid #91d5ff;">
            <h4 style="color: #096dd9; margin-top: 0; margin-bottom: 10px;">Financeiro (Alta Criticidade)</h4>
            <ul style="list-style: disc; padding-left: 20px; color: #343a40; font-size: 14px;">
                <li>Payments (PIX)</li>
                <li>Earnings (Ledger)</li>
                <li>Withdrawals</li>
                <li>Refunds / Guarantees</li>
            </ul>
        </div>

        <div style="flex-basis: 32%; background-color: #fffbe6; padding: 15px; border-radius: 8px; margin-right: 2%; margin-bottom: 15px; border-left: 3px solid #ffe58f;">
            <h4 style="color: #faad14; margin-top: 0; margin-bottom: 10px;">Operacional & Logística</h4>
            <ul style="list-style: disc; padding-left: 20px; color: #343a40; font-size: 14px;">
                <li>Bookings</li>
                <li>Availability</li>
                <li>Pricing / Offers</li>
                <li>Provider Services</li>
            </ul>
        </div>

        <div style="flex-basis: 32%; background-color: #f0f5ff; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 3px solid #adc6ff;">
            <h4 style="color: #1d39c4; margin-top: 0; margin-bottom: 10px;">Segurança & Engajamento</h4>
            <ul style="list-style: disc; padding-left: 20px; color: #343a40; font-size: 14px;">
                <li>Verification (KYC)</li>
                <li>Safety / Disputes</li>
                <li>Chat (WebSocket)</li>
                <li>Missions / Loyalty / Ranking</li>
            </ul>
        </div>
    </div>
    
    <p style="color: #495057; text-align: right; margin-top: 20px;">
        📚 Documentação detalhada por módulo: <a href="/docs/modules/*.md" style="color: #007bff; text-decoration: none;">➡️ /docs/modules/*.md</a>
    </p>
</div>

<div style="margin-bottom: 40px;">
    <h2 style="color: #212529; border-left: 4px solid #007bff; padding-left: 10px; margin-bottom: 20px; font-size: 24px;">
        🔄 Fluxos Críticos (Ledger Financeiro)
    </h2>
    
    <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e9ecef;">
        <h3 style="color: #343a40; font-size: 18px; margin-top: 0;"><span style="color: #007bff; font-weight: 600;">1️⃣ Agendamento + Pagamento PIX</span></h3>
        <p style="color: #495057; font-size: 14px; margin-bottom: 10px;">Após a confirmação do PIX (via webhook), o sistema registra o valor no Ledger do prestador:</p>
        <div style="background-color: #f0f3f6; padding: 10px; border-left: 3px solid #28a745; font-family: monospace; font-size: 14px; color: #343a40;">
            <span style="color: #28a745;">✅ HOLD (valor bruto)</span> — Dinheiro recebido, mas retido até a conclusão.<br>
            <span style="color: #dc3545;">❌ FEE (comissão)</span> — Débito imediato da taxa da plataforma.
        </div>
    </div>

    <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e9ecef;">
        <h3 style="color: #343a40; font-size: 18px; margin-top: 0;"><span style="color: #007bff; font-weight: 600;">2️⃣ Conclusão do Serviço (Booking → FINISHED)</span></h3>
        <p style="color: #495057; font-size: 14px; margin-bottom: 10px;">Liberação do valor líquido para saque, mantendo o balanço contábil zerado:</p>
        <div style="background-color: #f0f3f6; padding: 10px; border-left: 3px solid #ffc107; font-family: monospace; font-size: 14px; color: #343a40;">
            <span style="color: #28a745;">✅ EARNING (valor líquido)</span> — Disponível para saque.<br>
            <span style="color: #dc3545;">❌ HOLD negativo</span> — Débito para liberar o crédito inicial.
        </div>
        <p style="color: #6c757d; font-size: 12px; margin-top: 10px;">
            💡 **Modelo de Auditoria:** Garante **auditoria completa** e **reconciliação simples** de cada centavo.
        </p>
    </div>
</div>

<div style="margin-bottom: 40px;">
    <h2 style="color: #212529; border-left: 4px solid #007bff; padding-left: 10px; margin-bottom: 20px; font-size: 24px;">
        ⚙️ Infraestrutura, Segurança e Escalabilidade
    </h2>

    <div style="display: flex; justify-content: space-between; gap: 20px;">
        <div style="flex: 1; padding: 15px; border: 1px solid #ced4da; border-radius: 8px;">
            <h3 style="color: #dc3545; font-size: 18px; margin-top: 0;">🛡️ Segurança</h3>
            <ul style="list-style: none; padding: 0; margin: 0; color: #495057; font-size: 14px;">
                <li style="margin-bottom: 5px;"><strong>Guards por Papel:</strong> (CLIENT, PROVIDER, ADMIN).</li>
                <li style="margin-bottom: 5px;"><strong>Auditoria Financeira:</strong> Todas as transações no Ledger.</li>
                <li style="margin-bottom: 5px;"><strong>PII Masking:</strong> Logs e dados sensíveis mascarados.</li>
                <li style="margin-bottom: 5px;"><strong>Webhooks:</strong> Verificação de assinatura (integridade).</li>
            </ul>
        </div>
        
        <div style="flex: 1; padding: 15px; border: 1px solid #ced4da; border-radius: 8px;">
            <h3 style="color: #ffc107; font-size: 18px; margin-top: 0;">📈 Escalabilidade</h3>
            <ul style="list-style: none; padding: 0; margin: 0; color: #495057; font-size: 14px;">
                <li style="margin-bottom: 5px;"><strong>Separação API / Workers:</strong> Desacoplamento de I/O e CPU.</li>
                <li style="margin-bottom: 5px;"><strong>Idempotência:</strong> Chaves de controle para Webhooks e Jobs.</li>
                <li style="margin-bottom: 5px;"><strong>Módulos Independentes:</strong> Baixo acoplamento (DDD-lite).</li>
                <li style="margin-bottom: 5px;"><strong>Redis Cache/Throttling:</strong> Desempenho e proteção contra abuso.</li>
            </ul>
        </div>

        <div style="flex: 1; padding: 15px; border: 1px solid #ced4da; border-radius: 8px;">
            <h3 style="color: #28a745; font-size: 18px; margin-top: 0;">🧠 Observabilidade</h3>
            <ul style="list-style: none; padding: 0; margin: 0; color: #495057; font-size: 14px;">
                <li style="margin-bottom: 5px;"><strong>Sentry Tracing:</strong> Monitoramento ponta-a-ponta (Requests/Jobs).</li>
                <li style="margin-bottom: 5px;"><strong>Logs Estruturados:</strong> Fácil agregação e análise.</li>
                <li style="margin-bottom: 5px;"><strong>Health Checks:</strong> Para orquestradores (K8s/Cloud Run).</li>
                <li style="margin-bottom: 5px;"><strong>Métricas de Filas:</strong> Bull-board pronta para conectar.</li>
            </ul>
        </div>
    </div>
</div>

<div style="margin-bottom: 40px;">
    <h2 style="color: #212529; border-left: 4px solid #007bff; padding-left: 10px; margin-bottom: 20px; font-size: 24px;">
        📂 Estrutura do Projeto
    </h2>
    <div style="background-color: #f1f3f5; padding: 15px; border-radius: 8px; font-family: monospace; overflow: auto; color: #343a40; font-size: 14px;">
        <pre style="margin: 0; padding: 0;">
src/
  ├── auth/            # (Núcleo)
  ├── users/
  ├── providers/
  ├── bookings/        # (Operacional)
  ├── payments/        # (Financeiro)
  ├── earnings/        # (Financeiro)
  ├── withdrawals/     # (Financeiro)
  ├── chat/            # (Experiência)
  ├── verification/    # (Segurança)
  ├── queues/          # Configuração dos Workers Bull/Redis
  ├── common/
  ├── shared/
  └── prisma/
docs/
  ├── architecture.png
  └── modules/         # Documentação de Domínio (ex: bookings.md, payments.md)
        </pre>
    </div>
</div>

<div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e9ecef; padding-top: 20px;">
    <div>
        <h3 style="color: #212529; margin-top: 0; margin-bottom: 10px; font-size: 20px;">
            🔍 Documentação da API
        </h3>
        <a href="/api/docs" style="display: inline-block; background-color: #007bff; color: white; padding: 8px 15px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            Swagger: /api/docs
        </a>
    </div>
    
    <div style="text-align: right;">
        <h3 style="color: #212529; margin-top: 0; margin-bottom: 10px; font-size: 20px;">
            🏁 Status & Licença
        </h3>
        <p style="color: #28a745; font-weight: 700; font-size: 16px; margin-bottom: 5px;">
            ✅ Produção-ready, Escalável e Auditável
        </p>
        <p style="color: #6c757d; font-size: 14px; margin: 0;">
            Licença: **MIT**
        </p>
    </div>
</div>

</div>