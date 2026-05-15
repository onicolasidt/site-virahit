# PROMPT-DEV-CONVERSION — Tela de Conversão ViraHit

## Visão geral

Auditoria identificou 6 mudanças de copy + 1 remoção de elemento. Cada mudança listada com ANTES / DEPOIS em uma única linha. Design: NÃO tocar — apenas classes Tailwind já existentes. Checklist de verificação ao final.

---

## MUDANÇA 1 — Ícones flutuantes decorativos

**Problema:** 4 ícones animados no fundo (coração, nota musical, auto_awesome, straighten). Especialmente "straighten" (régua) não tem relação semântica com produto emocional. Distrai no mobile sem agregar.

**ANTES** (linhas 267-278):
```tsx
<div className="hidden sm:block absolute top-[15%] left-[10%] text-[var(--gold)]/20 animate-float">
  <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
</div>
<div className="hidden sm:block absolute top-[25%] right-[10%] text-[var(--teal)]/10 animate-float-delayed">
  <span className="material-symbols-outlined text-7xl">music_note</span>
</div>
<div className="hidden sm:block absolute top-[60%] left-[8%] text-[var(--teal)]/5 animate-float-slow">
  <span className="material-symbols-outlined text-5xl">auto_awesome</span>
</div>
<div className="hidden sm:block absolute top-[70%] right-[12%] text-[var(--gold)]/15 animate-float">
  <span className="material-symbols-outlined text-6xl">straighten</span>
</div>
```

**DEPOIS:**
```tsx
{/* Ícones decorativos removidos para reduzir distração visual */}
```

**Regra:** Remover os 4 blocos. Não substituir por outros. O fundo com gradientes (bg-gradient-to-b etc.) permanece — só os ícones vão.

---

## MUDANÇA 2 — Microcopy do campo email

**Problema:** "Você recebe o link da música aqui também" — a palavra "link" é fria e técnica. Planta a dúvida "link? eu não vou receber no WhatsApp?" quando o quiz prometeu entrega via WhatsApp. Confunde em vez de confirmar.

**ANTES** (linha 393):
```tsx
<span className="text-[13.5px] text-[var(--teal)]/60 font-['Merriweather']">Você recebe o link da música aqui também</span>
```

**DEPOIS:**
```tsx
<span className="text-[13.5px] text-[var(--teal)]/60 font-['Merriweather']">A gente te notifica por aqui</span>
```

**Regra:** Manter a mesma classe Tailwind. Só trocar o texto.

---

## MUDANÇA 3 — Depoimentos extras (3 cards após o CTA)

**Problema:** Mariana S., Pedro H., Amanda L. — 3 depoimentos depois do botão de CTA. Quando a landing page já tem prova social forte (Bruno, Amanda, Fernando), repetir aqui não reforça — dá tempo para a pessoa hesitar. Qualquer elemento visual depois do CTA é uma saída potencial.

**ANTES** (linhas 526-557):
```tsx
{/* SOCIAL PROOF (REVIEWS) */}
<div className="mt-12 mb-4 relative z-10 w-full max-w-md mx-auto px-2">
  <div className="flex items-center justify-center gap-1 mb-5">
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} viewBox="0 0 24 24" fill="#F5B041" className="w-[18px] h-[18px]">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ))}
  </div>
  <div className="space-y-3">
    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-[var(--teal)]/5 shadow-[0_4px 20px_rgba(44,93,99,0.02)]">
       <p className="font-['Merriweather'] text-[13px] sm:text-[14px] text-[var(--teal)] italic mb-2 leading-relaxed">
         "Chorei horrores ouvindo a música. Ficou perfeita, entregaram super rápido direto no WhatsApp."
       </p>
       <p className="font-['Open_Sans'] text-[11px] font-bold text-[var(--teal)]/60 uppercase tracking-wider">— Mariana S.</p>
    </div>
    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-[var(--teal)]/5 shadow-[0 4px 20px_rgba(44,93,99,0.02)]">
       <p className="font-['Merriweather'] text-[13px] sm:text-[14px] text-[var(--teal)] italic mb-2 leading-relaxed">
         "Zero burocracia. O PIX aprovou na hora e a música ficou surreal de boa! Recomendo pra todo mundo."
       </p>
       <p className="font-['Open_Sans'] text-[11px] font-bold text-[var(--teal)]/60 uppercase tracking-wider">— Pedro H.</p>
    </div>
    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-[var(--teal)]/5 shadow-[0 4px 20px_rgba(44,93,99,0.02)]">
       <p className="font-['Merriweather'] text-[13px] sm:text-[14px] text-[var(--teal)] italic mb-2 leading-relaxed">
         "Melhor presente que já dei na vida. Confiança total nessa galera, valeu cada centavo!"
       </p>
       <p className="font-['Open_Sans'] text-[11px] font-bold text-[var(--teal)]/60 uppercase tracking-wider">— Amanda L.</p>
    </div>
  </div>
</div>
```

**DEPOIS:**
```tsx
{/* Depoimentos removidos — prova social já está na landing page */}
```

**Regra:** Remover todo o bloco. Não mover para outro lugar. A nota de 5 estrelas (5 svg) também sai — não faz sentido sem os depoimentos abaixo.

---

## MUDANÇA 4 — Link clicável do WhatsApp da Mônica

**Problema:** "Tem dúvida rápida? Fala com a Mônica no WhatsApp" é um link `<a>` que abre o WhatsApp e tira a pessoa da tela de conversão. O banco é explícito: qualquer elemento clicável que não seja o CTA é uma saída. A Mônica como trust signal funciona — mas como ícone estático.

**ANTES** (linhas 559-571):
```tsx
<div className="mt-12 text-center pb-8 flex flex-col items-center justify-center relative z-10">
  <a href="https://wa.me/5511999999999?text=Oi%20Monica!" target="_blank" rel="noopener noreferrer" className="flex flex-col gap-3 items-center group">
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#33A854" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
    <div className="flex flex-col items-center gap-1 mt-1">
      <span className="font-['Merriweather'] text-[14px] text-[var(--teal)]/70">Tem dúvida rápida?</span>
      <span className="font-['Merriweather'] font-bold text-[15px] text-[var(--teal)] group-hover:text-[#33A854] transition-colors">
        Fala com a Mônica no WhatsApp
      </span>
    </div>
  </a>
</div>
```

**DEPOIS:**
```tsx
<div className="mt-12 text-center pb-8 flex flex-col items-center justify-center relative z-10">
  {/*
    WhatsApp clicável removido — saía da tela de conversão.
    Ícone estático mantido como trust signal.
    Para reativar como link: remover o wrapper {/*...} e usar o <a> original.
  */}
  <div className="flex flex-col gap-3 items-center">
    <div className="opacity-60">
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#33A854" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
      </svg>
    </div>
    <div className="flex flex-col items-center gap-1 mt-1">
      <span className="font-['Merriweather'] text-[14px] text-[var(--teal)]/70">Precisa de ajuda?</span>
      <span className="font-['Merriweather'] text-[15px] text-[var(--teal)]/50">
        A equipe ViraHit responde em até 2h
      </span>
    </div>
  </div>
</div>
```

**Regra:** O `<a>` vira `<div>`. O texto muda de "Fala com a Mônica no WhatsApp" (comportamento de link) para "A equipe ViraHit responde em até 2h" (frase informativa, não clicável). O ícone SVG do WhatsApp permanece mas sem interação.

---

## MUDANÇA 5 — Stack de valor com 4 bullets e separador music_cast

**Problema:** 4 bullets de valor ("pode ouvir pra sempre", "não existe outra igual", "grava e manda em 24h", "7 dias de garantia") ocupam espaço considerável antes do preço. A pessoa que chegou via quiz já sabe o que está comprando — mostrar 4 bullets de "o que você recebe" antes do preço gera objeção desnecessária. O ícone music_cast no meio fragmenta visualmente sem agregar.

**ANTES** (linhas 412-453):
```tsx
<h3 className="font-['Open_Sans'] font-extrabold text-[15px] sm:text-[16px] text-[var(--teal)]/70 uppercase tracking-[0.15em] mb-8">
  {resolverGenero('A música que só [A_O] [NOME] vai ter', data.genero, data.nome)}
</h3>

<div className="flex flex-col gap-6 text-left mx-auto w-full max-w-[340px] mb-10">
  {[
    {
      title: resolverGenero('[ELA_ELE_CAPS] pode ouvir essa música pra sempre', data.genero, data.nome),
      desc: ['Salva no celular', 'Toca no aniversário, em qualquer dia']
    },
    {
      title: 'Não existe outra igual no mundo',
      desc: ['Só com a história que você contou', resolverGenero('Só pra [ELA_ELE]', data.genero, data.nome)]
    },
    {
      title: 'A gente escreve, grava e manda em até 24h',
      desc: ['Direto no seu WhatsApp']
    },
    {
      title: 'Você não perde nada — 7 dias de garantia total',
      desc: ['Ouviu e não gostou? Devolução completa', 'Sem pergunta. Sem enrolação.']
    }
  ].map((item, i) => (
    <div key={i} className="flex gap-4 items-start">
      <div className="w-6 h-6 rounded-full bg-[var(--gold)]/10 flex items-center justify-center shrink-0 mt-0.5">
        <span className="material-symbols-outlined text-[var(--gold)] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>done</span>
      </div>
      <div className="flex flex-col">
        <span className="font-['Merriweather'] text-[15px] text-[var(--teal)] font-bold block first-letter:uppercase">{item.title}</span>
        <span className="font-['Merriweather'] text-[13.5px] text-[var(--teal)]/60 mt-1 leading-relaxed">
          {item.desc.map((d, j) => <span key={j} className="block">{d}</span>)}
        </span>
      </div>
    </div>
  ))}
</div>

<div className="flex items-center gap-4 my-8 justify-center">
  <div className="h-px bg-gradient-to-r from-transparent via-[var(--teal)]/20 to-transparent w-full max-w-[80px]"></div>
  <span className="material-symbols-outlined text-[var(--gold)]/50 text-[20px]">music_cast</span>
  <div className="h-px bg-gradient-to-r from-transparent via-[var(--teal)]/20 to-transparent w-full max-w-[80px]"></div>
</div>

<div className="flex flex-col items-center gap-1.5 mb-8 text-center px-2">
  <span className="text-[14px] text-[var(--teal)]/60 italic font-['Merriweather'] pt-1">Flores murcham em 3 dias</span>
  <span className="text-[14px] text-[var(--teal)]/60 italic font-['Merriweather'] pb-1">Chocolates somem em 5 minutos</span>
  <span className="font-['Open_Sans'] font-extrabold text-[22px] sm:text-[24px] leading-tight text-[var(--teal)] tracking-tight mt-1">
    Essa música fica pra sempre
  </span>
</div>
```

**DEPOIS:**
```tsx
{/*
  Stack de 4 bullets removido — a pessoa já sabe o que está comprando ao chegar aqui.
  O quiz construiu o valor. Essa tela só executa.
  Frase "Flores murcham / Chocolates somem / Essa música fica pra sempre"
  reduzida para 2 linhas e posicionada logo abaixo do preço (ver MUDANÇA 6).
*/}
```

**Regra:** Remover todo o array de 4 bullets e o div do music_cast. O H3 "A música que só [A_O] [NOME] vai ter" pode permanecer se o layout permitir — é um reforço de personalização, não um bullet de valor. Se ocupar muito espaço vertical, remover também. O bloco "Flores murcham / Chocolates somem" fica — mas encolhe para 2 linhas no máximo (ver MUDANÇA 6).

---

## MUDANÇA 6 — Bloco de ancoragem (Flores/Chocolates) encolhido

**Problema:** O bloco de ancoragem "Flores murcham em 3 dias / Chocolates somem em 5 minutos / Essa música fica pra sempre" tem 3 linhas quando o máximo deveria ser 2. A frase "Essa música fica pra sempre" funciona como gancho de ancoragem e deve ficar — mas as duas primeiras linhas ("Flores murcham", "Chocolates somem") podem ser condensadas.

**ANTES** (linhas 455-461):
```tsx
<div className="flex flex-col items-center gap-1.5 mb-8 text-center px-2">
  <span className="text-[14px] text-[var(--teal)]/60 italic font-['Merriweather'] pt-1">Flores murcham em 3 dias</span>
  <span className="text-[14px] text-[var(--teal)]/60 italic font-['Merriweather'] pb-1">Chocolates somem em 5 minutos</span>
  <span className="font-['Open_Sans'] font-extrabold text-[22px] sm:text-[24px] leading-tight text-[var(--teal)] tracking-tight mt-1">
    Essa música fica pra sempre
  </span>
</div>
```

**DEPOIS:**
```tsx
<div className="flex flex-col items-center gap-0 mb-8 text-center px-2">
  <span className="font-['Open_Sans'] font-extrabold text-[22px] sm:text-[24px] leading-tight text-[var(--teal)] tracking-tight">
    Essa música fica pra sempre
  </span>
</div>
```

**Regra:** As duas linhas de "Flores murcham / Chocolates somem" saem. Só permanece a frase de ancoragem principal "Essa música fica pra sempre". O gap encolhe de gap-1.5 para gap-0. O mb-8 permanece para separar do preço.

---

## CHECKLIST DE VERIFICAÇÃO

Após aplicar as 6 mudanças, conferir:

- [ ] Nenhum dos 4 ícones flutuantes aparece mais (favorite, music_note, auto_awesome, straighten)
- [ ] Campo email não contém mais a palavra "link"
- [ ] Nenhum card de depoimento após o Bloco 4 (Mariana S., Pedro H., Amanda L. ausentes)
- [ ] Bloco do WhatsApp da Mônica não é mais clicável — não abre WhatsApp
- [ ] Os 4 bullets de valor não aparecem mais (done checkmarks)
- [ ] Separador music_cast não aparece mais
- [ ] "Flores murcham" e "Chocolates somem" não aparecem mais — só "Essa música fica pra sempre"
- [ ] Trust badges (PIX, Visa, Mastercard, PayPal) permanecem intactos
- [ ] CTA verde continua no mesmo lugar
- [ ] Player de áudio continua no mesmo lugar
- [ ] Nenhuma mudança em classes Tailwind de cor, padding, border-radius dos elementos que permanecem
- [ ] Nenhuma mudança no design system (variáveis CSS, espaçamentos base)

---

## REGRA ABSOLUTA

**NÃO TOCAR no design system.** Isso significa:
- Variáveis CSS (`var(--cream)`, `var(--teal)`, `var(--gold)`) — não alterar
- Espaçamentos base do layout (max-w-md, px-5, pt-8) — não alterar
- Bordas, border-radius, sombras — não alterar
- Fontes (Merriweather, Open Sans) — não alterar
- Responsivo (sm:, md:) — não alterar

As únicas mudanças permitidas são as 6 listadas acima. Nada mais.