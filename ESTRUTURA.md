# ViraHit — Estrutura Web

> **Regra de ouro:** tudo que é web vive aqui. Um repo. Uma estrutura. Zero duplicidade.

---

## Repositório

**GitHub:** `onicolasidt/site-virahit`
**Local na VPS:** `~/empresa/site-virahit/`

---

## Apps

```
site-virahit/
  apps/
    landing/     → virahit.ai/           Landing page principal
    quiz/        → virahit.ai/quiz        Quiz + Checkout + PIX + Stripe
    obra/        → virahit.ai/obra        Entrega de músicas (template HTML)
    obra-api/    → API da obra            Backend Python de entrega
```

---

## Como cada app é deployada

| App | Como editar | Como deployar | Quem serve ao usuário |
|---|---|---|---|
| `landing` | Editar `apps/landing/src/` | `git push` → Vercel automático | Caddy → Vercel CDN |
| `quiz` | Editar `apps/quiz/src/` | `npm run build` + `pm2 restart` | Caddy → PM2 porta 3000 |
| `obra` | Editar `apps/obra/` | Copiar HTML para VPS | Caddy → PM2 porta 8080 |

---

## Fluxo de trabalho (para qualquer dev)

### Alterar a landing page
```bash
cd ~/empresa/site-virahit/apps/landing
# Editar arquivos em src/
git add -A && git commit -m "feat(landing): o que foi feito — por que"
git push origin main
# Vercel detecta o push e deploya automaticamente
```

### Alterar o quiz ou checkout
```bash
cd ~/empresa/site-virahit/apps/quiz
# Editar arquivos em src/components/ ou server.ts
npm run build
pm2 restart quiz-virahit --update-env
# Verificar
curl -s http://localhost:3000/api/health
# Commitar
git add -A && git commit -m "fix(quiz): o que foi feito — por que"
git push origin main
```

---

## Regras absolutas

1. **Editar SEMPRE em `~/empresa/site-virahit/`** — nunca em outra pasta
2. **Commitar ANTES de encerrar a sessão** — `git status` sempre limpo ao sair
3. **Nunca criar outro repo para coisa web** — tudo fica aqui
4. **Mensagem de commit descritiva** — `tipo(escopo): o que foi feito — por que foi feito`

---

## O que NÃO existe mais (arquivado/deletado)

| Repo/Pasta | Status | Motivo |
|---|---|---|
| `~/empresa/funil-web/quiz-virahit-v2/` | Mantido como backup temporário | Foi o runtime até 15/05/2026 |
| `GitHub: onicolasidt/-quiz-virahit-v2` | Arquivado (read-only) | Substituído por apps/quiz/ |
| `~/empresa/funil-web/virahit-funil/` | Deletado localmente | Next.js morto, sem remote |

---

## Caddyfile (como o tráfego chega)

```
virahit.ai/quiz*   →  PM2 porta 3000  (apps/quiz/)
virahit.ai/obra*   →  PM2 porta 8080  (apps/obra-api/)
virahit.ai/*       →  Vercel CDN      (apps/landing/)
```

Arquivo: `/etc/caddy/Caddyfile`

---

## Contatos de infra

- **PM2:** `pm2 status` / `pm2 logs quiz-virahit`
- **Health check:** `curl https://virahit.ai/api/health`
- **Logs:** `~/empresa/site-virahit/apps/quiz/logs/`
- **Vercel:** projeto `vira-hit-ai-v1` — dashboard em vercel.com
