# COPY — LANDING PAGE VIRAHIT
# Versão: 1.0 | Data: maio 2026
# Status: APROVADO PARA IMPLEMENTAÇÃO
# URL alvo: https://virahit.ai
# Funil: Landing → Quiz → Tela de Conversão → Checkout → Pós-pagamento

---

## INSTRUÇÕES PARA O DEV

### O que muda no fluxo
- Todos os CTAs que apontavam para WhatsApp agora apontam para `/quiz`
- Preço exibido: R$47 (não R$97)
- Seção "Como Funciona" foi reescrita para o fluxo do quiz
- Nova seção "Imagine essa cena" inserida antes do CTA final
- WhatsApp permanece APENAS no footer como suporte (não como canal de venda)

### Design system (não alterar)
- Fundo: `#F4EEDC` (cream — nunca branco)
- Cor primária: `#2C5D63` (teal)
- CTA / Destaque: `#EAA115` (gold)
- Fonte headings: Open Sans 800, UPPERCASE, letter-spacing -0.02em
- Fonte corpo: Merriweather, serif
- Botão CTA: pill (border-radius 9999px), fundo gold, texto branco, height 56px
- Hover: `#C99A3C` + scale 1.05

### Seções existentes que NÃO mudam
- Estrutura HTML/CSS das seções (só o texto muda)
- Depoimentos Bruno, Amanda e Fernando (texto inalterado)
- FAQ (estrutura accordion, adicionar 2 perguntas novas — ver Seção 8)
- Footer (manter links existentes)

---

## SEÇÃO 1 — HEADER / NAV

```
[LOGO ViraHit]                          [★★★★★ +1.200 famílias emocionadas]
```

**Botão WhatsApp no header:** REMOVER como CTA principal.
Substituir por link discreto: `Suporte` → abre WhatsApp (texto: "Oi, preciso de ajuda")

---

## SEÇÃO 2 — HERO

### Barra de credibilidade (acima do hero)
```
★★★★★ (4.9)  •  +1.200 músicas entregues  •  Entrega em até 24h
```

### Headline (manter exatamente como está)
```
SUA HISTÓRIA
VIRA MÚSICA
```
- Font: Open Sans 800, UPPERCASE
- Cor: `#2C5D63`
- Tamanho: clamp(2.8rem, 11vw, 4.5rem)

### Sub-headline (SUBSTITUIR — era "Mande um áudio no WhatsApp...")

**Versão principal:**
```
Você responde 4 perguntinhas sobre a história de vocês.
Em 24h, chega uma música com o nome dela — do jeito que vocês viveram isso.
Por R$47, você dá um presente que nenhuma loja do mundo tem igual.
```

- Font: Merriweather, 17px, cor `#2C5D63` a 80%
- Sem maiúsculas
- Sem ponto final na última linha (mantém o leitor descendo)

### CTA principal (SUBSTITUIR destino)
```
[  🎵  CRIAR MINHA MÚSICA PERSONALIZADA  ]
```
- Destino: `/quiz` (não WhatsApp)
- Estilo: botão pill gold completo, largura 100% no mobile
- Tamanho fonte: 16px, Open Sans 700, branco

### Subscrito abaixo do CTA
```
Leva menos de 3 minutos  •  Recebe em até 24h  •  Garantia de 7 dias
```
- Font: Open Sans 13px, `#2C5D63` a 60%
- Sem ícones, sem maiúsculas

### Prova social abaixo do subscrito
```
★★★★★  +1.200 famílias emocionadas
```

---

## SEÇÃO 3 — PARA QUAL MOMENTO ESPECIAL?

**Título da seção:**
```
PARA QUAL MOMENTO ESPECIAL?
```

**Subtítulo:**
```
Clique e já começamos pelo que importa pra você
```

**Cards (grid 2x4 mobile / row de 8 desktop):**

| Emoji | Label | Ao clicar |
|-------|-------|-----------|
| ❤️ | Amor | `/quiz?ocasiao=amor` |
| 💍 | Casamento | `/quiz?ocasiao=casamento` |
| 🎂 | Aniversário | `/quiz?ocasiao=aniversario` |
| 👩 | Mãe | `/quiz?ocasiao=mae` |
| 👨 | Pai | `/quiz?ocasiao=pai` |
| 👶 | Filho/a | `/quiz?ocasiao=filho` |
| 🤝 | Amizade | `/quiz?ocasiao=amizade` |
| 🎓 | Formatura | `/quiz?ocasiao=formatura` |

**Comportamento:** ao clicar em qualquer card, redireciona para `/quiz` com o parâmetro `ocasiao` pré-selecionado na Tela 1 do quiz.

---

## SEÇÃO 4 — O DESAFIO

**Rótulo de seção:**
```
O DESAFIO
```

**Headline:**
```
VOCÊ QUER DAR ALGO INESQUECÍVEL. MAS...
```

**Dor 1 — headline:**
```
NÃO SABE O QUE DAR DE PRESENTE?
```
**Dor 1 — corpo:**
```
Flores murcham. Chocolate acaba. Roupa ela já tem.
Você quer algo que ela guarde pra sempre — e não sabe como chegar lá.
```
> NOTA DEV: "ela" é genérico aqui — não usa token de gênero, é copy estático da landing

**Dor 2 — headline:**
```
NÃO QUER GASTAR UMA FORTUNA?
```
**Dor 2 — corpo:**
```
Presente de verdade no shopping custa caro — e você ainda enfrenta trânsito, fila e estacionamento.
Aqui, por R$47, você entrega emoção pura. E sobra dinheiro pro jantar.
```

**Dor 3 — headline:**
```
TÁ SEM TEMPO E SEM IDEIA?
```
**Dor 3 — corpo:**
```
Você não precisa escrever nada elaborado.
Responde um quiz rápido de 4 perguntas sobre ela.
A gente transforma em música. Pronto em 24h.
```

---

## SEÇÃO 5 — COMO FUNCIONA

**Rótulo de seção:**
```
SIMPLES E RÁPIDO
```

**Headline:**
```
COMO FUNCIONA
```

**Subtítulo:**
```
(É mais fácil do que parece)
```

### Passo 01
**Título:**
```
CONTA A HISTÓRIA DE VOCÊS
```
**Corpo:**
```
Responde um quiz rapidinho — leva menos de 5 minutos.
Nome, ocasião especial, estilo musical que ela ama
e um momento que só vocês dois sabem.
Sem escrever redação. Sem complicar.
A gente pergunta, você responde.
```

### Passo 02
**Título:**
```
A MÚSICA NASCE
```
**Corpo:**
```
Com tudo que você contou, a música é criada do zero —
letra, melodia e arranjo no estilo que você escolheu:
Sertanejo, Gospel, Pagode, Forró ou MPB.

Essa canção não existia antes.
Agora ela só existe por causa de vocês.
```

### Passo 03
**Título:**
```
VOCÊ SURPREENDE QUEM AMA
```
**Corpo:**
```
Em até 24h, a música chega pra você.
Você manda pelo WhatsApp, coloca pra tocar na hora do jantar,
ou aparece de surpresa com ela tocando.

O que acontece depois — você vai querer ter filmado.
```

---

## SEÇÃO 6 — POR QUE A VIRAHIT É DIFERENTE

**Rótulo de seção:**
```
QUALIDADE DE ESTÚDIO
```

**Headline:**
```
POR QUE A VIRAHIT É DIFERENTE
```

### Card 1 — Feita pra chorar (de emoção)
**Título:**
```
FEITA PRA CHORAR (DE EMOÇÃO)
```
**Corpo:**
```
Não é playlist. Não é cover.
É uma música que só existe por causa da história de vocês.
Cada palavra, cada nota.
```

**Bullets (SUBSTITUIR os 3 genéricos):**
```
✦  Essa música só existe porque VOCÊ pediu.
   Não tem igual em nenhuma loja, em nenhum site, em lugar nenhum do mundo.

✦  Ela não vai guardar numa gaveta.
   Vai ouvir de novo. E de novo.
   E toda vez que ouvir, vai lembrar de você.

✦  Você não precisa saber escrever nem ter ideia nenhuma.
   Responde o quiz, a gente faz o resto. Em 24h.
```

### Card 2 — Pronta em 24h — de verdade
**Título:**
```
PRONTA EM 24H — DE VERDADE
```
**Corpo:**
```
Você faz o pedido agora. Amanhã a música já tá na sua mão.
Sem espera. Sem "previsão de entrega".
```

### Card 3 — A música é sua
**Título:**
```
A MÚSICA É SUA
```
**Corpo:**
```
Pode postar no Instagram, mandar no grupo da família,
tocar no aniversário. Sem medo de bloqueio.
É sua pra sempre.
```

---

## SEÇÃO 7 — TABELA COMPARATIVA

**Headline:**
```
COMPARE E VEJA A DIFERENÇA
```

| RECURSO | PRESENTE NORMAL | VIRAHIT |
|---------|----------------|---------|
| Custo | R$ 150–300 | R$ 47 |
| O que sobra | Nada (acaba/murcha) | Música pra sempre |
| Tempo | Horas no shopping | 5 minutos no quiz |
| Diferente? | Todo mundo dá igual | Só existe pra vocês |
| Facilidade | Fila, trânsito, loja | Do celular, de casa |

> NOTA DEV: remover a linha anterior "Feito no WhatsApp" da tabela — substituída por "5 minutos no quiz"

---

## SEÇÃO 8 — HISTÓRIAS REAIS, LÁGRIMAS REAIS (Depoimentos)

**Rótulo de seção:**
```
COMUNIDADE
```

**Headline:**
```
O QUE ACONTECE QUANDO ALGUÉM OUVE "SUA" MÚSICA
```

**Subtítulo (SUBSTITUIR):**
```
Não foi a gente que disse que funciona.
Foram eles — depois de apertar o play pela primeira vez.
```

**Contagem:**
```
1.200+ histórias transformadas em música.
```

### Depoimentos (manter textos exatamente como estão)

**Bruno — São Paulo, SP:**
```
"Minha esposa chorou muito quando dei o play no carro.
Foi o melhor presente de aniversário que já dei pra ela na vida."
```

**Amanda — Curitiba, PR:**
```
"Eu tava com muito medo de ficar com voz de robô, sabe?
Mas ficou perfeito, parece que foi gravado num estúdio de verdade!"
```

**Fernando — Rio de Janeiro, RJ:**
```
"Esqueci o nosso aniversário e fiz o pedido de manhã desesperado.
De tarde a música já tava no meu WhatsApp. Me salvou demais!"
```

> NOTA DEV: se tiver foto ou avatar dos depoentes, adicionar. Aumenta credibilidade percebida em tráfego frio.

---

## SEÇÃO 9 — PLAYERS DE ÁUDIO

**Rótulo de seção:**
```
OUÇA EXEMPLOS REAIS
```

**Headline:**
```
COMO UMA MÚSICA DESSAS SONA
```

**Subtítulo:**
```
Essas músicas foram feitas pra outras pessoas.
A música da sua pessoa vai ser feita com a história de vocês.
```

**Players (3 cards):**

Card 1:
```
🎵  Sertanejo
Para Ana — Aniversário
[barra de progresso]  1:23 / 3:45
[botão play gold]
```

Card 2:
```
🎵  Gospel
Para Vovó Rosa — Aniversário de 80 anos
[barra de progresso]  0:52 / 4:01
[botão play gold]
```

Card 3:
```
🎵  Pagode
Para Roberto — Casamento
[barra de progresso]  1:47 / 3:12
[botão play gold]
```

> NOTA DEV: áudios carregam lazy (sob demanda). Se os arquivos de áudio ainda não existirem, usar placeholder e esconder essa seção até ter os arquivos reais. NÃO exibir players sem áudio real.

---

## SEÇÃO 10 — GARANTIA

**Visual:** box com fundo `#2C5D63` a 5%, borda 2px `#2C5D63` a 20%, border-radius 2xl, ícone escudo gold 32px

**Headline:**
```
SE ELA OUVIR E NÃO SENTIR NADA, VOCÊ NÃO PAGA
```

**Corpo:**
```
Você tem 7 dias depois de receber a música.
Se não rolar aquele arrepio — sabe aquele? —
é só falar e a gente devolve tudo.
Sem burocracia. Sem explicação. Sem pergunta.

A gente confia tanto nessa música que oferece isso sem medo nenhum.
Só que isso nunca aconteceu por aqui.
```

> NOTA DEV: remover o "PAGAMENTO SEGURO" e "SELO DE QUALIDADE" que aparecem dentro dessa seção hoje — ficam desconexos visualmente. A garantia fala por si mesma.

---

## SEÇÃO 11 — IMAGINE ESSA CENA (NOVA SEÇÃO)

> NOVA SEÇÃO — inserir entre a Garantia e o CTA Final

**Visual:** fundo `#2C5D63` escuro, texto cream, sem border, sem box. Largura total da página. Padding generoso.

**Headline:**
```
IMAGINE ESSA CENA
```
- Font: Open Sans 800, UPPERCASE, cream, 28–36px

**Corpo:**
```
Você manda a música pra ela às 7 da manhã.

Ela abre enquanto está no carro, a caminho do trabalho.
Ouve o primeiro verso — e é o nome dela.
A história de vocês. Aquele momento que só vocês dois sabem.

Ela para tudo.
Ouve de novo.
Manda pro grupo da família.
Liga pra você chorando.

Isso não é exagero.
É o que acontece quando um presente fala diretamente
do coração de quem dá pra quem recebe.

A música que você está prestes a criar
só vai existir por causa dessa história.
Ninguém mais no mundo vai ter essa música.

Você só precisa responder algumas perguntas sobre ela.
A gente cuida do resto.
```
- Font: Merriweather, 16–18px, cream a 90%
- "Ela para tudo." / "Ouve de novo." / "Manda pro grupo da família." / "Liga pra você chorando." — cada linha separada, sem parágrafo. Ritmo de lista emocional.

---

## SEÇÃO 12 — CTA FINAL

**Visual:** fundo cream, centralizado, padding grande

**Headline:**
```
DAQUI 24H, ALGUÉM VAI CHORAR POR SUA CAUSA
```
- Font: Open Sans 800, UPPERCASE, `#2C5D63`, 28–36px
- MANTER EXATAMENTE COMO ESTÁ — é a melhor linha do site

**CTA (SUBSTITUIR destino):**
```
[  🎵  CRIAR MINHA MÚSICA PERSONALIZADA  ]
```
- Destino: `/quiz`
- Estilo: pill gold completo, largura máxima 480px centralizado
- Font: Open Sans 700, 16px, branco

**Subscrito abaixo do CTA:**
```
Leva menos de 3 minutos  •  Recebe em até 24h  •  R$47  •  Garantia de 7 dias
```
- Font: Open Sans 13px, `#2C5D63` a 60%

---

## SEÇÃO 13 — FAQ

**Headline:**
```
DÚVIDAS FREQUENTES
```

**Manter as perguntas existentes + ADICIONAR estas 2:**

**Pergunta nova 1:**
```
Como funciona o quiz?
```
**Resposta:**
```
É simples. Você responde 4 perguntas sobre a pessoa que vai receber a música:
pra quem é, o nome dela, o estilo musical que ela ama e um detalhe da história de vocês.
Leva menos de 5 minutos. No final, você confirma o pedido e paga por R$47.
A música chega no seu WhatsApp em até 24h.
```

**Pergunta nova 2:**
```
Preciso criar conta ou me cadastrar?
```
**Resposta:**
```
Não. Você preenche o quiz, paga e recebe a música.
Sem cadastro, sem senha, sem complicação.
```

---

## FOOTER

**Manter estrutura atual.** Apenas ajustar:

- "Suporte WhatsApp" no footer: manter — WhatsApp continua como canal de suporte
- Remover qualquer referência a "venda pelo WhatsApp" no footer

**Tagline do footer (SUBSTITUIR):**

ANTES:
```
Música personalizada feita com carinho. Transformando histórias em emoção — direto no seu WhatsApp.
```

DEPOIS:
```
Música personalizada feita com carinho.
Uma história, uma música. Só sua.
```

---

## RESUMO DAS ALTERAÇÕES PARA O DEV

| # | Elemento | Ação | Prioridade |
|---|----------|------|-----------|
| 1 | Todos os CTAs | Destino: `/quiz` (não WhatsApp) | CRÍTICO |
| 2 | Preço R$97 | Corrigir para R$47 em todo o site | CRÍTICO |
| 3 | Sub-headline hero | Substituir pelo novo texto | CRÍTICO |
| 4 | Seção "Como Funciona" | Reescrever os 3 passos | CRÍTICO |
| 5 | Seção "Imagine essa cena" | Criar nova seção antes do CTA final | ALTO |
| 6 | Bullets "Por que somos diferentes" | Substituir os 3 genéricos | ALTO |
| 7 | Garantia | Substituir headline e corpo | ALTO |
| 8 | Subtítulo depoimentos | Substituir | MÉDIO |
| 9 | Tabela comparativa | Remover "Feito no WhatsApp", adicionar "5 minutos no quiz" | MÉDIO |
| 10 | FAQ | Adicionar 2 perguntas novas | MÉDIO |
| 11 | Tagline footer | Substituir | BAIXO |
| 12 | Botão WhatsApp header | Mover para suporte discreto | BAIXO |

---

## O QUE NÃO MEXER

- Headline hero: "SUA HISTÓRIA VIRA MÚSICA"
- "Flores murcham. Chocolate acaba. Roupa ela já tem." — ritmo perfeito, manter
- "É uma música que só existe por causa da história de vocês." — manter
- "DAQUI 24H, ALGUÉM VAI CHORAR POR SUA CAUSA" — melhor linha do site, não tocar
- Textos dos depoimentos Bruno, Amanda e Fernando — manter exatamente como estão
- Estrutura de design (cores, fontes, espaçamentos)
- Footer com links legais e redes sociais

---

*COPY-LANDING-VIRAHIT-v1.md — gerado em maio 2026*
*Próxima revisão após primeiros dados de conversão do funil quiz*
