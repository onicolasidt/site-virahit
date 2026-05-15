# COPY-POS-PAGAMENTO-v2.md
# Post-Payment Page — Copy Specification

Version: 2.0
Audit: Hormozi copy review applied
Date: 2026-05-08

---

## Changelog v1 -> v2

- [CHANGED] Block 1 title: "Pedido confirmado!" -> dynamic "Pronto! A música [DA_DO] [NOME] está sendo criada agora."
- [REMOVED] Block 1 main message (fused into title per audit)
- [CHANGED] Block 1 sub-message: uses compradorWhatsApp token instead of generic phrasing
- [CHANGED] Block 2 item 1: immediate-action framing ("Estamos lendo agora.")
- [CHANGED] Block 2 item 2: active voice ("cria" / "manda")
- [CHANGED] Block 2 item 4: Monica extended to convey accompaniment
- [CHANGED] Upsell headline: curiosity/problem-first angle
- [CHANGED] Upsell sub-copy: benefit-led with friction-reducer ("sem repetir o quiz")
- [CHANGED] Upsell CTA: desire-confirming ("Sim, quero...")
- [CHANGED] Upsell decline: personalised with [DA_DO] [NOME]
- [CHANGED] Upsell timer label: ownership/exclusivity framing
- [CHANGED] Share copy: social proof / gifting angle
- [CHANGED] Share CTA: "Mandar para uma amiga"
- [CHANGED] Monica block: relational framing
- [CHANGED] Footer: story-centric tagline

---

## Design System Reference

Background : #F4EEDC (cream)
Primary    : #2C5D63 (teal)
CTA        : #EAA115 (gold)
Headings   : Open Sans 800, uppercase
Body       : Merriweather
Border-radius: pill for CTAs; 8-16px for boxes

---

## Dynamic Tokens (via sessionStorage)

| Token               | Key                   | Description                     |
|---------------------|-----------------------|---------------------------------|
| [NOME]              | nome                  | Recipient first name            |
| [DA_DO]             | generoDestinatario    | 'da' (F) or 'do' (M)           |
| [A_O]               | generoDestinatario    | 'a' (F) or 'o' (M)            |
| [compradorWhatsApp] | compradorWhatsApp     | Buyer WhatsApp number           |
| [compradorNome]     | compradorNome         | Buyer first name                |
| [compradorEmail]    | compradorEmail        | Buyer email                     |
| [estiloMusical]     | estiloMusical         | Musical style chosen            |
| [vozMusical]        | vozMusical            | Voice style chosen              |
| [idPedido]          | idPedido              | Order ID                        |
| [valorPago]         | valorPago             | Amount paid e.g. "R$ 47,00"    |

---

## Block 1 — Confirmação

Visual:
  Animated check (green #25D366, 64px) inside a green-tinted circle (112px).
  Spring scale-in animation on mount (scale-0 -> scale-100, cubic-bezier spring).

Title (H1):
  "Pronto! A música [DA_DO] [NOME] está sendo criada agora."

Sub-message:
  "Você recebe no WhatsApp [compradorWhatsApp] em até 24h."

Notes:
  - v1 main message is REMOVED. Title alone carries confirmation.
  - [DA_DO] = 'da' if generoDestinatario === 'F', else 'do'
  - [NOME] rendered verbatim from sessionStorage key 'nome'
  - [compradorWhatsApp] rendered verbatim from sessionStorage

---

## Block 2 — O que acontece agora

Section title (H2):
  "O que acontece agora"

Numbered list (teal circles 28px, body text 15px minimum):

  1. "Sua história já chegou pra gente. Estamos lendo agora."
  2. "Nossa equipe cria a música [DA_DO] [NOME] e manda pra você em até 24h."
  3. "Você recebe o arquivo de áudio pronto para compartilhar."
  4. "A Monica acompanha seu pedido e está no WhatsApp se precisar de qualquer coisa."

---

## Block 3 — Upsell Box

Visual:
  Gold border (2px, #EAA115), rounded-2xl.
  Timer: full-width banner at TOP of the box.
  Timer turns red + animate-pulse when <= 60 seconds.
  On expiry or decline: CSS transition to opacity-0 + max-h-0 (NOT DOM removal).

Timer banner text:
  "Esse preço especial de R$ 37 é exclusivo para quem acabou de pedir. Some em [MM:SS]."

Headline (H3):
  "Tem mais alguém que merece uma música só dela?"

Sub-copy:
  "Você pode criar uma segunda música agora, com outros detalhes, por R$ 37.
  Sem repetir o quiz do zero — só ajustar o que for diferente."

CTA button (gold, pill, h-14, full-width):
  "Sim, quero criar a segunda música por R$ 37 →"

Decline link (min-h-[44px], mt-1, centered below CTA):
  "Não agora, só quero a música [DA_DO] [NOME]."

CTA behaviour:
  sessionStorage.setItem('upsellActive', 'true')
  sessionStorage.setItem('upsellPreco', '37')
  router.push('/quiz?upsell=true')

Decline behaviour:
  CSS fade: opacity-0 + max-h-0 transition over 700ms

Expiry behaviour:
  Same CSS fade as decline

States:
  VISIBLE  : normal display (max-h-[600px] opacity-100)
  FADING   : transition active (max-h-0 opacity-0)
  GONE     : after transition ends (still in DOM, invisible)

---

## Block 4 — Resumo do Pedido

Section title (H2):
  "Resumo do pedido"

Two-column table:
  Layout: table-fixed w-full
  Col 1: 60% width (label)
  Col 2: 40% width (value)
  Cell padding: minimum 12px (p-3)
  Alternating row highlight: bg-[#2C5D63]/5

Rows:
  Pedido         | [idPedido]
  Presente pra   | [NOME]
  Estilo         | [estiloMusical]
  Voz            | [vozMusical]
  Valor pago     | [valorPago]

---

## Block 5 — Compartilhar

Copy:
  "Conta pra uma amiga — as melhores ideias de presente merecem ser divididas."

CTA (pill, border-2 border-[#25D366], WhatsApp icon, min-h-[44px]):
  "Mandar para uma amiga →"

WhatsApp URL (opens new tab):
  https://wa.me/?text=Acabei%20de%20criar%20uma%20musica%20personalizada%20de%20presente%20%E2%80%94%20ficou%20incrivel!%20Da%20uma%20olhada%3A%20[LANDING_URL_ENCODED]

Note: LANDING_URL_ENCODED = encodeURIComponent(LANDING_URL constant)

---

## Block 6 — Monica

Copy:
  "A Monica acompanha cada pedido de perto. Fala com ela quando quiser →"

Button (full-width, h-14, border-2 teal, WhatsApp icon):
  "Falar com a Monica →"

URL (opens new tab):
  https://wa.me/[MONICA_NUMBER]?text=Oi%20Monica!%20Quero%20tirar%20uma%20d%C3%BAvida%20sobre%20meu%20pedido%20[idPedido]

Note: MONICA_NUMBER is a compile-time constant MONICA_WHATSAPP_NUMBER in component file.

---

## Footer

Text:
  "Cada música conta uma história única — a história deles."

---

## States Summary

| State           | Trigger                   | Effect                                    |
|-----------------|---------------------------|-------------------------------------------|
| Normal          | On mount, idPedido present| All blocks visible                        |
| Upsell declined | Decline click             | Upsell: opacity-0 + max-h-0, 700ms trans. |
| Upsell expired  | Timer hits 00:00          | Same CSS transition                       |

---

## Redirect Guard

If sessionStorage key 'idPedido' is absent or empty on mount:
  router.replace('/')
