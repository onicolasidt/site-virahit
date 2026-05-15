# PROMPT — AGENTE DEV: LANDING PAGE VIRAHIT v3
# Para: agente de desenvolvimento (Claude Code / Codex / OpenCode ou similar)
# Arquivo de copy: /empresa/site-virahit/docs/copy/COPY-LANDING-VIRAHIT-v3.md
# Design system: /empresa/site-virahit/DESIGN.md
# Arquivo principal: /empresa/site-virahit/apps/landing/src/pages/Home.tsx
# Data: maio 2026

---

## CONTEXTO DO PROJETO

Você está trabalhando na landing page da ViraHit — estúdio de música personalizada
como presente emocional. Produto: R$47, entrega em 24h via WhatsApp.

A landing page atual (Home.tsx) está bem construída visualmente.
O que muda nesta versão não é o design — é a ESTRUTURA e alguns elementos novos.

O público é majoritariamente feminino, 35–55 anos, tráfego frio Meta Ads.
A página precisa ser impactante no mobile primeiro.

---

## REGRA ABSOLUTA DESTE PROMPT — LEIA ANTES DE QUALQUER COISA

Antes de qualquer código, leia e memorize estas regras:

O design system da ViraHit está em `/empresa/site-virahit/DESIGN.md`.
Leia esse arquivo completamente antes de escrever uma linha de código.

---

### ⛔ ZONA PROIBIDA — HEADER.TSX — NÃO TOCAR SOB HIPÓTESE ALGUMA

O arquivo `/empresa/site-virahit/apps/landing/src/components/Header.tsx`
está COMPLETAMENTE FORA DO ESCOPO deste prompt.

NÃO abra o arquivo.
NÃO leia o arquivo.
NÃO modifique nenhuma linha.
NÃO adicione props ao componente `<Header />` no Home.tsx.
NÃO mova o `<Header />` de lugar no JSX.
NÃO altere as classes do `<header>` element.
NÃO altere os links de navegação (NAV_LINKS).
NÃO altere a URL do CTA ("Criar Música") dentro do header.
NÃO altere o comportamento do hamburger menu.
NÃO altere os keyframes vh-shimmer e vh-swing.
NÃO altere o efeito de blur no fundo ao abrir o menu.
NÃO altere o border-radius dinâmico pill↔rounded-3xl.

O Header foi lapidado manualmente e está aprovado como está.
Qualquer toque — mesmo uma vírgula — é proibido.

Se qualquer mudança de estrutura no Home.tsx parecer exigir alterar o Header,
pare, sinalize com um comentário `{/* CONFLITO COM HEADER — aguarda decisão */}`
e não implemente até aprovação explícita do dono.

---

Você vai criar seções novas e reordenar seções existentes.
Para cada elemento que criar:
- Use as cores do design system (tokens: --teal, --gold, --cream)
- Use as fontes do design system (Merriweather para copy emocional, Open Sans para labels/CTAs)
- Use os border-radius do design system (landing = 8–20px, quiz = 0px)
- Use os shadows do design system (soft, medium, cta)
- Siga o padrão de alternância cream/dark-teal para seções
- Mínimo 15px para qualquer texto (público 50+)

O que você NÃO faz:
- Não inventa cores fora do design system
- Não usa glassmorphism fora da página de obra
- Não usa emojis na landing (use ícones Lucide)
- Não usa text abaixo de 12px
- Não usa dark mode
- Não usa pure black (#000000) para texto — sempre teal
- Não usa pure white (#FFFFFF) como fundo de página — sempre cream (#F4EEDC)
- Não altera o design visual das seções que já existem e funcionam

---

## ESTUDE ANTES DE COMEÇAR

### 1. Leia o design system completo
`/empresa/site-virahit/DESIGN.md`

Atenção especial a:
- Paleta de cores (seção Colors)
- Tipografia: quando usar Merriweather vs Open Sans
- Alternância de fundos: cream sections vs dark-teal sections
- Componentes: card-benefit, section-dark-landing, button-cta-primary
- Do's and Don'ts (última seção — lista explícita do que não fazer)

### 2. Leia o Home.tsx atual
`/empresa/site-virahit/apps/landing/src/pages/Home.tsx`

Entenda:
- Como as seções atuais estão estruturadas
- Quais componentes externos já existem (HeroVideo, WhatsAppTestimonial, Header, Footer)
- Como os áudios de depoimento são importados e usados
- O padrão de classes Tailwind usado nas seções existentes

### 3. Leia a copy completa v3
`/empresa/site-virahit/docs/copy/COPY-LANDING-VIRAHIT-v3.md`

Este arquivo contém:
- Toda a copy nova, palavra por palavra
- Notas de copy explicando o raciocínio de cada mudança
- Prioridade de implementação (CRÍTICO → ALTO → MÉDIO → BAIXO)
- O que foi removido e por quê

### 4. Inspecione os assets disponíveis
`/empresa/site-virahit/apps/landing/src/assets/`

Você vai precisar dos arquivos de áudio para os players de estilo musical.
O dono vai fornecer os 3 arquivos MP3 com os nomes:
- `estilo-sertanejo.mp3`
- `estilo-gospel.mp3`
- `estilo-pagode.mp3`

(Se os arquivos ainda não estiverem na pasta, crie os componentes com
`{/* AGUARDA ARQUIVO DE ÁUDIO: estilo-sertanejo.mp3 */}` como placeholder.)

---

## O QUE MUDA NA ESTRUTURA

### ESTRUTURA NOVA (9 seções — substituir a estrutura atual)

```
ANTES (estrutura atual)       →    DEPOIS (estrutura nova)
──────────────────────────────────────────────────────────
1. Hero                       →    1. Hero (com framing do vídeo — ver abaixo)
2. Ocasiões                   →    2. Como Funciona
3. O Desafio (PAS)            →    3. Demonstração de Qualidade ← NOVA
4. Como Funciona              →    4. Prova Social (depoimentos)
5. Por que a ViraHit          →    5. Por que a ViraHit (com Amanda)
6. Tabela comparativa         →    6. Ocasiões
7. Depoimentos                →    7. Bloco de Oferta
8. Bloco de Oferta            →    8. Garantia + CTA Final
9. Garantia                   →    9. FAQ
10. Imagine essa cena         →    [REMOVIDA — incorporada ao Bloco de Oferta]
11. CTA Final                 →    [REMOVIDA como seção separada]
12. FAQ                       →    [unificada com Garantia]

REMOVIDAS:
- Seção "O Desafio" (3 cards PAS)
- Tabela comparativa
- Seção "Imagine essa cena" (como seção separada)
```

---

## IMPLEMENTAÇÃO — SEÇÃO POR SEÇÃO

### SEÇÃO 1 — HERO (modificar, não recriar)

**O que muda:**

1. Adicionar framing antes do vídeo:

```tsx
{/* Framing antes do player — NOVO */}
<p className="text-center text-[var(--teal-light)] text-sm uppercase tracking-[0.25em] font-semibold mb-3">
  É isso que acontece quando alguém ouve pela primeira vez
</p>
```
Inserir imediatamente ACIMA do `<HeroVideo />`.

2. Adicionar legenda abaixo do vídeo:

```tsx
{/* Legenda abaixo do player — NOVA */}
<p className="text-center text-[var(--teal-light)] text-sm italic mt-3">
  Reação real. Sem script. Sem aviso que ia gravar.
</p>
```
Inserir imediatamente ABAIXO do `<HeroVideo />`.

3. Atualizar o CTA — adicionar preço ao texto:

ANTES:
```tsx
<span>Criar Minha Música</span>
```
DEPOIS:
```tsx
<span>Criar Minha Música por R$47</span>
```

4. Atualizar o subscrito — remover "R$ 47 •":

ANTES:
```tsx
R$ 47 • Leva menos de 3 minutos • Entrega em 24h • Garantia de 7 dias
```
DEPOIS:
```tsx
Leva menos de 3 minutos • Entrega em 24h • Garantia de 7 dias
```

---

### SEÇÃO 2 — COMO FUNCIONA (mover, não recriar)

Mover a seção atual "Como Funciona" para a posição 2 — logo após o hero.
A seção já existe e está bem construída. Não alterar o design.
Apenas reposicionar no JSX.

Adicionar CTA ao final da seção:

```tsx
{/* CTA ao final de Como Funciona */}
<div className="flex justify-center mt-12">
  <a href="/quiz" className="group bg-[var(--gold)] text-white heading-font text-base py-4 px-10 rounded-lg shadow-[0_8px_20px_rgba(234,161,21,0.3)] hover:bg-[var(--gold-dark)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-3">
    <span>Criar Minha Música por R$47</span>
    <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
  </a>
</div>
```

---

### SEÇÃO 3 — DEMONSTRAÇÃO DE QUALIDADE ← NOVA

Esta é a seção mais importante da página. Crie com cuidado máximo.

**Fundo:** cream (#F4EEDC) — seção light

**Estrutura:**

```tsx
{/* ===== SEÇÃO 3 — DEMONSTRAÇÃO DE QUALIDADE ===== */}
<section className="px-6 py-20 bg-[var(--cream)] relative">
  <div className="max-w-4xl mx-auto">

    {/* Eyebrow */}
    <span className="text-[var(--gold)] font-bold uppercase tracking-[0.4em] text-[10px] block mb-4">
      Ouça antes de decidir
    </span>

    {/* H2 */}
    <h2 className="text-3xl sm:text-4xl md:text-5xl text-[var(--teal)] mb-4">
      É assim que fica
    </h2>

    {/* Subtítulo */}
    <p className="text-[var(--teal-light)] text-lg sm:text-xl font-light leading-relaxed italic mb-14 max-w-xl">
      Três estilos. Três histórias reais.<br />
      Aperta o play e imagina alguém que você ama ouvindo isso.
    </p>

    {/* Grid de players */}
    <div className="flex flex-col gap-8">
      {/* Player 1 — Sertanejo */}
      <AudioPlayerCard
        style="Sertanejo"
        framing="Essa aqui foi feita pra um aniversário de 15 anos. A filha tocou pro pai — ele não conseguiu segurar."
        audioSrc={estiloSertanejoAudio}
        accentColor="var(--gold)"
      />

      {/* Player 2 — Gospel */}
      <AudioPlayerCard
        style="Gospel"
        framing="Presente de Dia das Mães. A mãe ouviu três vezes seguidas antes de conseguir falar."
        audioSrc={estiloGospelAudio}
        accentColor="var(--gold)"
      />

      {/* Player 3 — Pagode */}
      <AudioPlayerCard
        style="Pagode"
        framing="Declaração de casamento. Ele tocou na festa surpresa — sem avisar."
        audioSrc={estiloPagedeAudio}
        accentColor="var(--gold)"
      />
    </div>

    {/* Linha protegida — não alterar */}
    <p className="text-center text-[var(--teal)] font-medium text-lg mt-14 leading-relaxed max-w-xl mx-auto">
      Não é playlist. Não é cover.<br />
      É uma música que só existe por causa da história de vocês.<br />
      <span className="italic text-[var(--teal-light)]">Cada palavra, cada nota.</span>
    </p>

    {/* CTA */}
    <div className="flex justify-center mt-10">
      <a href="/quiz" className="group bg-[var(--gold)] text-white heading-font text-base py-4 px-10 rounded-lg shadow-[0_8px_20px_rgba(234,161,21,0.3)] hover:bg-[var(--gold-dark)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-3">
        <span>Criar Minha Música por R$47</span>
        <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
      </a>
    </div>

  </div>
</section>
```

**Componente AudioPlayerCard — criar em separado:**

Crie `/empresa/site-virahit/apps/landing/src/components/AudioPlayerCard.tsx`

O componente deve:
- Receber: `style` (string), `framing` (string), `audioSrc` (string), `accentColor` (string)
- Exibir o framing em itálico acima do player (Merriweather, text-[var(--teal-light)], text-base)
- Exibir o rótulo do estilo em uppercase (Open Sans, tracking wide, text-[var(--gold)])
- Ter um botão de play/pause circular em gold com ícone Lucide (Play / Pause)
- Ter uma barra de progresso simples (fundo cream-alt, preenchimento gold)
- Exibir o tempo atual / duração total
- Background: white (#FFFFFF)
- Border radius: 16px (rounded-2xl)
- Shadow: soft (`0 8px 32px rgba(44, 93, 99, 0.06)`)
- Padding: 24px
- Layout: framing no topo → linha divisória → player (botão + barra + tempo)
- Mobile: full width. Desktop: max-width 560px, centralizado

**Especificações visuais do AudioPlayerCard:**

```
┌─────────────────────────────────────────────────────┐
│  SERTANEJO                                [label]   │
│                                                     │
│  "Essa aqui foi feita pra um aniversário..."        │
│  (framing em Merriweather italic, teal-light)       │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  ▶  ████████████░░░░░░░░░░░░░░░░░░  0:23 / 1:47    │
│  (botão gold)  (barra progresso)   (tempo)          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Comportamento:
- Ao clicar play em um card, pausar qualquer outro card que esteja tocando
- Ao terminar o áudio, voltar ao estado inicial (play icon, barra no 0)
- Usar `useRef` para o elemento `<audio>` — não `useState` para controle de play/pause
  (evita re-render desnecessário)

---

### SEÇÃO 4 — PROVA SOCIAL (modificar posição + fix crítico)

Mover a seção atual de depoimentos para a posição 4.

**FIX CRÍTICO — bug de geolocalização:**

Localizar no código qualquer referência a `visitorLocation`, IP dinâmico,
ou lógica que sobrescreva a cidade dos depoimentos.

Hardcode as cidades como strings estáticas:
- Bruno → `"São Paulo, SP"`
- Amanda → `"Curitiba, PR"`  
- Fernando → `"Rio de Janeiro, RJ"`

Remover qualquer `{visitorLocation || "..."}` — substituir pela string estática diretamente.

**Mover Amanda para Seção 5:**
O card de depoimento da Amanda (áudio depoimento2.mp3 + "Eu tava com muito medo
de ficar com voz de robô...") deve ser REMOVIDO desta seção e adicionado na Seção 5,
conforme especificado abaixo.

Nesta seção ficam apenas Bruno e Fernando.

Adicionar CTA ao final:

```tsx
<div className="flex justify-center mt-12">
  <a href="/quiz" className="group bg-[var(--gold)] text-white heading-font text-base py-4 px-10 rounded-lg shadow-[0_8px_20px_rgba(234,161,21,0.3)] hover:bg-[var(--gold-dark)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-3">
    <span>Criar Minha Música por R$47</span>
    <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
  </a>
</div>
```

---

### SEÇÃO 5 — POR QUE A VIRAHIT (modificar — inserir Amanda)

Mover a seção existente "Por que a ViraHit é Diferente" para a posição 5.
Não alterar o design visual dos cards existentes.

**Adicionar o depoimento da Amanda imediatamente após os bullets principais:**

Inserir após o card principal com os 3 bullets (✦), antes dos cards "Pronta em 24h"
e "A música é SUA":

```tsx
{/* Depoimento Amanda — colado ao diferencial de qualidade */}
<div className="mt-8 mb-2">
  <WhatsAppTestimonial
    audio={depoimento2Audio}
    photo={fotoDepoimento2}
    name="Amanda"
    location="Curitiba, PR"
    quote="Eu tava com muito medo de ficar com voz de robô, sabe? Mas ficou perfeito — parece que foi gravado num estúdio de verdade!"
  />
</div>
```

> Por que aqui: o depoimento da Amanda responde a objeção de qualidade ("voz de robô")
> imediatamente após os bullets de diferencial. A pessoa leu os diferenciais,
> a objeção formou na cabeça — e Amanda responde antes que ela saia da página.

---

### SEÇÃO 6 — OCASIÕES (mover, não recriar)

Mover a seção atual de Ocasiões para a posição 6.
Não alterar nada no design ou copy. Apenas reposicionar.

---

### SEÇÃO 7 — BLOCO DE OFERTA (modificar — adicionar narrativa)

A seção já existe. Adicionar a narrativa curta ANTES da ancoragem de preço:

```tsx
{/* Narrativa curta — inserir antes da ancoragem */}
<div className="my-10 max-w-md mx-auto">
  <p className="text-[var(--teal-light)] text-lg font-light leading-relaxed italic font-serif">
    Você manda a música às 7 da manhã.<br /><br />
    Quem você ama abre no celular, a caminho do trabalho.<br />
    Ouve o primeiro verso — e é o próprio nome.<br />
    A história de vocês. Aquele momento que só vocês dois sabem.<br /><br />
    Para tudo.<br />
    Ouve de novo.<br />
    Manda pro grupo da família.<br />
    Liga pra você chorando.<br /><br />
    Você só precisou responder algumas perguntas.<br />
    A gente cuidou do resto.
  </p>
</div>
```

Adicionar CTA ao final do bloco:

```tsx
<div className="flex justify-center mt-10">
  <a href="/quiz" className="group bg-[var(--gold)] text-white heading-font text-base py-4 px-10 rounded-lg shadow-[0_8px_20px_rgba(234,161,21,0.3)] hover:bg-[var(--gold-dark)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-3">
    <span>Criar Minha Música por R$47</span>
    <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
  </a>
</div>
```

---

### SEÇÃO 8 — GARANTIA + CTA FINAL (unificar)

Manter a seção de Garantia existente.
Remover a seção "Imagine Essa Cena" como seção separada.
Remover a seção "CTA Final" como seção separada.
Incorporar o CTA final logo após a garantia, dentro da mesma seção ou como seção
imediatamente seguinte com fundo dark-teal.

**CTA Final (fundo dark-teal — `bg-[var(--teal)]`):**

```tsx
{/* ===== CTA FINAL ===== */}
<section className="px-6 py-24 bg-[var(--teal)] text-white text-center relative overflow-hidden">
  {/* Padrão decorativo de fundo — copiar do padrão usado nas seções dark atuais */}
  <div className="max-w-2xl mx-auto relative z-10">
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6 tracking-tight">
      Daqui 24h, alguém vai chorar por sua causa
    </h2>
    <p className="text-white/80 text-lg font-light mb-10 leading-relaxed">
      Não dê mais um presente que vai pro fundo da gaveta.<br />
      Responde o quiz. A gente faz o resto.
    </p>
    <a href="/quiz" className="group inline-flex items-center gap-3 bg-[var(--gold)] text-white heading-font text-lg py-5 px-12 rounded-lg shadow-[0_8px_20px_rgba(234,161,21,0.3)] hover:bg-[var(--gold-dark)] hover:scale-105 active:scale-95 transition-all duration-200">
      <span>🎵 Criar Minha Música por R$47</span>
      <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
    </a>
    <p className="text-white/60 text-sm mt-6 tracking-wide">
      Leva menos de 3 minutos • Recebe em 24h • Garantia de 7 dias
    </p>
  </div>
</section>
```

---

### SEÇÃO 9 — FAQ (manter, adicionar pergunta 5)

Manter a seção atual. Apenas adicionar a pergunta nova ao final do accordion:

```tsx
{
  question: "Como a música é feita?",
  answer: "Você conta a história — nome, ocasião, o que viveram juntos. A gente escreve a letra com os detalhes que você deu e grava no estilo que você escolheu. Não é uma música pronta com o nome colocado no meio. É uma composição feita do zero, que só existe por causa da história de vocês."
}
```

---

### SEÇÕES A REMOVER COMPLETAMENTE

Remover do JSX (não comentar — deletar):
- Seção "O Desafio" (`{/* ===== SEÇÃO — O DESAFIO ===== */}`)
- Seção da tabela comparativa (`{/* ===== COMPARE E VEJA ===== */}`)
- Seção "Imagine Essa Cena" (o conteúdo vai pro Bloco de Oferta como narrativa)
- Seção "CTA Final" separada (incorporada na Seção 8)

---

## CHECKLIST ANTES DE COMMITAR

Header (zona proibida):
- [ ] Header.tsx: zero linhas modificadas (verificar com `git diff src/components/Header.tsx` — deve estar vazio)
- [ ] `<Header />` no Home.tsx: não foi movido, não recebeu props novas
- [ ] Shimmer, swing, hamburger, blur, border-radius dinâmico: intocados

Design system:
- [ ] Nenhuma cor fora da paleta do DESIGN.md foi usada
- [ ] Nenhum texto abaixo de 15px (12px mínimo absoluto)
- [ ] Merriweather usado para copy emocional, Open Sans para labels/CTAs
- [ ] Fundo cream (#F4EEDC) nas seções light, dark-teal (#2C5D63→#153438) nas seções impact
- [ ] Sem glassmorphism fora da página de obra
- [ ] Sem emojis no body da landing (🎵 no CTA final é exceção pontual aceita)
- [ ] Border radius 8–20px nas seções landing (nunca 0px fora do quiz)

Estrutura:
- [ ] 9 seções na ordem definida
- [ ] Seção "O Desafio" removida
- [ ] Tabela comparativa removida
- [ ] "Imagine Essa Cena" removida como seção (conteúdo incorporado)
- [ ] Amanda na Seção 5, não na Seção 4
- [ ] Ocasiões na posição 6

Bugs críticos:
- [ ] visitorLocation removido dos 3 depoimentos
- [ ] Bruno hardcoded "São Paulo, SP"
- [ ] Amanda hardcoded "Curitiba, PR"
- [ ] Fernando hardcoded "Rio de Janeiro, RJ"

Seção de demonstração (nova):
- [ ] Componente AudioPlayerCard criado e funcional
- [ ] Play em um card pausa os outros
- [ ] Framing acima de cada player
- [ ] Mobile: full width, touch-friendly (botão play mínimo 48px)
- [ ] Desktop: max-width 560px centralizado

CTAs:
- [ ] Hero: "Criar Minha Música por R$47"
- [ ] Subscrito do hero: sem "R$ 47 •"
- [ ] CTAs intermediários nas seções 2, 3, 4, 7 com preço

Performance:
- [ ] Áudios da Seção 3 não carregam automaticamente (preload="none")
- [ ] Áudios de depoimento mantêm comportamento atual

---

## ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

1. Fix geolocalização (bug crítico — 10 min)
2. Framing do vídeo no hero (2 linhas de texto — 5 min)
3. CTA do hero com preço (1 palavra — 2 min)
4. Reordenar seções no JSX (sem tocar copy ou design — 20 min)
5. Componente AudioPlayerCard (seção nova mais complexa — 45 min)
6. Seção 3 completa com os 3 players
7. Amanda movida para Seção 5
8. Narrativa curta no Bloco de Oferta
9. CTA Final unificado com Garantia
10. Pergunta 5 no FAQ
11. Remover seções eliminadas
12. Rodar checklist completo
13. Testar em mobile (375px) e desktop (1280px)

---

## REFERÊNCIAS

Copy completa: `/empresa/site-virahit/docs/copy/COPY-LANDING-VIRAHIT-v3.md`
Design system: `/empresa/site-virahit/DESIGN.md`
Arquivo principal: `/empresa/site-virahit/apps/landing/src/pages/Home.tsx`
Componente HeroVideo: `/empresa/site-virahit/apps/landing/src/components/HeroVideo.tsx`
Componente WhatsAppTestimonial: `/empresa/site-virahit/apps/landing/src/components/WhatsAppTestimonial.tsx`
Assets de áudio: `/empresa/site-virahit/apps/landing/src/assets/`
