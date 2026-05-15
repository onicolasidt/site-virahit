# BRIEFING — TELA DE CONVERSAO + CHECKOUT + POS-PAGAMENTO
**Data:** 2026-05-08
**Objetivo:** Documento de contexto para nova sessao de copy
**Telas a criar:** Tela de Conversao / Checkout PIX / Pos-pagamento
**Base:** Tudo decidido e estudado na sessao de 2026-05-08

---

## 1. CONTEXTO DO PRODUTO

**Produto:** Musica personalizada como presente emocional
**Preco:** R$47 unico (preco de lancamento)
**Ancoragem:** R$97 riscado + badge "Oferta de Lancamento"
**Entrega:** 24h pelo WhatsApp + email
**Garantia:** 7 dias — nao gostou, recompoe ou devolve tudo sem discussao
**Stack de pagamento:** WOOVI (PIX) — sem cartao no lancamento
**Entrega pos-pagamento:** WhatsApp API + email automatico

---

## 2. ARQUITETURA COMPLETA DO FUNIL

```
[Meta Ads — trafego frio]
         ↓
[Landing Page]
  - Headline depoimento-aspas (voz do cliente)
  - "Flores murcham. Chocolates somem. A musica fica para sempre."
  - Videos de reacao ("Historias reais, lagrimas reais")
  - Players de audio (3 musicas reais)
  - Carrossel de ocasioes
  - Garantia 7 dias visivel
  - "a partir de R$47" visivel
  - CTA: "Criar minha musica personalizada"
         ↓
[QUIZ — 3 telas]
  Tela 1: Vinculo (8 cards) + Nome + Genero (Ela/Ele)
  Tela 2: Estilo (8 cards + preview audio) + Voz (Feminina/Masculina)
  Tela 3: Campo A (habito/frase) + Campo B (cena/momento) + Campo C (intencao chips)
  CTA final: "Criar a musica [DA_DO] [NOME] →"
         ↓
[TELA DE CONVERSAO] ← CRIAR NESTA SESSAO
         ↓
[CHECKOUT PIX] ← CRIAR NESTA SESSAO
         ↓
[POS-PAGAMENTO] ← CRIAR NESTA SESSAO
         ↓
[Entrega automatica WhatsApp + email em 24h]
```

---

## 3. DADOS JA COLETADOS NO QUIZ (disponíveis para usar nas proximas telas)

Todos salvos em sessionStorage e enviados ao Baserow pos-pagamento:

| Dado | Tipo | Obrigatorio |
|---|---|---|
| vinculoDestinatario | string (Mae/Pai/Parceiro/a etc) | Sim |
| nomeDestinatario | string | Sim |
| generoDestinatario | 'F' ou 'M' | Sim |
| estiloMusical | string | Sim |
| vozMusical | string | Sim |
| historiaA | texto 300 chars ou audio | Nao |
| historiaB | texto 300 chars ou audio | Nao |
| intencaoEmocional | array de chips selecionados | Nao |

**Tokens dinamicos disponiveis:**
[NOME] [A_O] [DA_DO] [ELA_ELE] [DELA_DELE] [A_O_PRON] [AMADA_AMADO]

Exemplo feminino (Ana): "A musica da Ana esta quase pronta."
Exemplo masculino (Jorge): "A musica do Jorge esta quase pronta."

---

## 4. DECISOES TOMADAS — TELA DE CONVERSAO

### O que e essa tela
Fica entre o quiz e o checkout. Nao e "selecao de plano" (sem multiplos planos).
E uma tela de CONVERSAO — transforma o estado emocional criado pelo quiz em decisao de compra.
Faz quatro coisas em sequencia:
1. Ancora emocionalmente (continua o estado do quiz)
2. Remove a ultima objecao (players de audio — "como vai ficar?")
3. Apresenta a oferta (preco riscado + valor + garantia)
4. Coleta os dados do comprador (Nome + WhatsApp + Email)

### Estrutura decidida

**BLOCO 1 — Ancora emocional**
Headline: "A musica [DA_DO] [NOME] esta quase pronta."
Sub: "Composicao original — com a historia de voces, do jeito que [ELA_ELE] gosta de ouvir. Entrega em 24h pelo WhatsApp."

**BLOCO 2 — Players de audio**
1 player de audio de exemplo real (do mesmo estilo escolhido no quiz, se possivel)
Copy acima: "Ouca como fica antes de finalizar."
Copy abaixo do player: "Sua musica vai ser unica — essa e so um exemplo do que a gente produz."
Isso remove a objecao "como vai ficar?" antes do pagamento.
Este e o elemento de maior impacto de conversao identificado na analise da NossaCancao.

**BLOCO 3 — Oferta**
Badge: [ OFERTA DE LANCAMENTO ]
Preco: ~~R$97~~ por R$47
Tres linhas de valor:
- Composicao original com a historia de voces
- Entrega em ate 24h direto no seu WhatsApp
- Garantia 7 dias — nao gostou, devolvemos tudo

**BLOCO 4 — Formulario (3 campos)**
Headline: "Para onde enviamos sua musica?"
Campo 1: Seu nome
Campo 2: Seu WhatsApp — micro-copy: "E por aqui que a musica chega"
Campo 3: Seu email — micro-copy: "Para o comprovante de pagamento"
Privacidade: "Seus dados sao usados so para criar e entregar sua musica."

**ORDER BUMP (checkbox entre formulario e CTA)**
[ ] Adicionar segunda versao por +R$27
Copy: "Pra voce ter mais opcao antes de mandar pra [ELA_ELE]."

**CTA unico**
"Garantir a musica [DA_DO] [NOME] por R$47 →"
O preco no botao e o ultimo anchor — quem clica ja decidiu. Zero surpresa no checkout.

**Monica no rodape (discreto)**
"Ficou com duvida? Fale com a Monica no WhatsApp →"
Link abre WhatsApp com mensagem pre-configurada.
Horario de atendimento visivel abaixo.

### Por que mostrar o preco ANTES de pedir os dados
Decisao baseada em benchmark de CRO:
- Mostrar preco DEPOIS dos dados = choque no checkout = abandono com irritacao
- Mostrar preco ANTES dos dados = usuario ja processou a objecao de valor antes de preencher
- Taxa que importa: nao e quantos preenchem o formulario, e quantos pagam o PIX depois
- Um formulario com 60% de preenchimento e 35% de conversao em pagamento supera 80% de preenchimento e 10% de conversao

---

## 5. DECISOES TOMADAS — CHECKOUT PIX

### O que e essa tela
Tela tecnica de pagamento. So o necessario para o PIX ser gerado e confirmado.
Sem distracao. Sem novo conteudo de venda (a venda ja foi feita na tela anterior).

### Estrutura decidida

**Resumo personalizado no topo**
"Sua musica para [A_O] [NOME]"
Linha abaixo: Estilo: [estilo] · Voz: [voz] · Entrega: 24h pelo WhatsApp

**QR Code PIX (gerado automaticamente)**
Gerado via WOOVI assim que a pagina carrega (dados ja vieram da tela anterior)
QR Code centralizado, 200x200px
Valor: R$47,00 (ou R$74,00 se order bump marcado)
Timer regressivo: "PIX valido por 15:00"
Botao: "Copiar codigo PIX"
Polling a cada 3 segundos para confirmar pagamento

**Modo Discreto**
Toggle: "E um presente surpresa?"
Quando ativo: "Nao mencionamos o valor na mensagem de entrega."

**Garantia em destaque**
Box com icone de escudo:
"Garantia 7 dias — nao gostou, devolvemos tudo. Sem perguntas."

**Urgencia contextual**
"Entrega garantida ate [DATA DINAMICA — hoje + 1 dia util]"

**Trust signals (sem botao clicavel)**
Icone WhatsApp pequeno + "Duvidas? WhatsApp disponivel."
Logo WOOVI / Pagamento 100% Seguro

### O que NAO aparece no checkout
- Nenhum novo campo de dados (todos ja foram coletados na tela anterior)
- Nenhum botao flutuante de chat (so icone estatico passivo)
- Nenhum conteudo de venda novo
- Sem CPF (nao obrigatorio para PIX abaixo de R$200 sem NF-e)

---

## 6. DECISOES TOMADAS — POS-PAGAMENTO

### O que e essa tela
Confirma o pedido, transmite seguranca, abre para upsell de segunda musica.

### Estrutura decidida

**Confirmacao personalizada**
Icone de check animado (verde)
Titulo: "Pedido confirmado!"
Mensagem: "Sua musica para [A_O] [NOME] esta sendo criada agora."
Sub: "Voce recebe pelo WhatsApp e email em ate 24h."

**O que acontece agora (lista numerada)**
1. Nossa equipe ja recebeu seu pedido
2. A musica de [NOME] sera composta e entregue em ate 24h
3. Voce recebe no WhatsApp [numero do comprador] e no email [email do comprador]
4. Duvidas? A Monica esta no WhatsApp

**Upsell — Segunda musica**
Box de destaque com timer (10 minutos):
"Aproveite: crie uma segunda musica por apenas R$37."
"Para outra pessoa especial. Os dados do quiz podem ser alterados."
CTA: "Quero uma segunda musica por R$37"
Timer: "Oferta valida por [countdown 10 minutos]"

**Detalhes do pedido**
Resumo compacto: plano, valor pago, ocasiao, estilo, numero do pedido (ID WOOVI)

**Compartilhar (opcional)**
"Contar para uma amiga →" — abre WhatsApp com mensagem pre-configurada

**Monica disponivel**
Botao visivel (nao flutuante):
"A Monica esta no WhatsApp para qualquer duvida →"

---

## 7. REGRAS DE COPY — VALEM PARA TODAS AS TELAS

**Nunca usar:**
- "Comprar" — sempre "Criar", "Garantir", "Finalizar"
- "Nossa IA", "plataforma", "tecnologia avancada"
- "Para nao dar erro", "para nao perder"
- Placeholders genericos ("Digite aqui")
- Tom defensivo ou explicacao de processo antes do pagamento
- Frases que levantam objecoes que o usuario nao tinha
- Dois CTAs competindo na mesma tela

**Sempre usar:**
- Nome do destinatario com genero correto ([NOME] + tokens de genero)
- Especificidade concreta em vez de abstratos vazios
- Voz brasileira proxima — "a gente", "voce", sem corporativo
- Uma acao principal por tela

---

## 8. DESIGN SYSTEM (referencia rapida)

Fundo: #F4EEDC (cream)
Primaria: #2C5D63 (teal)
CTA / Destaque: #EAA115 (gold)
Tipografia headings: Open Sans 800, uppercase
Tipografia corpo: Merriweather, serif
Botao primario: fundo gold, texto branco, border-radius pill
Mobile-first: 375px base

---

## 9. ANALISE COMPETITIVA (resumo para referencia)

**NossaCancao:** melhor copy emocional, headline-depoimento, players de audio no pre-checkout sao o maior diferencial de conversao, 3 planos com ancoragem, sem PIX.
**Eternisom:** melhor UX, PIX pre-selecionado, campos opcionais, voice input, auto-save, checkout em pagina unica, Modo Discreto.
**ViraHit Opcao C:** melhor dos dois + identidade 100% brasileira + urgencia real + prova social verificavel + entrega automatica.

---

## 10. DOCUMENTOS DE REFERENCIA COMPLETOS

Todos em /home/hermes_general/empresa/funil-web/:
- COPY-QUIZ-VIRAHIT-v1.md — copy completa do quiz (3 telas) aprovada
- DEV-PROMPT-GENERO-DINAMICO-QUIZ-v1.md — spec tecnica do genero dinamico
- PRD.md — especificacao tecnica completa do produto
- wireframes-funil.md — wireframes de todas as telas
- COMPARATIVO-FUNIS.md — analise NossaCancao vs Eternisom (42kb)

Contexto base do produto:
- /home/hermes_general/empresa/CONTEXTO-BASE-VIRAHIT.md
