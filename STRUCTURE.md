# Site Structure — SITE-VIRAHIT

## Repo: /home/hermes_general/empresa/site-virahit/

### apps/landing/ → Home page do site (virahit.ai/)
- **Página principal**: `src/pages/Home.tsx` (antes MeuLouvor.tsx)
- **Header**: `src/components/Header.tsx`
- **Footer**: `src/components/Footer.tsx`
- **Build**: `npm run build` → `dist/` → Vercel deploy

### apps/quiz/ → Quiz + Checkout (virahit.ai/quiz)
- **Quiz**: `src/components/Quiz.tsx`
- **Server**: `server.ts` → PM2 no VPS

### docs/ → Documentação do projeto

## Regra de Ouro
SITIO OFICIAL = ~/empresa/site-virahit/
BACKUP DA VPS = ~/ViraHit.ai-v1/ (so ler, nunca editar)
NUNCA usar virahit-funil/ (abandonado) ou quiz-virahit-v2/ (redundante)
