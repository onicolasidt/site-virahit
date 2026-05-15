# COPY — TELA DE CONVERSAO
**Versao:** v1.0
**Data:** 2026-05-08
**Status:** Pronto para desenvolvimento
**Posicao no funil:** Quiz (Tela 3) → [TELA DE CONVERSAO] → Checkout PIX
**Objetivo:** Transformar o estado emocional criado pelo quiz em decisao de compra

---

## FUNCAO DA TELA

Essa tela faz quatro coisas em sequencia, sem distracao:
1. Ancora emocionalmente — continua o estado criado no quiz
2. Remove a ultima objecao — player de audio ("como vai ficar?")
3. Apresenta a oferta — preco riscado + valor + tres linhas de prova
4. Coleta os dados do comprador — 3 campos antes do CTA

Nao e uma tela de selecao de plano. E uma tela de conversao.
Uma unica acao: garantir a musica.

---

## DADOS DISPONIVEIS VIA SESSIONSTORAGE

Todos os tokens abaixo estao disponiveis nesta tela:

| Token | Exemplo F | Exemplo M |
|---|---|---|
| [NOME] | Ana | Jorge |
| [A_O] | a | o |
| [DA_DO] | da | do |
| [ELA_ELE] | ela | ele |
| [DELA_DELE] | dela | dele |
| [A_O_PRON] | a | o |
| [AMADA_AMADO] | amada | amado |
| [estiloMusical] | Sertanejo | Gospel |
| [vozMusical] | Feminina | Masculina |

---

## BARRA DE PROGRESSO

Nao aparece nesta tela.
O quiz terminou. O progresso nao e mais relevante.

---

## BLOCO 1 — ANCORA EMOCIONAL

### Headline principal
```
A musica [DA_DO] [NOME] esta quase pronta.
```

Comportamento: headline usa tokens de genero corretamente.
Exemplos renderizados:
- "A musica da Ana esta quase pronta."
- "A musica do Jorge esta quase pronta."

### Subheadline
```
Composicao original — com a historia de voces, do jeito que [ELA_ELE] gosta de ouvir.
Entrega em 24h pelo WhatsApp.
```

Tipografia headline: Open Sans, weight 800, uppercase, cor teal (#2C5D63)
Tipografia sub: Merriweather, serif, cor teal 70%
Alinhamento: centralizado, mobile-first

---

## BLOCO 2 — PLAYER DE AUDIO

### Copy acima do player
```
Ouca como fica antes de finalizar.
```

Tipografia: Merriweather, serif, 14px, teal 70%, centralizado

### Comportamento do player
- 1 player de audio de exemplo real
- Selecionado automaticamente com base no [estiloMusical] salvo no quiz
- Se o estilo selecionado nao tiver audio disponivel: fallback para o player de Sertanejo
- Player visual: minimalista, fundo cream, borda teal, botao play gold
- Duracao maxima do audio: 45 segundos (exemplo representativo, nao musica completa)

### Copy abaixo do player
```
Sua musica vai ser unica — essa e so um exemplo do que a gente produz.
```

Tipografia: Merriweather, serif, 12px, teal 50%, centralizado, italico

---

## BLOCO 3 — OFERTA

### Badge de oferta
```
OFERTA DE LANCAMENTO
```
Visual: badge pill, fundo gold (#EAA115), texto branco, Open Sans 800, uppercase, 12px
Posicao: centralizado, acima do bloco de preco

### Bloco de preco
```
~~R$ 97~~ por R$ 47
```
Visual:
- R$97: riscado, cor teal 40%, tamanho menor (18px)
- "por": Merriweather, 14px, teal 70%
- R$47: Open Sans 800, 36px, cor teal (#2C5D63)
- Centralizado

### Tres linhas de valor
```
✓  Composicao original com a historia de voces
✓  Entrega em ate 24h direto no seu WhatsApp
✓  Garantia 7 dias — nao gostou, devolvemos tudo
```

Visual: lista sem bullet numerico, icone check gold, Merriweather 14px, teal
Espacamento entre linhas: generoso (24px de gap)

---

## BLOCO 4 — FORMULARIO

### Headline do formulario
```
Para onde enviamos sua musica?
```
Tipografia: Open Sans 700, 18px, teal, uppercase
Margem topo: 32px (separacao clara do bloco de oferta)

---

### CAMPO 1 — Nome do comprador

Label:
```
Seu nome
```

Placeholder:
```
Ex: Claudia, Marcia, Rogerio...
```

Tipo: texto
Limite: 100 caracteres
Obrigatorio: sim
Nota abaixo: nenhuma

Comportamento:
- Campo de texto simples
- Autofocus na entrada da tela (mobile: nao — evitar teclado automatico em mobile)
- Voice input disponivel (botao microfone discreto lado direito do campo)
- Auto-save: sim (localStorage, chave "compradorNome")

---

### CAMPO 2 — WhatsApp do comprador

Label:
```
Seu WhatsApp
```

Placeholder:
```
(11) 99999-9999
```

Micro-copy abaixo do campo:
```
E por aqui que a musica chega.
```

Tipo: tel
Mascara: (XX) XXXXX-XXXX
Validacao: minimo 10 digitos apos strip de mascaras
Obrigatorio: sim

Comportamento:
- Input type="tel" para abrir teclado numerico em mobile
- Mascara aplicada automaticamente
- Voice input: NAO disponivel (numero de telefone via voz e impreciso)
- Auto-save: sim (localStorage, chave "compradorWhatsApp")

---

### CAMPO 3 — Email do comprador

Label:
```
Seu email
```

Placeholder:
```
seuemail@gmail.com
```

Micro-copy abaixo do campo:
```
Para o comprovante de pagamento.
```

Tipo: email
Validacao: formato valido (regex padrao)
Obrigatorio: sim

Comportamento:
- Input type="email"
- Voice input: NAO disponivel
- Auto-save: sim (localStorage, chave "compradorEmail")

---

### Nota de privacidade (abaixo dos 3 campos)
```
Seus dados sao usados so para criar e entregar sua musica.
```

Tipografia: Merriweather, 11px, teal 50%, centralizado
Sem link de politica de privacidade (lancamento — adicionar depois)

---

## ORDER BUMP

Posicao: entre o formulario e o CTA
Elemento: checkbox customizado

### Visual do order bump
Box com borda esquerda gold 3px, fundo gold/8, border-radius 8px, padding 16px

### Copy do order bump
```
[ ] Adicionar segunda versao por +R$ 27

Pra voce ter mais opcao antes de mandar pra [ELA_ELE].
```

Comportamento:
- Checkbox desmarcado por padrao
- Clicar em qualquer area do box marca/desmarca
- Quando marcado: valor total atualiza dinamicamente no CTA ("por R$ 74 →")
- Token [ELA_ELE] renderiza corretamente conforme genero salvo

---

## CTA PRINCIPAL

### Copy do botao

Estado padrao (order bump desmarcado):
```
Garantir a musica [DA_DO] [NOME] por R$ 47 →
```

Estado com order bump marcado:
```
Garantir a musica [DA_DO] [NOME] por R$ 74 →
```

Exemplos renderizados (order bump desmarcado):
- "Garantir a musica da Ana por R$ 47 →"
- "Garantir a musica do Jorge por R$ 47 →"

Visual:
- Fundo: gold (#EAA115)
- Texto: branco, Open Sans 800, uppercase
- Border-radius: pill (9999px)
- Largura: 100% (mobile) / max 480px centralizado (desktop)
- Padding: 18px 32px
- Hover: #C99A3C + scale 1.05
- Sombra: box-shadow 0 4px 16px rgba(234,161,21,0.3)

Comportamento do CTA:
- Desabilitado se qualquer campo obrigatorio estiver vazio ou invalido
- Estado desabilitado: fundo gold/40, cursor not-allowed, sem hover effect
- Ao clicar: loading spinner no lugar do texto — "Aguardando..." (previne double-click)
- Ao clicar: dados do comprador + order bump + todos os dados do quiz gravados no Baserow
- Redireciona para Checkout PIX

---

## RODAPE — MONICA

Posicao: abaixo do CTA, separacao de 32px

### Copy
```
Ficou com duvida? Fale com a Monica no WhatsApp →
```

Abaixo, em texto menor:
```
Atendimento: seg a sex, das 9h as 18h
```

Tipografia link: Merriweather, 13px, teal (#2C5D63), sublinhado discreto
Tipografia horario: Merriweather, 11px, teal 50%
Alinhamento: centralizado

Comportamento:
- Link abre WhatsApp com mensagem pre-configurada
- Mensagem pre-configurada: "Oi Monica! Tenho uma duvida sobre a musica personalizada."
- Abre em nova aba (target="_blank")

---

## ESTADO DE ERRO — FORMULARIO

Se o usuario clicar no CTA com campos invalidos:
- Campo invalido: borda vermelha (#E53935) + shake animation sutil (200ms)
- Mensagem abaixo do campo invalido:
  - Nome vazio: "Qual e o seu nome?"
  - WhatsApp invalido: "Confere o numero — parece que tem algo errado."
  - Email invalido: "Confere o email — parece que tem algo errado."
- Sem alert/modal — erro inline, abaixo do campo

---

## ESTADO DE LOADING — CTA CLICADO

Ao clicar no CTA com formulario valido:
1. Botao exibe spinner + texto "Aguardando..."
2. Dados salvos no Baserow (chamada API)
3. Redirect para /checkout
4. Se API falhar: botao volta ao estado normal + toast de erro inferior:
   "Algo deu errado. Tenta de novo."
   (fundo #E53935, texto branco, pill, 4 segundos)

---

## CHECKLIST DE COPY

- [ ] Nenhum placeholder generico ("Digite aqui") — todos os placeholders dao exemplos concretos
- [ ] "Comprar" nao aparece em lugar nenhum — CTA usa "Garantir"
- [ ] Tokens de genero usados corretamente em todos os campos dinamicos
- [ ] Uma unica acao principal na tela (CTA)
- [ ] Preco aparece antes do formulario — usuario processou a objecao de valor antes de preencher
- [ ] Micro-copy dos campos orienta sem assustar
- [ ] Nota de privacidade presente mas discreta
- [ ] Monica no rodape — escape emocional para quem hesita, nao CTA competindo

---

## NOTAS PARA O DEV

1. Todos os dados do sessionStorage/localStorage do quiz devem estar disponiveis antes desta tela renderizar. Se nao estiverem (usuario acessou URL diretamente), redirecionar para o inicio do quiz.
2. Order bump altera o valor no CTA dinamicamente — sem reload de pagina.
3. Audio do player: hospedar na CDN propria. Nao usar SoundCloud/YouTube (autoplay policies).
4. Antes de redirecionar para o checkout, todos os dados (quiz + comprador + order bump) devem ser persistidos no Baserow com status "pre_checkout". Isso permite recuperacao de carrinho.
5. Campo WhatsApp: salvar sem mascara no Baserow (so digitos + DDI 55).
