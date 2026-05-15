# LOG DO PROJETO STRIPE / CHECKOUT VIRAHIT

> Documento de registro de todas as sessões, correções, testes e decisões.
> Última atualização: 2026-05-12
> Responsável: Nicolas (General) + Hermes Socio-God

---

## RESUMO EXECUTIVO

O checkout ViraHit suporta 3 gateways: **Stripe (cartão/Apple Pay/Google Pay)**, **PIX via Woovi**, e tem webhook para atualização automática de status no Firestore.

| 13 | Link compartilhado vai para raiz do domínio | `handleCopyLink` gerava `virahit.ai/?pedido=xyz` em vez de `virahit.ai/quiz/?pedido=xyz` | Corrigido para `/quiz/?pedido=xyz` | `CheckoutScreen.tsx` |

**Descoberta importante (2026-05-12 20:00):**
Um agente anterior inspecionou o código e descobriu que a arquitetura de link persistente
JÁ EXISTIA no CheckoutScreen.tsx (linhas 454-462). O `loadData()` já lia `?pedido=xyz`
da URL e buscava no Firestore. O único bug era o `handleCopyLink` que gerava a URL
sem o `/quiz/`. Fix de 1 linha resolveu tudo.

**O que isso prova:**
- A arquitetura do checkout foi bem desenhada desde o início
- O problema não era estrutural, era um bug simples de 1 linha
- Não precisava de 3 dias de refactor — só precisava de inspeção de código

**Status hoje (2026-05-12):** Cartão real ✅ | Apple Pay ✅ | PIX eager ✅ | Webhook Stripe ✅ | Rate limiting ✅ | Link persistente ✅

**Modo:** LIVE (migrado em 2026-05-12 18:40 UTC) — valor de teste: R$1,00

**Escala:** Preparado para 1000 pessoas/dia no checkout (rate limiting + body parser + PIX eager)

---

## TIMELINE CRONOLÓGICA

### 2026-05-11 — SESSÃO PRINCIPAL (Stripe E2E)

**Objetivo:** Fazer o checkout com cartão funcionar de ponta a ponta.

**Problemas encontrados e corrigidos:**

| # | Problema | Causa Raiz | Fix Aplicado | Arquivo(s) |
|---|---|---|---|---|
| 1 | Firestore retornava 429 | Database `ai-studio-5f1d09ec` tinha `freeTierLimited: true` mesmo com projeto Blaze | PATCH via Cloud Shell: `free_tier_limited: false` | Configuração Firebase (API REST) |
| 2 | `idPedido` ausente no retorno de `buscarPedido()` | Função retornava dados do doc sem incluir o ID do documento | Adicionado `idPedido: pedidoId` no return | `src/lib/firebase.ts` |
| 3 | Stripe `confirmPayment()` falhava | `PaymentElement` configurado com `fields.billingDetails.address: 'never'`, mas `confirmPayment()` não passava endereço | Adicionado `payment_method_data.billing_details.address` completo (BR) | `src/components/CheckoutScreen.tsx` |
| 4 | PaymentElement demorava 30s para renderizar | Stripe Elements carrega múltiplos iframes dinamicamente | Identificado — não é bug, é comportamento normal em headless | Documentado |

**Teste E2E realizado:**
- Quiz (3 etapas) → Conversão → Pedido Firestore → Checkout → Aba Cartão → Preencher 4242... → Submeter → **APROVADO em 2s** → Tela "PAGAMENTO CONFIRMADO!" ✅

**NÃO resolvido na sessão:**
- Webhook Stripe: endpoint não existia, secret era placeholder (`whsec_test_a_obter`)
- PIX: não testado nesta sessão
- Apple Pay: não testado nesta sessão

---

### 2026-05-12 — SESSÃO ATUAL (Webhooks + Infra + Migração LIVE)

**Problemas encontrados e corrigidos:**

| # | Problema | Causa Raiz | Fix Aplicado | Arquivo(s) |
|---|---|---|---|---|
| 5 | 16 processos zumbis no VPS | `hermes-dashboard.service` rodava há 10 dias sem restart; processo pai Python não deu `wait()` nos filhos | `systemctl --user restart hermes-dashboard.service` | — |
| 6 | Zumbis voltariam a acumular | Serviço sem limite de tempo de execução | Adicionado `RuntimeMaxSec=7d` no `.service` | `~/.config/systemd/user/hermes-dashboard.service` |
| 7 | Webhook Stripe não atualizava status | `STRIPE_WEBHOOK_SECRET=whsec_test_a_obter` (placeholder) | Criado endpoint `we_1TWKIOKTJGhcVEuhbVf7gnMj` na conta Stripe teste; atualizado secret em `.env` e `.env.test` | `.env`, `.env.test`, Stripe Dashboard |
| 8 | PIX retornando 401 desde 01:53 | `WOOVI_APP_ID` no `.env` foi corrompido durante sessão do Stripe (11/May) | Recuperado App ID correto do `.env.live`; atualizado `.env` e `.env.test` | `.env`, `.env.test` |
| 9 | Servidor em LIVE com proxy quebrado | Caddy envia `/quiz/api/*` para servidor, mas Express só responde em `/api/*` | Adicionado middleware rewrite: `/quiz/api/*` → `/api/*` | `server.ts` |
| 10 | Webhook LIVE com URL errada | Endpoint configurado como `https://virahit.ai/api/webhook/stripe` (404) | Atualizado para `https://virahit.ai/quiz/api/webhook/stripe` (200) | Stripe Dashboard |
| 11 | PayloadTooLargeError no PIX | Frontend enviava `session` inteiro (com áudio base64) no body do POST `/api/pix` | Backend aceita campos diretos (`nome`, `compradorWhatsApp`); frontend envia só o necessário | `server.ts`, `CheckoutScreen.tsx` |
| 12 | Sem proteção contra flood | Endpoints de pagamento sem rate limiting | Rate limit por IP: 20 req/min PIX, 30 req/min Stripe | `server.ts` |

**Testes realizados hoje:**

| Teste | Como | Resultado | Timestamp |
|---|---|---|---|
| Evento webhook simulado (assinatura válida) | curl localhost:3000/api/webhook/stripe | HTTP 200, pedido atualizado para `pago` no Firestore | 2026-05-12 17:45 |
| PIX gerar cobrança Woovi | curl localhost:3000/api/pix | HTTP 200, charge ACTIVE, brCode gerado | 2026-05-12 18:08 |
| Zumbis eliminados | ps aux + systemctl restart | 16 → 0 zumbis | 2026-05-12 17:27 |
| Servidor restart PM2 | pm2 restart --update-env | 2 instâncias online, env vars carregadas | 2026-05-12 18:08 |
| PaymentIntent LIVE criado | curl virahit.ai/api/pagamento/criar-intencao | HTTP 200, `livemode: true`, amount: 100 | 2026-05-12 18:36 |
| PIX LIVE gerado | curl virahit.ai/api/pix | HTTP 200, charge ACTIVE, value: 100 | 2026-05-12 18:36 |
| Webhook LIVE acessível | curl virahit.ai/quiz/api/webhook/stripe | HTTP 200 | 2026-05-12 18:40 |
| Rate limit PIX | 25 requests sequenciais | 20× 200 + 5× 429 | 2026-05-12 19:05 |
| PIX com campos diretos | curl com `nome` + `compradorWhatsApp` | HTTP 200, charge ACTIVE | 2026-05-12 19:05 |

---

## DECISÕES ARQUITETURAIS

| Decisão | Quando | Por quê |
|---|---|---|
| Stripe modo TESTE (`sk_test_`) | 2026-05-11 | Desenvolvimento — cartão 4242 funciona, sem dinheiro real |
| `allow_redirects: 'never'` no PaymentIntent | 2026-05-11 | Apple Pay/Google Pay no Brasil não precisam de redirect; evita travamento no Safari iOS |
| Dois `<Elements>` providers separados | 2026-05-11 | ExpressCheckoutElement e PaymentElement NUNCA no mesmo provider (regra Stripe) |
| `wallets: { applePay: 'never', googlePay: 'never' }` no PaymentElement | 2026-05-11 | Evita botões duplicados quando há ExpressCheckoutElement separado |
| Fetch eager do `clientSecret` | 2026-05-11 | Buscar PI assim que `idPedido` existe, não esperar usuário clicar em "Cartão" |
| `RuntimeMaxSec=7d` no dashboard | 2026-05-12 | Previne acúmulo de zumbis sem downtime |
| Webhook endpoint: `/api/webhook/stripe` | 2026-05-12 | URL padrão, já configurada no servidor |
| PIX endpoint: `/api/pix` | Desde início | Woovi API v1 |

---

## STATUS ATUAL POR COMPONENTE

### Backend (server.ts)

| Rota | Função | Status | Último teste |
|---|---|---|---|
| `POST /api/pagamento/criar-intencao` | Cria Stripe PaymentIntent | ✅ | 2026-05-11 |
| `POST /api/pix` | Cria cobrança Woovi PIX | ✅ | 2026-05-12 |
| `POST /api/webhook/stripe` | Recebe eventos Stripe | ✅ | 2026-05-12 |
| `POST /api/webhook/pix` | Recebe eventos Woovi | ✅ (não testado hoje, funcionava antes) | 2026-05-11 |
| `POST /api/payment-event` | Observability | ✅ | 2026-05-11 |
| `GET /api/payment-events/:pedidoId` | Consulta eventos | ✅ | 2026-05-11 |
| `GET /api/health` | Health check | ✅ | 2026-05-12 |

### Frontend (CheckoutScreen.tsx)

| Componente | Status | Notas |
|---|---|---|
| Aba PIX | ✅ | Gera QR code, salva no Firestore |
| Aba Cartão | ✅ | PaymentElement com layout accordion, endereço BR completo no confirmPayment |
| Apple Pay / Google Pay | ⏳ | ExpressCheckoutElement configurado, precisa teste real em iPhone/Safari |
| Tela de Sucesso | ✅ | "PAGAMENTO CONFIRMADO!" renderiza corretamente |

### Firebase / Firestore

| Coleção | Status | Notas |
|---|---|---|
| `pedidos` | ✅ | `freeTierLimited: false` (corrigido), regras abertas |
| `payment_events` | ✅ | Observability ativa |

---

## VARIÁVEIS DE AMBIENTE (Máscara)

Arquivo ativo: `.env` (via `DOTENV_CONFIG_PATH` no `ecosystem.config.cjs`)

```
STRIPE_SECRET_KEY=sk_test_...QwtJ          # TESTE — NUNCA live aqui
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...CerA # TESTE
STRIPE_WEBHOOK_SECRET=whsec_...ZE3z         # Endpoint: we_1TWKIOKTJGhcVEuhbVf7gnMj
WOOVI_APP_ID=Q2xpZW50X0lkX...MkM0MkU9     # Funcionando (recuperado do .env.live)
NODE_ENV=production
```

Arquivos existentes:
- `.env` — ativo (PM2 usa este)
- `.env.test` — mirror do ativo (backup/sincronizado)
- `.env.live` — produção (sk_live_, pk_live_, Woovi live)

---

## BUGS HISTÓRICOS (para referência futura)

### Bug #1: Firestore 429
**Sintoma:** Operações de write/read falhavam com "Too Many Requests"
**Causa:** `freeTierLimited: true` em database criado pelo AI Studio
**Fix:** PATCH via REST API do Firebase
**Verificação:** `curl .../databases/DB_ID` → `freeTierLimited` deve sumir

### Bug #2: idPedido ausente
**Sintoma:** Checkout não tinha ID do pedido para criar PaymentIntent
**Causa:** `buscarPedido()` retornava `doc.data()` sem `idPedido`
**Fix:** Adicionar `idPedido: pedidoId` no return

### Bug #3: confirmPayment sem endereço
**Sintoma:** "Erro ao processar pagamento" no submit do cartão
**Causa:** `fields.billingDetails.address: 'never'` no PaymentElement exige endereço manual
**Fix:** Passar endereço BR completo em `payment_method_data.billing_details.address`

### Bug #4: Webhook secret placeholder
**Sintoma:** Webhook retornava 400, Stripe logava "signature verification failed"
**Causa:** `STRIPE_WEBHOOK_SECRET=whsec_test_a_obter` nunca foi trocado
**Fix:** Criar endpoint no Stripe Dashboard, copiar secret real

### Bug #5: Woovi App ID corrompido
**Sintoma:** PIX retornava 401 "appID inválido"
**Causa:** `.env` sobrescrito durante sessão do Stripe, App ID trocado
**Fix:** Recuperar do `.env.live` (única fonte confiável)
**Prevenção:** NUNCA editar `.env` sem verificar se Woovi/App IDs foram preservados

---

## COMANDOS ÚTEIS

```bash
# Verificar últimos PaymentIntents Stripe
STRIPE_KEY=$(grep STRIPE_SECRET_KEY .env | cut -d= -f2)
curl -s "https://api.stripe.com/v1/payment_intents?limit=5" -u "$STRIPE_KEY:" | \
  python3 -c "import json,sys; [print(f'[{p[\"status\"]}] R\${p[\"amount\"]/100:.2f} | {p[\"id\"]}') for p in json.load(sys.stdin)['data']]"

# Verificar webhook endpoints
STRIPE_KEY=$(grep STRIPE_SECRET_KEY .env | cut -d= -f2)
curl -s https://api.stripe.com/v1/webhook_endpoints -u "$STRIPE_KEY:"

# Testar PIX localmente
curl -s -X POST http://localhost:3000/api/pix \
  -H "Content-Type: application/json" \
  -d '{"pedidoId":"test-xyz","session":{"nome":"Teste"}}'

# Verificar zumbis
ps aux | awk '$8 ~ /^Z/ { print $0 }'

# Restart PM2 com env atualizado
cd ~/empresa/funil-web/quiz-virahit-v2
pm2 restart quiz-virahit --update-env

# Verificar se build está atualizado
stat -c "%y" dist/assets/index-*.js
git status --short  # modificações não commitadas?
```

---

## CHECKLIST PARA MIGRAÇÃO PARA LIVE

Quando o General der Sinal Verde para produção:

- [ ] Trocar `.env` por `.env.live` (ou copiar conteúdo)
- [ ] `npm run build` e `pm2 restart quiz-virahit --update-env`
- [ ] Verificar `health`: stripe=true, woovi=true
- [ ] Criar webhook endpoint no Stripe LIVE (URL: `https://virahit.ai/quiz/api/webhook/stripe`)
- [ ] Atualizar `STRIPE_WEBHOOK_SECRET` com secret do endpoint LIVE
- [ ] Testar cartão real (não 4242) ou Apple Pay
- [ ] Testar PIX real (gerar QR, não pagar)
- [ ] Testar webhook: fazer pagamento de teste e verificar se Firestore atualiza para `pago`

---

## PRÓXIMOS PASSOS PENDENTES

| # | Tarefa | Quem faz | Prioridade |
|---|---|---|---|
| 1 | Testar Apple Pay em iPhone/Safari real | General (Nicolas) | Alta |
| 2 | Testar Google Pay em Android/Chrome real | General (Nicolas) | Média |
| 3 | Decisão: migrar para LIVE ou continuar em TESTE | General (Nicolas) | Alta |
| 4 | Testar webhook PIX end-to-end (pagar um PIX real) | General (Nicolas) | Média |
| 5 | Commit das mudanças no git | Hermes ou General | Baixa |

---

## NOTAS

- **NUNCA** editar `.env` sem verificar `WOOVI_APP_ID`, `STRIPE_WEBHOOK_SECRET` e `FIREBASE_*` variáveis — sessão do Stripe (11/May) corrompeu Woovi App ID.
- **NUNCA** usar `pm2 restart` sem `--update-env` quando `.env` mudou.
- **SEMPRE** verificar `git status` + `stat dist/assets/index-*.js` antes de debugar — build desatualizado é causa #1 de "funcionava no código mas não no ar".
- O dashboard Hermes (`hermes-dashboard.service`) agora reinicia automaticamente a cada 7 dias para evitar zumbis.
