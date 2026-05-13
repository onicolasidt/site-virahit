# Site ViraHit

Monorepo do site virahit.ai — estrutura limpa, so o que esta em producao.

## Estrutura

```
apps/
  landing/      → Home page (virahit.ai/) — Vite + React Router 7
    src/
      pages/    → MeuLouvor.tsx (Home), TermosDeUso.tsx, Privacidade.tsx
      components/ → NavMeulouvor, FooterMeulouvor, WhatsAppTestimonial, etc.
      App.tsx, main.tsx, index.css
    public/     → Assets estaticos (logos, audio depoimento, fotos)
  
  quiz/         → Quiz + Checkout (virahit.ai/quiz) — Vite + React + Stripe/Firebase
    src/
      components/ → Quiz.tsx, ConversionScreen.tsx, CheckoutScreen.tsx
      lib/        → Firebase, Logger, AudioExemplos
    server.ts   → Express server (PIX, webhook, health check)

docs/           → Documentacao do projeto
```

## Deploy

- **Landing**: Vercel (build Vite, SPA)
- **Quiz**: VPS PM2 (Express server serve build estatico)

## Desenvolvimento

```bash
# Landing
cd apps/landing && npm install && npm run dev

# Quiz
cd apps/quiz && npm install && npm run dev
```
