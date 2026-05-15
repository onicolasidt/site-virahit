# COPY-CHECKOUT-v3.md
# Checkout Page — Copy Specification
# Version: v3
# Date: 2026-05-08

---

## CHANGELOG

### v3 (2026-05-08) — Hormozi Copy Audit + UX Pass
- [COPY-01] Order summary headline: added "especial" + "esta quase pronta."
- [COPY-02] Order summary detail line: added "— so falta pagar" at end
- [COPY-03] Guarantee text: specificity + loss aversion rewrite
- [COPY-04] Payment label: "COMO VOCE QUER PAGAR?" → "FINALIZE SEU PEDIDO"
- [COPY-05] Card price anchor: vista price first, installment second
- [COPY-06] Card CTA: outcome-oriented ("Garantir minha musica")
- [COPY-07] Urgency line: delivery date + recipient benefit
- [COPY-08] WhatsApp trust: approachability frame
- [COPY-09] PIX expired: reassurance first, then action
- [COPY-10] Payment confirmed overlay: personalized with gender token
- [COPY-11] Footer tagline: emotional story angle
- [UX-01–13] Full UX/UI spec updated (see component brief)

### v2 (prior) — baseline spec

---

## PAGE STRUCTURE

### HEADER
- Logo centered
- Right side: lock icon + "Pagamento seguro" (teal, 13px)
- No back arrow. No X button.

---

### BLOCK 1 — ORDER SUMMARY

Headline:
  "Sua musica especial para [A_O] [NOME] esta quase pronta."

Detail line:
  "[estiloMusical] • Voz [vozMusical] — so falta pagar"

---

### BLOCK 2 — GUARANTEE BOX (before QR code)

Icon: ShieldCheck (lucide), teal, 24px
Headline: "Garantia de 7 Dias"
Body:
  "Garantia total de 7 dias: se a musica nao emocionar, a gente devolve cada centavo. Sem burocracia."

Style: white bg, teal border 1.5px, border-radius 12px

---

### BLOCK 3 — PAYMENT

Section label: "FINALIZE SEU PEDIDO"

Tab selector:
  - PIX (default active)
  - Cartao de Credito

#### PIX TAB (active by default)

Instruction: "Escaneie o QR Code ou copie o codigo abaixo"

Copy button default: "Copiar codigo PIX"
Copy button after click (2s): "Copiado! ✓" (green bg)

QR Code: 200x200, white padded container, rounded, shadow

Price: "R$ 47,00"

Timer:
  - Default: teal pill, monospace, "Este codigo expira em MM:SS"
  - Warning (≤180s): red pill, animate-pulse

#### PIX EXPIRED STATE

Icon: Clock (lucide), teal, 32px
Text: "O codigo expirou, mas seu pedido esta guardado. Gere um novo em segundos:"
CTA: "Gerar novo codigo PIX" (teal, h-14, pill)

#### CARD TAB

Price anchor: "R$ 47,00 a vista  —  ou em 2x de R$ 23,50 sem juros"

Stripe Elements (PaymentElement)

CTA default: "Garantir minha musica por R$ 47,00 →"
CTA loading: "Processando..." (spinner, disabled)

Error messages (humanized PT-BR):
  card_declined      → "Cartao recusado. Tente outro cartao ou use PIX."
  insufficient_funds → "Saldo insuficiente. Tente outro cartao ou use PIX."
  incorrect_cvc      → "Codigo de seguranca incorreto. Verifique o CVV."
  expired_card       → "Cartao vencido. Use um cartao com validade vigente."
  default            → "Erro ao processar. Tente novamente ou use PIX."

---

### BLOCK 4 — URGENCY

Icon: Truck (lucide), green
Text: "Sua musica chega no WhatsApp ate [dataEntregaGarantida] — tempo de sobra para presentear [A_O] [NOME]."
Style: green pill container

---

### BLOCK 5 — TRUST SIGNALS

Row 1: PIX + Visa + Mastercard + lock icons (min h-8 each)
Row 2: "Pagamento 100% seguro e criptografado"
Row 3: WhatsApp icon + "Monica esta no WhatsApp se voce precisar de algo."

---

### PAYMENT CONFIRMED OVERLAY

Full-screen, centered, fade-in animation
Animated checkmark (scale + opacity)

Headline: "Pagamento confirmado! A musica [DA_DO] [NOME] esta sendo criada agora."
Sub-text: "Redirecionando em instantes..."
Auto-redirect: /pos-pagamento after 1.5s
Fallback button (after 3s): "Ir para a proxima etapa →" (teal, h-14, pill)

---

### FOOTER

Text: "Cada musica conta uma historia unica — a historia deles."

---

## POLLING SPEC

Endpoint: GET /api/pagamento/status?pedidoId=[idPedido]
Interval: 3s
On 'pago': overlay + redirect /pos-pagamento 1.5s + stop poll
On 'expirado': PIX expired state + stop poll
On 'pendente': continue
Cleanup: stop on unmount

---

## SESSION STORAGE KEYS

nome, generoDestinatario (F|M), estiloMusical, vozMusical,
compradorNome, compradorWhatsApp, idPedido,
pixQRCodeUrl, pixCopiaCola, dataEntregaGarantida

Gender tokens:
  [A_O]   = generoDestinatario === 'F' ? 'a' : 'o'
  [DA_DO] = generoDestinatario === 'F' ? 'da' : 'do'

---

## DESIGN SYSTEM

Background: #F4EEDC  |  Primary (teal): #2C5D63
CTA (gold): #EAA115  |  Error: #dc2626  |  Success: #16a34a
Heading: Open Sans 800 uppercase  |  Body: Merriweather
CTA border-radius: pill (9999px)  |  Boxes: 8–16px
