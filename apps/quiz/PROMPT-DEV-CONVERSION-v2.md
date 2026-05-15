# PROMPT-DEV-CONVERSION-v2 — Tela de Conversão ViraHit (REVISADO)

## Visão geral

Auditoria completa identificou 8 mudanças. Cada mudança listada com ANTES / DEPOIS em uma única linha. Design: NÃO tocar — apenas classes Tailwind já existentes. Checklist de verificação ao final.

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

## MUDANÇA 2 — Subheadline da headline principal

**Problema:** "Essa música não existe em lugar nenhum ainda. Você acabou de criar ela." — frase abstrata que não cria imagem mental. "Não existe em lugar nenhum" é vazio; "Você acabou de criar ela" é metalinguístico (fala sobre o processo, não sobre a emoção). A tela precisa fazer a pessoa IMAGINAR a cena de entrega.

**ANTES** (linha 294-296):
```tsx
<p className="font-['Merriweather'] text-[16px] sm:text-[18px] text-[var(--teal)]/80 leading-relaxed max-w-[360px] mx-auto opacity-90">
  Essa música não existe em lugar nenhum ainda. <strong className="text-[var(--teal)] font-bold">Você acabou de criar ela.</strong>
</p>
```

**DEPOIS:**
```tsx
<p className="font-['Merriweather'] text-[16px] sm:text-[18px] text-[var(--teal)]/80 leading-relaxed max-w-[360px] mx-auto opacity-90">
  Quando <strong className="text-[var(--teal)] font-bold">{resolverGenero('[ELA_ELE]', data.genero, data.nome)}</strong> ouvir pela primeira vez, vai saber que foi você quem fez isso.
</p>
```

**Regra:** Manter a mesma tag `<p>`, mesmas classes Tailwind, mesmo posicionamento. Só trocar o texto interno. Usar `resolverGenero('[ELA_ELE]', data.genero, data.nome)` para manter o token dinâmico de gênero. Se o resolver retornar "ela", a frase fica: "Quando ela ouvir pela primeira vez, vai saber que foi você quem fez isso."

---

## MUDANÇA 3 — Microcopy do campo email

**Problema:** "Você recebe o link da música aqui também" — a palavra "link" é fria e técnica. Planta a dúvida "link? eu não vou receber no WhatsApp?" quando o quiz prometeu entrega via WhatsApp. Confunde em vez de confirmar.

**ANTES** (linha 393):
```tsx
<span className="text-[13.5px] text-[var(--teal)]/60 font-['Merriweather']">Você recebe o link da música aqui também</span>
```

**DEPOIS:**
```tsx
<span className="text-[13.5px] text-[var(--teal)]/60 font-['Merriweather']">Recebe o arquivo por aqui também, pra guardar</span>
```

**Regra:** Manter a mesma classe Tailwind. Só trocar o texto.

---

## MUDANÇA 4 — Depoimentos extras (3 cards após o CTA)

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
    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-[var(--teal)]/5 shadow-[0_4px_20px_rgba(44,93,99,0.02)]">
       <p className="font-['Merriweather'] text-[13px] sm:text-[14px] text-[var(--teal)] italic mb-2 leading-relaxed">
         "Chorei horrores ouvindo a música. Ficou perfeita, entregaram super rápido direto no WhatsApp."
       </p>
       <p className="font-['Open_Sans'] text-[11px] font-bold text-[var(--teal)]/60 uppercase tracking-wider">— Mariana S.</p>
    </div>
    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-[var(--teal)]/5 shadow-[0 4px_20px_rgba(44,93,99,0.02)]">
       <p className="font-['Merriweather'] text-[13px] sm:text-[14px] text-[var(--teal)] italic mb-2 leading-relaxed">
         "Zero burocracia. O PIX aprovou na hora e a música ficou surreal de boa! Recomendo pra todo mundo."
       </p>
       <p className="font-['Open_Sans'] text-[11px] font-bold text-[var(--teal)]/60 uppercase tracking-wider">— Pedro H.</p>
    </div>
    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-[var(--teal)]/5 shadow-[0 4px_20px_rgba(44,93,99,0.02)]">
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
{/* Depoimentes removidos — prova social já está na landing page */}
```

**Regra:** Remover todo o bloco. Não mover para outro lugar. A nota de 5 estrelas (5 svg) também sai — não faz sentido sem os depoimentos abaixo.

---

## MUDANÇA 5 — Link clicável do WhatsApp da Mônica

**Problema:** "Tem dúvida rápida? Fala com a Mônica no WhatsApp" é um link `<a>` que abre o WhatsApp e tira a pessoa da tela de conversão. Qualquer elemento clicável que não seja o CTA é uma saída. A Mônica como trust signal funciona — mas como ícone estático.

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

## MUDANÇA 6 — Stack de valor com 4 bullets + headline do bloco + separador music_cast

**Problema:** 4 bullets de valor + H3 "A música que só [A_O] [NOME] vai ter" ocupam espaço considerável antes do preço. A pessoa que chegou via quiz já sabe o que está comprando — mostrar bullets de "o que você recebe" antes do preço gera objeção desnecessária. O H3 é redundante com a headline principal da tela. O ícone music_cast no meio fragmenta visualmente sem agregar. O separador com linhas gradientes também sai.

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
```

**DEPOIS:**
```tsx
{/*
  H3 redundante removido — a headline principal da tela já personaliza.
  Stack de 4 bullets removido — a pessoa já sabe o que está comprando ao chegar aqui.
  O quiz construiu o valor. Essa tela só executa.
  Separador music_cast removido — fragmentava o bloco sem função.
*/}
```

**Regra:** Remover todo o array de 4 bullets, o H3 acima dele, e o div do music_cast com as linhas gradientes. Nada substitui — o bloco de oferta vai direto da ancoragem "Flores murcham / Chocolates somem" para o preço.

---

## MUDANÇA 7 — Bloco de ancoragem (Flores/Chocolates/Música)

**Problema:** As frases "Flores murcham em 3 dias" e "Chocolates somem em 5 minutos" estavam escondidas entre bullets e separadores. São uma das melhores frases da marca (ancoragem de preço contra presentes comuns). Devem estar juntas e visíveis, logo antes do preço. A versão anterior do prompt removia essas frases — elas ficam.

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
<div className="flex flex-col items-center gap-1 mb-8 text-center px-2">
  <span className="text-[13px] text-[var(--teal)]/50 italic font-['Merriweather']">Flores murcham em 3 dias. Chocolates somem em 5 minutos.</span>
  <span className="font-['Open_Sans'] font-extrabold text-[22px] sm:text-[24px] leading-tight text-[var(--teal)] tracking-tight mt-1">
    Essa música fica pra sempre
  </span>
</div>
```

**Regra:** Juntar as duas primeiras frases em uma única linha, com tom menor (13px, opacidade 50%). Manter "Essa música fica pra sempre" em destaque. O gap encolhe de gap-1.5 para gap-1. O mb-8 permanece. Remover o padding top/bottom individual (pt-1, pb-1) — não são mais necessários com uma linha só.

---

## MUDANÇA 8 — Placeholder do campo nome

**Problema:** Placeholder genérico "Seu nome" não contextualiza o campo dentro da jornada emocional.

**ANTES** (linha 360):
```tsx
placeholder="Seu nome"
```

**DEPOIS:**
```tsx
placeholder="Como quer ser chamado"
```

**Regra:** Apenas trocar o atributo placeholder. Nenhuma outra mudança.

---

## CHECKLIST DE VERIFICAÇÃO

Após aplicar as 8 mudanças, conferir:

- [ ] Nenhum dos 4 ícones flutuantes aparece mais (favorite, music_note, auto_awesome, straighten)
- [ ] Subheadline da headline principal mudou para cena emocional com resolverGenero
- [ ] Campo email não contém mais a palavra "link"
- [ ] Nenhum card de depoimento após o Bloco 4 (Mariana S., Pedro H., Amanda L. ausentes)
- [ ] Bloco do WhatsApp da Mônica não é mais clicável — não abre WhatsApp
- [ ] H3 "A música que só [A_O] [NOME] vai ter" foi removido
- [ ] Os 4 bullets de valor não aparecem mais (done checkmarks)
- [ ] Separador music_cast não aparece mais
- [ ] "Flores murcham em 3 dias. Chocolates somem em 5 minutos." aparece em UMA linha, itálico, tom reduzido
- [ ] "Essa música fica pra sempre" permanece em destaque
- [ ] Trust badges (PIX, Visa, Mastercard, Apple Pay, Google Pay) permanecem intactos
- [ ] CTA verde continua no mesmo lugar
- [ ] Player de áudio continua no mesmo lugar
- [ ] Placeholder do campo nome é "Como quer ser chamado"
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

As únicas mudanças permitidas são as 8 listadas acima. Nada mais.
