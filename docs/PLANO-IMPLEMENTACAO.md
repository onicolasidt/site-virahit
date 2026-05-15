# Plano de Implementacao — Funil ViraHit
# Para Hermes: usar subagent-driven-development para executar task a task.
# Design System: /home/hermes_general/empresa/operacao/design/VIRAHIT-DESIGN-SYSTEM.md
# PRD completo: /home/hermes_general/empresa/funil-web/PRD.md
# Wireframes: /home/hermes_general/empresa/funil-web/wireframes-funil.md

**Goal:** Converter visitante em pagador em menos de 5 minutos via funil de 4 telas.

**Stack:** Next.js 14 App Router + Tailwind CSS v4 + shadcn/ui + Vercel + WOOVI (PIX) + Baserow

**Telas:**
  1. Landing Page (/)
  2. Quiz (/quiz — 5 passos)
  3. Checkout (/checkout)
  4. Pos-pagamento (/obrigado)

**Prioridade:** Design System primeiro. Sem ele, as Tasks 2-7 produzem lixo visual.

---

## REGRA CRITICA DE DESIGN

Todo agente que codificar qualquer tela DEVE:
1. Carregar skill virahit-design-system ANTES de escrever uma linha de CSS
2. Verificar o checklist de 11 itens do design system antes de entregar
3. Aplicar classe .v2-theme no elemento root da pagina
4. Nao inventar cores, fontes ou espacamentos — so o que esta no design system

---

## TASK 1 — Setup do Projeto Next.js 14

**Objetivo:** Criar o projeto base com toda a stack aprovada instalada e rodando.

**Arquivos a criar:**
  - ~/empresa/funil-web/virahit-funil/ (pasta raiz do projeto)
  - ~/empresa/funil-web/virahit-funil/tailwind.config.ts
  - ~/empresa/funil-web/virahit-funil/.env.local
  - ~/empresa/funil-web/virahit-funil/.env.example

**Passo 1:** Criar projeto Next.js
```bash
cd ~/empresa/funil-web
npx create-next-app@14 virahit-funil \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack
```

**Passo 2:** Instalar dependencias
```bash
cd virahit-funil
npm install @woovi/sdk
npm install @radix-ui/react-progress @radix-ui/react-toggle
npx shadcn@latest init
npx shadcn@latest add button card input progress badge
```

**Passo 3:** Configurar Tailwind com tokens ViraHit
Editar tailwind.config.ts para adicionar:
- Fontes: Inter, Merriweather, Open Sans (as 3 usadas no v2-theme)
- Cores customizadas: cream, teal, gold, teal-light

tailwind.config.ts:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F4EEDC",
        teal: {
          DEFAULT: "#2C5D63",
          light: "#3D7A81",
        },
        gold: {
          DEFAULT: "#EAA115",
          hover: "#C99A3C",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        heading: ['"Open Sans"', "sans-serif"],
        serif: ["Merriweather", "Georgia", "serif"],
      },
      borderRadius: {
        asymmetric: "2px 40px 4px 60px",
      },
      boxShadow: {
        editorial: "20px 20px rgba(44, 93, 99, 0.05)",
      },
      keyframes: {
        blob: {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
        },
      },
      animation: {
        blob: "blob 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
```

**Passo 4:** Criar globals.css com o v2-theme
Arquivo: src/app/globals.css
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Merriweather:wght@400;700;900&family=Open+Sans:wght@700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  .v2-theme {
    --cream: #F4EEDC;
    --teal: #2C5D63;
    --gold: #EAA115;
    --teal-light: #3D7A81;
    background-color: var(--cream);
    color: var(--teal);
    font-family: Merriweather, serif;
  }
  .v2-theme h1,
  .v2-theme h2,
  .v2-theme h3,
  .v2-theme .heading-font {
    font-family: "Open Sans", sans-serif;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: -0.02em;
  }
}

@layer utilities {
  .asymmetric-border { border-radius: 2px 40px 4px 60px; }
  .editorial-shadow { box-shadow: 20px 20px rgba(44, 93, 99, 0.05); }
  .gold-glow { filter: drop-shadow(0 0 15px rgba(234, 161, 21, 0.4)); }
  .ornament-line {
    background: linear-gradient(90deg, transparent, #2C5D63, transparent);
    width: 100%;
    height: 1px;
    margin: 2rem 0;
  }
}
```

**Passo 5:** Criar .env.example
```
WOOVI_APP_ID=
WOOVI_TOKEN=
WOOVI_WEBHOOK_SECRET=
BASEROW_TOKEN=cWMKvF1vPQUFlKZsFV3F1raIQ8s1bWrj
BASEROW_TABLE_ID=901528
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Passo 6:** Criar layout.tsx root com v2-theme
Arquivo: src/app/layout.tsx
```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="v2-theme min-h-screen">
        {children}
      </body>
    </html>
  );
}
```

**Passo 7:** Verificar
```bash
npm run build
# Esperado: build sem erros
npm run dev
# Esperado: http://localhost:3000 retorna pagina em cream (#F4EEDC)
```

**Criterio de aceite:** `npm run build` sem erros. Pagina em localhost:3000 com fundo cream.

---

## TASK 2 — Estrutura de Pastas e Tipos

**Objetivo:** Criar a arquitetura de pastas, tipos TypeScript e lib de utilidades.

**Arquivos a criar:**
  - src/app/quiz/page.tsx (stub)
  - src/app/checkout/page.tsx (stub)
  - src/app/obrigado/page.tsx (stub)
  - src/app/api/checkout/criar-pix/route.ts (stub)
  - src/app/api/checkout/status/route.ts (stub)
  - src/app/api/webhooks/woovi/route.ts (stub)
  - src/lib/types.ts
  - src/lib/baserow.ts
  - src/lib/constants.ts
  - src/components/ui/ (shadcn ja cria)
  - src/components/landing/ (vazio)
  - src/components/quiz/ (vazio)
  - src/components/checkout/ (vazio)

**src/lib/types.ts:**
```typescript
export type Ocasiao = 
  | "mae" | "pai" | "filho" | "parceiro" 
  | "amigo" | "neto" | "irmao" | "especial";

export type EstiloMusical = 
  | "sertanejo" | "pop_romantico" | "gospel" | "forro" | "mpb";

export type TipoVoz = "masculina" | "feminina";

export type Plano = "base" | "mais_escolhido" | "premium";

export interface DadosQuiz {
  ocasiao: Ocasiao | null;
  nomeHomenageado: string;
  estilo: EstiloMusical | null;
  voz: TipoVoz | null;
  historia: string;
  plano: Plano | null;
  valor: number | null;
}

export interface DadosComprador {
  nome: string;
  email: string;
  telefone: string;
  orderBump: boolean;
}

export interface PedidoCompleto extends DadosQuiz, DadosComprador {
  correlationId: string;
  status: "aguardando" | "confirmado" | "producao" | "entregue";
  dataPedido: string;
}

export const PLANOS = {
  base: { nome: "Base", valor: 47, descricao: "1 musica, entrega em 24h, 1 estilo" },
  mais_escolhido: { nome: "Mais Escolhido", valor: 67, descricao: "1 musica, entrega em 24h, 2 versoes de estilo" },
  premium: { nome: "Premium", valor: 77, descricao: "1 musica, entrega em 12h, 3 versoes + letra digital" },
} as const;

export const MICRO_PROVAS: Record<Ocasiao, string> = {
  mae: "Mais de 800 maes ja receberam uma musica assim.",
  pai: "Mais de 400 pais ja receberam uma homenagem em musica.",
  filho: "Mais de 600 filhos ja ganharam uma musica especial.",
  parceiro: "Mais de 900 casais ja eternizaram sua historia em musica.",
  amigo: "Mais de 300 amizades ja foram homenageadas assim.",
  neto: "Mais de 200 netos ja receberam uma surpresa musical.",
  irmao: "Mais de 150 irmaos ja ganharam essa homenagem.",
  especial: "Mais de 1.200 pessoas especiais ja foram homenageadas.",
};
```

**Criterio de aceite:** `npx tsc --noEmit` sem erros de tipos.

---

## TASK 3 — Landing Page: Hero + Carrossel de Ocasioes

**Objetivo:** Implementar o above-the-fold da landing page — a primeira impressao do usuario.

**Arquivos:**
  - src/app/page.tsx
  - src/components/landing/HeroSection.tsx
  - src/components/landing/OcasiaoCarousel.tsx

**Regra de design (OBRIGATORIO antes de codificar):**
  Carregar: skill virahit-design-system
  Verificar: checklist do design system antes de entregar

**HeroSection — spec visual:**
  - Fundo: cream (#F4EEDC)
  - Quote (depoimento): Merriweather italic, 18-20px, teal
  - Atribuicao: Open Sans, 14px, teal/70
  - CTA: bg-gold rounded-full w-full h-14 text-white font-heading font-semibold text-lg
  - Social proof: estrelas gold + Open Sans, 14px

**OcasiaoCarousel — spec visual:**
  - Grid 2x4 no mobile, row de 8 no desktop
  - Card: bg-cream border-teal/10 rounded-xl
  - Selected: border-gold bg-gold/10
  - Emoji: 28px
  - Label: Open Sans 700, 14px, uppercase, teal
  - Clique navega para /quiz?ocasiao=<slug>

**Criterio de aceite:**
  1. CTA visivel sem scroll em 375px
  2. Carrossel tem 8 cards funcionais com emoji correto
  3. Clique em ocasiao navega para /quiz?ocasiao=<slug>
  4. Fundo cream, headings uppercase, CTA gold

---

## TASK 4 — Landing Page: Videos, Players, Garantia, CTA Final

**Objetivo:** Completar a landing com secoes de prova social, audio e fechamento.

**Arquivos:**
  - src/components/landing/VideoReacaoSection.tsx
  - src/components/landing/AudioPlayer.tsx
  - src/components/landing/GuaranteeBox.tsx
  - src/components/landing/UrgencyBanner.tsx

**AudioPlayer — spec:**
  - Lazy load (IntersectionObserver — nao carrega audio fora da viewport)
  - Card cream, border teal/10, border-radius 2xl
  - Botao play: circle gold bg, icone branco
  - Progress bar: teal/20 fundo + gold fill
  - Arquivos de audio: /public/audio/exemplo-*.mp3

**VideoReacaoSection — spec:**
  - Lazy load via IntersectionObserver
  - Mobile: coluna unica
  - Desktop: 3 colunas
  - Thumbnail com overlay play button gold
  - Videos locais: /public/video/reacao-*.mp4

**Criterio de aceite:**
  1. Lighthouse Performance >= 80 mobile (verificar com: npx lighthouse http://localhost:3000 --view)
  2. Players funcionam em Chrome, Safari, Firefox
  3. Videos carregam lazy (sem bloquear first paint)
  4. GuaranteeBox visivel dentro das primeiras 3 dobras

---

## TASK 5 — Quiz: Passos 1 a 4

**Objetivo:** Implementar os 4 primeiros passos do quiz com navegacao, persistencia e micro-provas.

**Arquivos:**
  - src/app/quiz/page.tsx
  - src/components/quiz/QuizProgress.tsx
  - src/components/quiz/Passo1Destinatario.tsx
  - src/components/quiz/Passo2Nome.tsx
  - src/components/quiz/Passo3EstiloVoz.tsx
  - src/components/quiz/Passo4Historia.tsx
  - src/hooks/useQuizState.ts

**useQuizState.ts — logica de persistencia:**
```typescript
// Persiste em sessionStorage sob a chave "virahit_quiz"
// Exporta: { dados, setOcasiao, setNome, setEstilo, setVoz, setHistoria, setPlano }
// Auto-save no campo historia via debounce 3000ms
```

**Passo 1 — spec:**
  - 8 cards grid 2x4 (mobile)
  - Selecao avanca automaticamente (sem botao Continuar)
  - Micro-prova exibida abaixo: MICRO_PROVAS[ocasiao]

**Passo 2 — spec:**
  - Input autofocus no mount
  - Botao Continuar desabilitado se nome.length < 2
  - Exibe "Qual e o nome da [ocasiao]?"

**Passo 3 — spec:**
  - 5 cards de estilo com preview de 10s de audio (opcional)
  - 2 cards de voz
  - Selecao de ambos avanca automaticamente

**Passo 4 — spec:**
  - Textarea opcional — CTA NUNCA bloqueia
  - Voice input via Web Speech API (SpeechRecognition)
  - Se browser nao suporta: esconde o botao silenciosamente
  - Auto-save via debounce 3000ms com indicador "Rascunho salvo"
  - Contador de caracteres (0/500)

**QuizProgress — spec:**
  - "Passo X de 5" em Open Sans, 14px
  - Barra de progresso: teal/20 fundo + gold fill
  - Passo 1 = 20%, Passo 2 = 40%, ..., Passo 5 = 100%

**Criterio de aceite:**
  1. Barra reflete passo correto
  2. Botao voltar em passos 2-4 volta sem perder dados
  3. Micro-prova muda conforme selecao do passo 1
  4. Dados sobrevivem a reload da pagina (sessionStorage)
  5. Voice input funciona no Chrome mobile

---

## TASK 6 — Quiz: Passo 5 (Plano) + Transicao para Checkout

**Objetivo:** Implementar selecao de plano com destaque no "Mais Escolhido" e preview final.

**Arquivos:**
  - src/components/quiz/Passo5Plano.tsx
  - src/components/quiz/PreviewDados.tsx

**Passo5Plano — spec:**
  - 3 cards de plano em coluna (mobile) ou row (desktop)
  - Card "Mais Escolhido" tem:
    - border-2 border-gold
    - badge "MAIS POPULAR" no topo (bg-gold text-white rounded-full px-3 py-1 text-xs)
    - escala leve: scale-105
  - PreviewDados exibe: "Sua musica para [Nome], estilo [Estilo], voz [Voz]"
  - Botao "Quero essa musica" ativo so apos selecao de plano
  - Ao clicar: salva plano no sessionStorage e navega para /checkout

**Criterio de aceite:**
  1. Badge "MAIS POPULAR" visivel no card R$67
  2. PreviewDados mostra dados corretos do quiz
  3. Botao desabilitado antes da selecao
  4. Navigate para /checkout com dados no sessionStorage

---

## TASK 7 — Checkout: Formulario + WOOVI + Polling

**Objetivo:** Implementar o formulario de compra com geracao de PIX e polling de confirmacao.

**Arquivos:**
  - src/app/checkout/page.tsx
  - src/components/checkout/ResumoPersonalizado.tsx
  - src/components/checkout/FormularioComprador.tsx
  - src/components/checkout/QRCodePIX.tsx
  - src/components/checkout/OrderBump.tsx
  - src/components/checkout/ModoDiscreto.tsx
  - src/app/api/checkout/criar-pix/route.ts
  - src/app/api/checkout/status/route.ts
  - src/lib/woovi.ts

**src/lib/woovi.ts:**
```typescript
// Wrapper para WOOVI API
// POST /api/v2/charge — criar cobranca
// GET /api/v2/charge/{correlationID} — checar status
// Usa WOOVI_APP_ID e WOOVI_TOKEN do .env
```

**ResumoPersonalizado — spec:**
  - Box teal/5 border teal/10 rounded-2xl p-6
  - Exibe: Nome homenageado, ocasiao, estilo, voz, plano, valor
  - Servico de confirmacao emocional ("Sua musica para [Nome] esta quase pronta!")

**FormularioComprador — spec:**
  - 3 campos: nome, email, telefone (mascara BR)
  - QR Code gerado automaticamente ao preencher email valido
  - Sem botao "gerar PIX" — automatico

**QRCodePIX — spec:**
  - Exibe QR Code (img base64 da WOOVI) + codigo copia-e-cola
  - Timer regressivo de 15min com animacao
  - Spinner "aguardando pagamento" durante polling
  - Polling GET /api/checkout/status?id=<correlationID> a cada 5s
  - Ao confirmar: navigate para /obrigado?pedido=<ID>

**OrderBump — spec:**
  - Posicionado entre formulario e QR Code
  - Checkbox com texto: "Adicionar dedicatoria em video por +R$17"
  - Preco em destaque: +R$17 em gold

**Criterio de aceite:**
  1. QR Code gerado em < 3s apos email valido
  2. Timer conta regressivo de 15:00
  3. Polling a cada 5s sem travar UI
  4. Redirect para /obrigado apos pagamento confirmado
  5. OrderBump com checkbox funcional

---

## TASK 8 — Webhook WOOVI + Salvar Pedido no Baserow

**Objetivo:** Backend confiavel que confirma o pagamento e persiste o pedido.

**Arquivos:**
  - src/app/api/webhooks/woovi/route.ts
  - src/lib/baserow.ts

**src/lib/baserow.ts:**
```typescript
// Wrapper para Baserow REST API
// Funcoes: criarPedido(dados: PedidoCompleto): Promise<void>
// POST https://api.baserow.io/api/database/rows/table/901528/?user_field_names=true
// Authorization: Token cWMKvF1vPQUFlKZsFV3F1raIQ8s1bWrj
```

**webhook/route.ts — logica:**
  1. Validar assinatura HMAC (header x-webhook-signature)
  2. Verificar idempotencia (buscar pedido por correlationID no Baserow)
  3. Se ja confirmado: retorna 200 sem duplicar
  4. Se novo: chama baserow.criarPedido() com status "confirmado"

**Campos que o Baserow precisa ter na tabela 901528:**
  Verificar campos existentes via:
  GET https://api.baserow.io/api/database/fields/table/901528/
  Authorization: Token cWMKvF1vPQUFlKZsFV3F1raIQ8s1bWrj

**Criterio de aceite:**
  1. Webhook valida assinatura — rejeita requests sem assinatura valida
  2. Pedido criado no Baserow com todos os campos obrigatorios
  3. Segunda chamada com mesmo correlationID nao duplica pedido

---

## TASK 9 — Pos-pagamento (/obrigado)

**Objetivo:** Confirmar pedido, entregar instrucoes e apresentar upsell.

**Arquivos:**
  - src/app/obrigado/page.tsx
  - src/components/obrigado/ConfirmacaoAnimada.tsx
  - src/components/obrigado/InstrucoesPedido.tsx
  - src/components/obrigado/UpsellSegundaMusica.tsx
  - src/components/obrigado/CompartilharWhatsApp.tsx

**ConfirmacaoAnimada — spec:**
  - Checkmark verde animado (SVG path draw animation)
  - Titulo: "Pedido confirmado, [Nome]!"
  - Subtitulo: "Sua musica para [Homenageado] esta sendo criada com carinho."

**UpsellSegundaMusica — spec:**
  - Box gold/10 border gold/30 rounded-2xl p-6
  - Titulo: "Aproveite: segunda musica por apenas R$37!"
  - Timer regressivo de 10 minutos
  - Botao: bg-gold pill "Quero uma segunda musica"
  - Clique: navega para /checkout?upsell=true (pre-preenchido)

**Pixel Meta Ads — spec:**
  - Disparar evento Purchase com valor correto ao carregar a pagina
  - Usar Script do Next.js (afterInteractive)
  - Verificar com Meta Pixel Helper

**Criterio de aceite:**
  1. Nomes exibidos corretamente (comprador + homenageado)
  2. ID WOOVI visivel na pagina
  3. Upsell com timer funcionando
  4. Botao compartilhamento abre WhatsApp com mensagem pre-formatada
  5. Pixel dispara evento Purchase (verificar no console do browser)

---

## TASK 10 — Stripe (Cartao) como Fallback

**Nota:** WOOVI cobre o PIX. Stripe para cartao de credito — implementar APOS validar conversao PIX.
Dependencia: sk_live_ rotacionada em 2026-05-07 (General tem as novas credenciais).
Esta task e OPCIONAL para o MVP. Implementar se taxa de abandono no PIX for > 40%.

---

## TASK 11 — Deploy Vercel + Variaveis de Ambiente

**Objetivo:** Publicar o funil em producao no Vercel.

**Passo 1:** Criar projeto no Vercel
```bash
npx vercel --prod
```

**Passo 2:** Configurar variaveis de ambiente no Vercel Dashboard:
  - WOOVI_APP_ID
  - WOOVI_TOKEN
  - WOOVI_WEBHOOK_SECRET
  - BASEROW_TOKEN (cWMKvF1vPQUFlKZsFV3F1raIQ8s1bWrj)
  - BASEROW_TABLE_ID (901528)
  - NEXT_PUBLIC_BASE_URL (https://virahit.ai ou dominio do funil)

**Passo 3:** Configurar dominio
  Se o funil for um subdominio (funil.virahit.ai), adicionar no Vercel.
  Se for virahit.ai, substituir o site atual — CONFIRMAR COM O GENERAL ANTES.

**Passo 4:** Configurar webhook WOOVI apontando para producao:
  URL: https://funil.virahit.ai/api/webhooks/woovi

**Criterio de aceite:**
  1. Build no Vercel sem erros
  2. Funil acessivel no dominio configurado
  3. QR Code PIX gerado em ambiente de producao (sandbox primeiro)
  4. Pedido aparece no Baserow apos pagamento

---

## TASK 12 — QA + Lighthouse + Ajustes Finais

**Objetivo:** Garantir que o funil esta pronto para receber trafego pago.

**Checklist final:**
  [ ] Lighthouse Performance >= 80 em todas as telas (mobile)
  [ ] Funil completo testado end-to-end em modo sandbox WOOVI
  [ ] Dados do quiz chegam corretamente no checkout e no /obrigado
  [ ] Pedido criado no Baserow com todos os campos corretos
  [ ] Meta Pixel disparando Purchase com valor correto
  [ ] Checklist design system: todos os 11 itens passando
  [ ] Teste em iPhone 12 (390px) e Samsung Galaxy S21 (360px)
  [ ] Teste no Safari iOS (bugs de viewport e input sao comuns)
  [ ] Carrossel de ocasioes funciona com swipe no mobile
  [ ] Voice input funciona no Chrome mobile

---

## SEQUENCIA DE EXECUCAO

Tasks sem dependencia (podem rodar em paralelo):
  - Task 1 (setup) → base para tudo
  - Task 2 (tipos) → pode rodar junto com Task 1

Sequencia obrigatoria:
  Task 1 → Task 2 → Task 3 → Task 4 (landing)
  Task 1 → Task 2 → Task 5 → Task 6 (quiz)
  Task 6 → Task 7 (checkout depende do quiz)
  Task 7 → Task 8 (webhook depende do checkout)
  Task 8 → Task 9 (obrigado depende do webhook)
  Task 9 → Task 11 (deploy)
  Task 11 → Task 12 (QA em producao)

**MVP minimo para primeiro teste de trafego:**
  Tasks 1, 2, 3, 5, 6, 7, 8, 9, 11 (sem videos, sem voice input, sem upsell)
  Estimativa: 3-4 dias de execucao de agentes

**MVP completo:**
  Todas as tasks 1-12
  Estimativa: 5-7 dias

---

*Plano criado em 2026-05-07 pelo Socio-God*
*Design System: /home/hermes_general/empresa/operacao/design/VIRAHIT-DESIGN-SYSTEM.md*
*PRD: /home/hermes_general/empresa/funil-web/PRD.md*
