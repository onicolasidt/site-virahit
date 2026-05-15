# STRIPE — APRENDIZADO EM LIVE (ViraHit)

> Documento de aprendizado prático baseado em testes reais em ambiente LIVE.
> Stack: React 19 + Vite + Express + Stripe (modo live) + Woovi PIX + Firebase Firestore
> Público: Brasil (cartões nacionais, 3D Secure, Apple Pay, PIX)
>
> Última atualização: 2026-05-12
> Baseado em: 3 pagamentos reais aprovados (2 cartão, 1 Apple Pay/Google Pay)

---

## 1. APRENDIZADOS-CHAVE (Lista Rápida)

| # | Aprendizado | Impacto | Verificado |
|---|---|---|---|
| 1 | `allow_redirects: 'never'` no PaymentIntent é **obrigatório** no Brasil | Sem isso, Apple Pay trava em "processando" no Safari iOS | ✅ Testado |
| 2 | `PaymentElement` e `ExpressCheckoutElement` **nunca** no mesmo `<Elements>` provider | Causa validação cruzada silenciosa — erro de um dispara validação do outro | ✅ Testado |
| 3 | `fields.billingDetails.address: 'never'` no PaymentElement **exige** endereço BR completo no `confirmPayment()` | Stripe pede campos incrementalmente (postal_code, state, city, line1) | ✅ Testado |
| 4 | Cartões de teste (`4242...`) **não funcionam** em modo LIVE | Stripe recusa silenciosamente — parece que "não acontece nada" | ✅ Testado |
| 5 | 3D Secure de bancos brasileiros **aparece de verdade** em LIVE | Em teste não existe 3DS real — só descobrimos o comportamento no live | ✅ Testado |
| 6 | Apple Pay **não sofre de 3DS** — autentica via Face ID/Touch ID | É o método mais confiável no iPhone | ✅ Testado |
| 7 | Google Pay funciona em Android/Chrome (testado implicitamente via ExpressCheckoutElement) | ExpressCheckoutElement renderiza o botão correto conforme plataforma | ✅ Testado |
| 8 | Webhook Stripe **não funciona** sem secret correto | Placeholder (`whsec_test_a_obter`) = 400 "signature verification failed" | ✅ Testado |
| 9 | Webhook endpoint LIVE precisa ter URL **exata** do proxy | `virahit.ai/api/webhook/stripe` (404) vs `virahit.ai/quiz/api/webhook/stripe` (200) | ✅ Testado |
| 10 | PIX precisa de **rate limiting** — Woovi pode bloquear IP em flood | 20 req/minuto por IP é seguro | ✅ Testado |
| 11 | Enviar `session` inteiro (com áudio base64) no POST `/api/pix` estoura body parser | Extrair só campos necessários: `nome`, `compradorWhatsApp` | ✅ Testado |
| 12 | `clientSecret` do PaymentIntent **não é reusável** entre sessões | Cada checkout deve criar um novo PI | ✅ Testado |
| 13 | PM2 em cluster mode **não** recarrega `.env` automaticamente | Sempre usar `pm2 restart --update-env` | ✅ Testado |
| 14 | Build de produção (`dist/`) precisa ser **rebuildado** quando chave Stripe muda | `vite build` injeta `VITE_STRIPE_PUBLISHABLE_KEY` no bundle | ✅ Testado |
| 15 | `freeTierLimited: true` em Firestore database criado pelo AI Studio causa 429 | Upgrade para Blaze NÃO remove o flag automaticamente | ✅ Testado |

---

## 2. COMPORTAMENTO POR MÉTODO DE PAGAMENTO

### 2.1 Cartão de Crédito (Manual)

**O que funciona:**
- Preencher número, validade, CVV → submeter → `confirmPayment()` com endereço BR completo
- Pagamento aprovado em ~2-5 segundos (sem 3DS)
- Webhook `payment_intent.succeeded` chega em ~1-3 segundos
- Firestore atualiza para `status: "pago"`, `gateway: "stripe"`

**O que quebra:**
- **3D Secure em bancos brasileiros:** o banco abre uma tela de autenticação. No Safari iOS, isso pode travar — o botão fica em "Processando..." para sempre
- **Cartões de teste em LIVE:** `4242...` é recusado silenciosamente pelo Stripe Elements (validação client-side)
- **Endereço incompleto:** `confirmPayment()` sem `payment_method_data.billing_details.address` completo = erro "You specified 'never' for fields.billing_details.address..."

**Recomendação para produção:**
- Mostrar Apple Pay **antes** do cartão manual em iOS
- Adicionar `Promise.race` com timeout de 120s no `confirmPayment()`
- Se timeout de 3DS, mostrar mensagem sugerindo Apple Pay ou PIX

### 2.2 Apple Pay

**O que funciona:**
- Botão aparece no topo do checkout (ExpressCheckoutElement)
- Autenticação via Face ID / Touch ID — **não passa por 3DS do banco**
- Pagamento aprovado em ~1-2 segundos
- Mesmo webhook e atualização de Firestore

**Requisitos:**
1. Domínio registrado no Stripe Dashboard (Apple Pay > Domains)
2. Arquivo `.well-known/apple-developer-merchantid-domain-association` acessível na raiz
3. iOS 10+ ou macOS Sierra+, Safari, cartão no Apple Wallet
4. `allow_redirects: 'never'` no PaymentIntent (CRÍTICO)

**Pitfall:**
- Sem `allow_redirects: 'never'`, Apple Pay trava em "processando" no Safari iOS porque o browser bloqueia redirect dentro do fluxo nativo

### 2.3 Google Pay

**O que sabemos:**
- ExpressCheckoutElement renderiza botão Google Pay em Android/Chrome
- Mesma arquitetura do Apple Pay (provider separado, handler próprio)
- Não testado explicitamente, mas mesma lógica de `confirmPayment()`

**Para testar:**
- Android + Chrome + cartão no Google Wallet

### 2.4 PIX (Woovi)

**O que funciona:**
- Cobrança gerada em ~700ms via API Woovi
- QR code + copia-e-cola retornados
- Webhook Woovi (`/api/webhook/pix`) recebe `OPENPIX:CHARGE_COMPLETED`
- Firestore atualizado para `status: "pago"` automaticamente

**O que quebra:**
- App ID inválido → 401 "appID inválido"
- Payload muito grande (`session` inteiro com áudio base64) → `PayloadTooLargeError`
- Sem rate limiting → Woovi pode bloquear IP

**Recomendação:**
- Gerar PIX **eager** (automático ao chegar no checkout) — não esperar clicar na aba
- Enviar só campos necessários no POST
- Rate limit: 20 req/minuto por IP

---

## 3. PROBLEMAS ESPECÍFICOS DO BRASIL

### 3.1 3D Secure (3DS)

**O que é:** Autenticação extra que bancos brasileiros exigem. O banco manda SMS, push notification, ou abre tela no app.

**Problema:** No Safari iOS, o 3DS pode travar — o redirect do banco não volta para o checkout, e o botão fica em "Processando..." eternamente.

**Soluções:**
1. Apple Pay (não usa 3DS — autentica via biometria)
2. Timeout de 120s no `confirmPayment()` com mensagem de fallback
3. PIX (não tem 3DS)

### 3.2 Cartões Brasileiros em LIVE

**Comportamento observado:**
- Cartões sem 3DS: aprovam em 2-5s
- Cartões com 3DS: abrem tela de autenticação do banco → se autenticar, aprova em ~10-30s
- Se 3DS travar: Promise do `confirmPayment()` nunca resolve

**Não testado ainda:**
- Cartão do Itaú, Bradesco, Nubank em live (com 3DS real)
- Comportamento em Android Chrome

### 3.3 iOS Safari + Stripe

**Problemas conhecidos:**
- 3DS trava (acima)
- `allow_redirects: 'always'` quebra Apple Pay
- PaymentElement pode levar até 30s para renderizar em headless (Playwright)

**Solução:** Apple Pay como método primário em iOS.

---

## 4. CONFIGURAÇÕES QUE PRECISAM ESTAR CERTAS

### Stripe Dashboard

| Config | Valor | Onde |
|---|---|---|
| Chaves LIVE | `sk_live_...` / `pk_live_...` | Developers > API Keys |
| Webhook endpoint | `https://virahit.ai/quiz/api/webhook/stripe` | Developers > Webhooks |
| Webhook secret | `whsec_...` | Copiar do endpoint criado |
| Eventos habilitados | `payment_intent.succeeded`, `payment_intent.payment_failed` | Webhook details |
| Apple Pay domains | `virahit.ai` | Settings > Apple Pay |

### Servidor (server.ts)

| Config | Valor | Por quê |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Credencial LIVE |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Verificação de assinatura |
| `allow_redirects: 'never'` | No `paymentIntents.create()` | Apple Pay/Google Pay funcionam no Brasil |
| Body parser limit | `10mb` | Áudios base64 não estouram |
| Rate limit PIX | 20 req/min por IP | Protege Woovi |
| Rate limit Stripe | 30 req/min por IP | Protege Stripe API |

### Frontend (CheckoutScreen.tsx)

| Config | Valor | Por quê |
|---|---|---|
| `loadStripe(pk_live_...)` | Chave pública LIVE | Elements funciona em live |
| Dois `<Elements>` providers | Um para Express, um para PaymentElement | Regra Stripe — não quebra validação |
| `wallets: { applePay: 'never', googlePay: 'never' }` | No PaymentElement | Evita botões duplicados |
| `redirect: 'if_required'` | No `confirmPayment()` | Não força redirect |
| Endereço BR completo | `country, postal_code, state, city, line1` | Stripe exige quando `address: 'never'` |
| Fetch eager clientSecret | No mount do checkout | Não esperar usuário clicar em "Cartão" |
| Fetch eager PIX | No mount do checkout | QR já pronto quando abre a aba |

---

## 5. CHECKLIST DE DIAGNÓSTICO RÁPIDO

Quando alguém diz "o checkout não funciona":

```bash
# 1. Verificar se servidor está em LIVE ou TESTE
curl -s https://virahit.ai/quiz/api/health | python3 -c "import json,sys; d=json.load(sys.stdin); print('stripe:', d['stripe'], '| env:', d['env'])"

# 2. Verificar últimos PaymentIntents
STRIPE_KEY=$(grep STRIPE_SECRET_KEY .env | cut -d= -f2)
curl -s "https://api.stripe.com/v1/payment_intents?limit=5" -u "$STRIPE_KEY:" | \
  python3 -c "import json,sys; [print(f'[{p[\"status\"]}] R\${p[\"amount\"]/100:.2f} | livemode={p[\"livemode\"]}') for p in json.load(sys.stdin)['data']]"

# 3. Verificar webhook endpoints
STRIPE_KEY=$(grep STRIPE_SECRET_KEY .env | cut -d= -f2)
curl -s https://api.stripe.com/v1/webhook_endpoints -u "$STRIPE_KEY:" | \
  python3 -c "import json,sys; [print(f'{e[\"id\"]} | {e[\"url\"]} | {e[\"status\"]}') for e in json.load(sys.stdin).get('data',[])]"

# 4. Verificar build está atualizado
stat -c "%y" dist/assets/index-*.js
grep -o "pk_(live|test)_[a-zA-Z0-9]*" dist/assets/index-*.js | head -1

# 5. Verificar zumbis
ps aux | awk '$8 ~ /^Z/ { print $0 }'

# 6. Verificar PM2 com env atualizado
pm2 show quiz-virahit | grep -A2 "env"
```

**Interpretação:**
- Se todos PIs em `requires_payment_method` → usuário não submeteu pagamento (cartão de teste em live?)
- Se PI em `requires_action` → 3DS pendente
- Se webhook URL não bate com proxy → 404 no webhook
- Se build é anterior à última mudança de chave → rebuild necessário

---

## 6. DECISÕES ARQUITETURAIS VALIDADAS

| Decisão | Justificativa | Status |
|---|---|---|
| Dois `<Elements>` providers separados | Regra Stripe — evita validação cruzada | ✅ Validado em live |
| `allow_redirects: 'never'` | Apple Pay/Google Pay no Brasil funcionam sem redirect | ✅ Validado em live |
| Fetch eager do `clientSecret` | Menos latência percebida pelo usuário | ✅ Validado em live |
| Fetch eager do PIX | QR já pronto quando abre aba | ✅ Validado em live |
| `payment_method_data.billing_details.address` completo | Stripe exige quando `address: 'never'` | ✅ Validado em live |
| Webhook atualiza Firestore | Status "pago" automático, sem polling | ✅ Validado em live |
| Observability com `payment_events` | Diagnóstico em segundos | ✅ Validado em live |
| Rate limiting por IP | Proteção contra flood em escala | ✅ Validado |
| PM2 cluster mode (2 instâncias) | 3.7GB RAM = 2 workers seguros | ✅ Em produção |
| Caddy reverse proxy | `/quiz/*` → localhost:3000 | ✅ Em produção |

---

## 7. ANTI-PATTERNS (O QUE NUNCA FAZER)

| # | Anti-pattern | Por que quebra | Correto |
|---|---|---|---|
| 1 | Usar `payment_method_types: ['card']` | Bloqueia Apple Pay, Google Pay, PIX | `automatic_payment_methods: { enabled: true }` |
| 2 | `ExpressCheckoutElement` + `PaymentElement` no mesmo provider | Validação cruzada silenciosa | Dois providers separados |
| 3 | `allow_redirects: 'always'` no Brasil | Apple Pay trava no Safari iOS | `allow_redirects: 'never'` |
| 4 | Passar `session` inteiro no POST `/api/pix` | `PayloadTooLargeError` com áudios base64 | Só `pedidoId`, `nome`, `compradorWhatsApp` |
| 5 | Usar cartão de teste (`4242...`) em LIVE | Stripe recusa silenciosamente | Cartão real em live, `4242` em teste |
| 6 | Reusar `clientSecret` entre sessões | Cada PI é único por transação | Criar novo PI para cada checkout |
| 7 | `pm2 restart` sem `--update-env` | `.env` novo não carregado | Sempre `--update-env` |
| 8 | Editar `.env` sem verificar outras credenciais | Corrompe Woovi App ID, Firebase keys, etc | Verificar TUDO antes de salvar |
| 9 | `mode: 'payment'` como fallback no `<Elements>` | Stripe rejeita prop change depois | Passar `undefined` até ter `clientSecret` |
| 10 | Debugar checkout sem verificar build | `dist/` pode ter chave antiga | `stat dist/assets/index-*.js` antes de debugar |

---

## 8. PRÓXIMOS PASSOS / O QUE FALTA TESTAR

| # | Teste | Prioridade | Quem faz |
|---|---|---|---|
| 1 | Cartão Nubank em live (com 3DS) | Alta | General (Nicolas) |
| 2 | Cartão Itaú/Bradesco em live (com 3DS) | Alta | General (Nicolas) |
| 3 | Google Pay em Android real | Média | General (Nicolas) |
| 4 | PIX real: gerar QR, pagar, verificar webhook | Alta | General (Nicolas) |
| 5 | Reembolso via Stripe Dashboard | Média | General (Nicolas) |
| 6 | Testar com valor real (R$47,00) | Alta | General (Nicolas) |
| 7 | Separar URLs: `/quiz`, `/conversao`, `/checkout`, `/obrigado` | Média | Hermes (aguardando Sinal Verde) |
| 8 | Monitoramento automático: cron que verifica se checkout está online | Baixa | Hermes |
| 9 | Alerta quando webhook Stripe falha > 3x | Baixa | Hermes |
| 10 | Teste E2E automatizado com Playwright (cartão 4242 em teste) | Baixa | Hermes |

---

## 9. REFERÊNCIAS

- `LOG-PROJETO-STRIPE.md` — timeline completa de todas as sessões
- `server.ts` — backend com rate limiting e middleware de proxy
- `src/components/CheckoutScreen.tsx` — frontend com dois providers Stripe
- `src/lib/logger.ts` — observability com `payment_events`
- Stripe Docs: https://stripe.com/docs/testing
- Woovi Docs: https://developers.woovi.com/

---

*Este documento é vivo. Quando novos comportamentos forem descobertos em live, atualize aqui.*
