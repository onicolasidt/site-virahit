# Decisao de Stack — Funil ViraHit
# Versao: 1.1 | Atualizado: 2026-05-07
# Alteracao v1.1: adicionado Stripe para cartao de credito (WOOVI continua para PIX)

---

## Stack Aprovada

| Camada | Tecnologia | Versao | Motivo |
|--------|------------|--------|--------|
| Frontend | Next.js App Router | 14 | SSR para SEO landing, Route Handlers server-side para pagamentos sem expor keys |
| Estilizacao | Tailwind CSS + shadcn/ui | 3.x | Velocidade de dev, design system ViraHit |
| Deploy | Vercel Hobby | — | Zero config Next.js, preview por branch, gratuito para MVP |
| Pagamento PIX | WOOVI SDK Node.js | latest | PIX nativo brasileiro, SDK oficial, webhook HMAC, sandbox |
| Pagamento Cartao | Stripe SDK Node.js | latest | Cartao de credito, checkout embutido, webhook de confirmacao |
| Dados | Baserow REST API | — | Zero setup, interface visual, token disponivel, ideal para MVP |
| Runtime | Node.js 18+ LTS + TypeScript | 18+ / 5.x | Estabilidade LTS, tipagem forte |

---

## Decisao de Pagamento — Arquitetura Dual

Dois metodos, dois SDKs, um unico fluxo de checkout:

| Metodo | SDK | Quando usar |
|--------|-----|-------------|
| PIX | WOOVI | Cliente seleciona PIX no checkout |
| Cartao | Stripe Elements | Cliente seleciona cartao no checkout |

O checkout exibe os dois metodos lado a lado. O cliente escolhe um.
Cada metodo tem seu proprio webhook de confirmacao -> ambos atualizam Baserow.

---

## Estrutura de Pastas

```
virahit/
  app/
    page.tsx              -- Landing Page (/)
    quiz/
      page.tsx            -- Quiz (/quiz)
    checkout/
      page.tsx            -- Checkout PIX + Cartao (/checkout)
    obrigado/
      page.tsx            -- Pos-pagamento (/obrigado)
    api/
      woovi-webhook/
        route.ts          -- Webhook WOOVI (/api/woovi-webhook)
      woovi-charge/
        route.ts          -- Criar cobranca PIX (/api/woovi-charge)
      stripe-webhook/
        route.ts          -- Webhook Stripe (/api/stripe-webhook)
      stripe-intent/
        route.ts          -- Criar PaymentIntent (/api/stripe-intent)
      baserow/
        route.ts          -- Salvar/atualizar pedido (/api/baserow)
  components/
    landing/              -- Componentes da landing page
    quiz/                 -- Componentes dos 4 passos do quiz
    checkout/             -- Componentes do checkout (PIX + Cartao)
    ui/                   -- shadcn/ui components
  lib/
    woovi.ts              -- Configuracao WOOVI SDK
    stripe.ts             -- Configuracao Stripe SDK (server-side)
    baserow.ts            -- Helpers Baserow API
    webhooks.ts           -- Validacao HMAC (WOOVI) e signature (Stripe)
  .env.local              -- Variaveis de ambiente (nao commitar — NUNCA)
  .env.example            -- Template de variaveis (commitar sem valores)
```

---

## Variaveis de Ambiente (.env.example)

```bash
# WOOVI — Pagamento PIX
WOOVI_SECRET=
WOOVI_CLIENT_ID=
WOOVI_WEBHOOK_SECRET=

# Stripe — Pagamento Cartao
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Baserow — Armazenamento de Pedidos
BASEROW_TOKEN=
BASEROW_TABLE_ID=901528

# App
NEXT_PUBLIC_APP_URL=
```

REGRAS CRITICAS DE SEGURANCA:
- WOOVI_SECRET: NUNCA prefixo NEXT_PUBLIC_ — apenas server-side
- STRIPE_SECRET_KEY: NUNCA prefixo NEXT_PUBLIC_ — apenas server-side
- STRIPE_WEBHOOK_SECRET: NUNCA prefixo NEXT_PUBLIC_ — apenas server-side
- BASEROW_TOKEN: NUNCA prefixo NEXT_PUBLIC_ — apenas server-side
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: unica key que vai ao cliente (e publica por design)
- .env.local NUNCA commitar no Git (ja esta no .gitignore do Next.js por padrao)

---

## Fluxo de API — PIX via WOOVI

```
Fluxo de Cobranca PIX:

  Browser
    |
    | POST /api/woovi-charge (dados do pedido)
    v
  Next.js Route Handler (server-side)
    |                         |
    | POST /api/v1/charge      | POST rows/table/901528/ (criar linha)
    v                         v
  WOOVI API              Baserow API
    |
    | retorna { qrCode, correlationID, expiresIn }
    v
  Next.js Route Handler
    |
    | { qrCode, correlationID }
    v
  Browser (exibe QR Code, inicia polling a cada 3s)


Confirmacao PIX via Webhook:

  WOOVI API
    |
    | POST /api/woovi-webhook (evento OPENPIX:CHARGE_COMPLETED)
    v
  Next.js Route Handler
    |
    | 1. valida HMAC via WOOVI_WEBHOOK_SECRET
    | 2. extrai correlationID
    | 3. busca linha no Baserow pelo correlationID
    |
    | PATCH rows/table/901528/{rowId}/ (Status -> Confirmado)
    v
  Baserow API
    |
    | resposta 200
    v
  Next.js -> emite evento SSE ou responde polling do browser -> redirect /obrigado
```

---

## Fluxo de API — Cartao via Stripe

```
Fluxo de Pagamento com Cartao:

  Browser
    |
    | POST /api/stripe-intent (valor, metadata do pedido)
    v
  Next.js Route Handler (server-side)
    |                         |
    | stripe.paymentIntents    | POST rows/table/901528/ (criar linha)
    |   .create({ amount,      v
    |     currency: 'brl',  Baserow API (Status: Aguardando Cartao)
    |     metadata })
    v
  Stripe API
    |
    | retorna { clientSecret }
    v
  Next.js Route Handler
    |
    | { clientSecret }
    v
  Browser
    |
    | Stripe Elements monta formulario de cartao com clientSecret
    | Usuario preenche dados do cartao (dados NUNCA tocam nosso servidor)
    | stripe.confirmPayment() chamado client-side
    v
  Stripe API (processa pagamento)
    |
    | redireciona para /obrigado?payment_intent=pi_xxx ou
    | envia webhook para /api/stripe-webhook


Confirmacao Cartao via Webhook:

  Stripe API
    |
    | POST /api/stripe-webhook (evento payment_intent.succeeded)
    v
  Next.js Route Handler
    |
    | 1. valida assinatura via stripe.webhooks.constructEvent()
    |    usando STRIPE_WEBHOOK_SECRET
    | 2. extrai metadata (pedidoId, correlationId Baserow)
    |
    | PATCH rows/table/901528/{rowId}/ (Status -> Confirmado)
    v
  Baserow API
```

---

## Integracao WOOVI — Pontos Criticos

- Endpoint de cobranca: POST https://api.woovi.com/api/v1/charge
- correlationID formato: virahit-{timestamp}-{rowId}
- Valor em centavos: R$47 = 4700 | R$67 = 6700 | R$77 = 7700
- expiresIn: 1800 segundos (30 minutos)
- Webhook: evento OPENPIX:CHARGE_COMPLETED
- Validacao: HMAC-SHA256 com WOOVI_WEBHOOK_SECRET
- Polling client-side: GET /api/woovi-charge/[correlationID] a cada 3s
- Sandbox: mesmos endpoints com credenciais sandbox

---

## Integracao Stripe — Pontos Criticos

- Fluxo: PaymentIntents API + Stripe Elements (formulario embutido)
- Moeda: BRL (real brasileiro)
- Valor em centavos: R$47 = 4700 | R$67 = 6700 | R$77 = 7700
- Metadata obrigatorio no PaymentIntent: { pedidoId, nomeHomenageado, estilo, plano }
- Webhook: evento payment_intent.succeeded
- Validacao: stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)
- ATENCAO: body do webhook deve ser raw (Buffer), nao parsed JSON
- Stripe Elements: usar @stripe/stripe-js + @stripe/react-stripe-js no frontend
- Publishable key: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (unica key publica)
- Secret key: STRIPE_SECRET_KEY — apenas em Route Handlers, nunca no cliente

---

## Campos Baserow (tabela Producao 901528)

| Campo | Descricao | Preenchido em |
|-------|-----------|---------------|
| Nome do comprador | Nome completo de quem paga | Checkout (criacao) |
| Email | Email para contato e entrega | Checkout (criacao) |
| Telefone (WhatsApp) | Numero com DDD | Checkout (criacao) |
| Nome presenteado | Nome da pessoa que recebe a musica | Quiz -> Checkout |
| Para quem | Tipo de destinatario (mae, namorado, etc.) | Quiz -> Checkout |
| Estilo musical | Genero escolhido no quiz | Quiz -> Checkout |
| Voz | Masculina ou feminina | Quiz -> Checkout |
| Historia | Texto livre com detalhes | Quiz -> Checkout |
| Plano | R$47 / R$67 / R$77 | Quiz Passo 5 |
| Valor pago | Valor efetivamente pago em reais | Checkout |
| Metodo de pagamento | PIX / Cartao | Checkout |
| Status | Aguardando PIX / Aguardando Cartao / Confirmado / Em producao / Entregue | Webhook |
| Correlation ID WOOVI | virahit-{timestamp}-{rowId} (PIX apenas) | Checkout |
| Stripe Payment Intent ID | pi_xxx (Cartao apenas) | Checkout |
| Data do pedido | Timestamp ISO da criacao | Checkout (criacao) |
| Order bump | sim / nao | Checkout |
| Upsell aceito | sim / nao | Pos-pagamento |

---

## Alternativas Rejeitadas

| Tecnologia | Rejeitada por |
|------------|---------------|
| Remix | Curva de aprendizado alta, sem beneficio claro vs Next.js |
| Styled Components | Runtime overhead desnecessario |
| AWS / DigitalOcean | Custo e configuracao desnecessarios para MVP |
| Stripe PIX | PIX nao liberado na conta atual — WOOVI cobre esta lacuna |
| Supabase / Prisma | Setup maior que Baserow para este caso de uso |
| WOOVI para cartao | Especialidade do WOOVI e PIX — Stripe e superior para cartao |

---

## Proximos Passos (Handoff para dev-virahit — Sessao C)

1. `npx create-next-app@14 virahit-funil --typescript --tailwind --app`
2. Instalar dependencias:
   `npm install stripe @stripe/stripe-js @stripe/react-stripe-js woovi-sdk`
3. Instalar shadcn/ui: `npx shadcn-ui@latest init`
4. Criar `.env.local` com os valores reais (solicitar ao General):
   - WOOVI_SECRET, WOOVI_CLIENT_ID, WOOVI_WEBHOOK_SECRET (criar conta WOOVI)
   - STRIPE_SECRET_KEY (nova key rotacionada — solicitar ao General)
   - STRIPE_WEBHOOK_SECRET (gerar no Stripe Dashboard -> Webhooks)
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_live_... — disponivel no Dashboard)
   - BASEROW_TOKEN=cWMKvF1vPQUFlKZsFV3F1raIQ8s1bWrj
   - BASEROW_TABLE_ID=901528
5. Implementar `lib/stripe.ts`, `lib/woovi.ts`, `lib/baserow.ts`
6. Configurar webhook no Stripe Dashboard apontando para:
   https://[dominio]/api/stripe-webhook
   Evento a escutar: payment_intent.succeeded
7. Iniciar pela Story 1 (setup do projeto) conforme PRD.md

---

*Atualizado por Socio-God apos decisao do General: Stripe para cartao + WOOVI para PIX*
*Secret key Stripe rotacionada em 2026-05-07 — solicitar nova key ao General antes da Story 5*
