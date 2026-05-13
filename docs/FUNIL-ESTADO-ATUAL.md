# Funil ViraHit — Estado Atual

## Arquitetura do Site (virahit.ai)

```
virahit.ai/          → Landing page (MeuLouvor.tsx)
virahit.ai/quiz      → Quiz interativo (Quiz → ConversionScreen → CheckoutScreen)
virahit.ai/termos    → Termos de Uso
virahit.ai/privacidade → Privacidade
```

## Funnel Flow

1. **Home** (`/`): Landing page com Hero, Como Funciona, Depoimentos, Garantia, FAQ, CTA
2. **CTA da Home**: Botao "Criar Minha Música" → redireciona para `/quiz`
3. **Quiz** (`/quiz`): 5 passos (Destinatario → Nome → Estilo/Voz → Historia → Plano)
4. **Conversion Screen**: Resumo do pedido + CTA para pagamento
5. **Checkout**: Stripe (cartao) + PIX (Woovi) + webhook → confirmacao via WhatsApp

## Stack

| Componente | Tecnologia | Deploy |
|---|---|---|
| Landing Page | Vite + React Router 7 + Tailwind 4 | Vercel |
| Quiz App | Vite + React + Stripe Firebase | VPS (PM2 + Express) |
| API | Express server.ts | VPS PM2 |
| Pagamento | Stripe + Woovi (PIX) | Stripe API + Woovi API |

## Design System

| Token | Valor |
|---|---|
| Background (cream) | `#F4EEDC` |
| Texto principal (teal) | `#2C5D63` |
| CTA (gold) | `#EAA115` |
| Teal-light | `#3D7A81` |
| Font headings | Open Sans 800 (heading-font) |
| Font body | Merriweather |
| Efeitos | `.asymmetric-border`, `.editorial-shadow`, `.gold-glow` |

## Preco

- **Valor**: R$97
- **Garantia**: 7 dias — "Se não arrepiar, devolvemos 100%"

## URLs Importantes

- Dominio: `https://virahit.ai`
- Quiz: `https://virahit.ai/quiz`
- Checkout (Stripe): via Link de Pagamento
- Suporte: `https://wa.me/5511926681180`
