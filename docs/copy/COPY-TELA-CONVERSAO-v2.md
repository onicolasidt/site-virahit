# COPY — TELA DE CONVERSAO
**Versao:** v2.0
**Data:** 2026-05-08
**Status:** Pronto para desenvolvimento
**Posicao no funil:** Quiz (Tela 3) → [TELA DE CONVERSAO] → Checkout
**Changelog v1.0 → v2.0:**
- Order bump removido
- Botoes express Apple Pay / Google Pay removidos desta tela (integracao Stripe fica no Checkout)
- Adicionado bloco de trust signals visuais (icones de pagamento) abaixo do CTA
- Sem parcelamento

---

## FUNCAO DA TELA

Essa tela faz quatro coisas em sequencia, sem distracao:
1. Ancora emocionalmente — continua o estado criado no quiz
2. Remove a ultima objecao — player de audio ("como vai ficar?")
3. Apresenta a oferta — preco riscado + valor + tres linhas de prova
4. Coleta os dados do comprador — 3 campos + CTA + trust signals

Nao e uma tela de selecao de plano. E uma tela de conversao.
Uma unica acao: garantir a musica.

A escolha entre PIX e Cartao acontece no Checkout — nao aqui.

---

## DADOS DISPONIVEIS VIA SESSIONSTORAGE

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
O quiz terminou. Progresso nao e mais relevante.

---

## BLOCO 1 — ANCORA EMOCIONAL

### Headline principal
```
A musica [DA_DO] [NOME] esta quase pronta.
```

Exemplos renderizados:
- "A musica da Ana esta quase pronta."
- "A musica do Jorge esta quase pronta."

Tipografia: Open Sans, weight 800, uppercase, cor teal (#2C5D63)
Alinhamento: centralizado

### Subheadline
```
Composicao original — com a historia de voces, do jeito que [ELA_ELE] gosta de ouvir.
Entrega em 24h pelo WhatsApp.
```

Exemplos renderizados:
- "...do jeito que ela gosta de ouvir."
- "...do jeito que ele gosta de ouvir."

Tipografia: Merriweather, serif, 16px, teal 70%
Alinhamento: centralizado

---

## BLOCO 2 — PLAYER DE AUDIO

### Copy acima do player
```
Ouca como fica antes de finalizar.
```

Tipografia: Merriweather, 14px, teal 70%, centralizado

### Comportamento do player
- 1 player de audio de exemplo real
- Selecionado automaticamente com base no [estiloMusical] salvo no quiz
- Fallback se estilo nao tiver audio disponivel: player de Sertanejo
- Visual: minimalista, fundo cream (#F4EEDC), borda teal, botao play gold (#EAA115)
- Duracao maxima: 45 segundos

### Copy abaixo do player
```
Sua musica vai ser unica — essa e so um exemplo do que a gente produz.
```

Tipografia: Merriweather, 12px, teal 50%, centralizado, italico

---

## BLOCO 3 — OFERTA

### Badge
```
OFERTA DE LANCAMENTO
```
Visual: pill, fundo gold (#EAA115), texto branco, Open Sans 800, uppercase, 12px
Posicao: centralizado, acima do preco

### Preco
```
~~R$ 97~~   por   R$ 47
```

Visual:
- R$97: riscado, teal 40%, 18px
- "por": Merriweather, 14px, teal 70%
- R$47: Open Sans 800, 36px, teal (#2C5D63)
- Centralizado

### Tres linhas de valor
```
✓  Uma musica que so existe por causa da historia de voces
✓  Entrega em ate 24h direto no seu WhatsApp
✓  Garantia 7 dias — nao gostou, devolvemos tudo
```

Visual: icone check gold, Merriweather 14px, teal, gap 24px entre linhas
Alinhamento: texto alinhado a esquerda dentro de bloco centralizado (max-width 320px)

Nota de copy: primeira linha usa frase aprovada do brand voice ("so existe por causa da historia de voces") — mais especifica e emocional que "composicao original com a historia de voces" da v1.

---

## BLOCO 4 — FORMULARIO

### Headline do formulario
```
Para onde enviamos sua musica?
```

Tipografia: Open Sans 700, 18px, teal, uppercase
Margem topo: 32px

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
Voice input: sim (microfone discreto lado direito do campo)
Auto-save: sim (localStorage — "compradorNome")

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

Micro-copy abaixo:
```
E por aqui que a musica chega.
```

Tipo: tel
Mascara: (XX) XXXXX-XXXX
Validacao: minimo 10 digitos apos strip de mascara
Obrigatorio: sim
Voice input: NAO (numero via voz e impreciso)
Auto-save: sim (localStorage — "compradorWhatsApp")

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

Micro-copy abaixo:
```
Para o comprovante de pagamento.
```

Tipo: email
Validacao: formato valido
Obrigatorio: sim
Voice input: NAO
Auto-save: sim (localStorage — "compradorEmail")

---

### Nota de privacidade (abaixo dos 3 campos)
```
Seus dados sao usados so para criar e entregar sua musica.
```

Tipografia: Merriweather, 11px, teal 50%, centralizado

---

## CTA PRINCIPAL

### Copy do botao
```
Garantir a musica [DA_DO] [NOME] por R$ 47 →
```

Exemplos renderizados:
- "Garantir a musica da Ana por R$ 47 →"
- "Garantir a musica do Jorge por R$ 47 →"

Visual:
- Fundo: gold (#EAA115)
- Texto: branco, Open Sans 800, uppercase
- Border-radius: pill (9999px)
- Largura: 100% mobile / max 480px centralizado desktop
- Padding: 18px 32px
- Hover: #C99A3C + scale 1.05
- Sombra: box-shadow 0 4px 16px rgba(234,161,21,0.3)

Comportamento:
- Desabilitado se qualquer campo obrigatorio vazio ou invalido
- Estado desabilitado: gold/40, cursor not-allowed
- Ao clicar: spinner + texto "Aguardando..." (previne double-click)
- Dados gravados no Baserow com status "pre_checkout"
- Redirect para /checkout

---

## TRUST SIGNALS DE PAGAMENTO

Posicao: imediatamente abaixo do CTA, separacao 12px
Funcao: tranquilizar nos ultimos 3 segundos antes do clique — nao informar, tranquilizar

### Layout
Linha unica, icones lado a lado, centralizados:

```
[icone PIX]  [icone Visa]  [icone Mastercard]  [icone Apple Pay]  [icone Google Pay]
```

Abaixo dos icones, texto minimo:
```
Pagamento 100% seguro
```

Tipografia: Merriweather, 11px, teal 50%, centralizado

### Especificacao dos icones
| Icone | Arquivo SVG | Dimensao | Fonte |
|---|---|---|---|
| PIX | pix.svg | 40x24px | Banco Central (publico) |
| Visa | visa.svg | 40x24px | Visa Brand Center (publico) |
| Mastercard | mastercard.svg | 40x24px | Mastercard Brand Center (publico) |
| Apple Pay | apple-pay.svg | 40x24px | Apple (publico) |
| Google Pay | google-pay.svg | 40x24px | Google (publico) |

Visual dos icones: fundo branco, borda 1px solid teal/10, border-radius 4px, padding 4px
Gap entre icones: 8px
Opacidade: 70% (discretos, nao competem com o CTA)

---

## RODAPE — MONICA

Posicao: abaixo dos trust signals, separacao 32px

### Copy
```
Ficou com duvida? Fale com a Monica no WhatsApp →
```

Tipografia link: Merriweather, 13px, teal, sublinhado discreto
Alinhamento: centralizado

Comportamento:
- Abre WhatsApp com mensagem pre-configurada: "Oi Monica! Tenho uma duvida sobre a musica personalizada."
- target="_blank"

---

## ESTADOS DE ERRO — FORMULARIO

Campo invalido ao clicar no CTA:
- Borda vermelha (#E53935) + shake animation 200ms
- Mensagem inline abaixo do campo:
  - Nome vazio: "Qual e o seu nome?"
  - WhatsApp invalido: "Confere o numero — parece que tem algo errado."
  - Email invalido: "Confere o email — parece que tem algo errado."
- Sem alert ou modal

---

## ESTADO DE LOADING — CTA CLICADO

1. Botao: spinner + "Aguardando..."
2. API: dados gravados no Baserow (status "pre_checkout")
3. Redirect: /checkout
4. Falha de API: botao volta ao normal + toast inferior:
   "Algo deu errado. Tenta de novo."
   (fundo #E53935, branco, pill, 4 segundos)

---

## CHECKLIST DE COPY

- [ ] Headline usa tokens [DA_DO][NOME] — renderiza corretamente para M e F
- [ ] Subheadline usa [ELA_ELE] — renderiza corretamente
- [ ] Player carrega audio do estilo selecionado no quiz
- [ ] Preco riscado R$97 visivel antes do R$47
- [ ] Primeira linha de valor usa frase aprovada do brand voice
- [ ] "Comprar" nao aparece em lugar nenhum
- [ ] CTA usa "Garantir" + nome + preco
- [ ] Trust signals: 5 icones abaixo do CTA, discretos
- [ ] Nota de privacidade presente e discreta
- [ ] Monica no rodape — escape emocional, nao CTA competindo
- [ ] Nenhum placeholder generico nos 3 campos

---

## NOTAS PARA O DEV

1. Acesso direto por URL sem dados do quiz no sessionStorage: redirecionar para inicio do quiz.
2. Audio do player: hospedar na CDN propria. Nao usar SoundCloud/YouTube (autoplay policies iOS).
3. SVGs dos icones de pagamento: todos publicos e gratuitos nas fontes listadas acima. Nao usar PNG — SVG garante nitidez em todos os densities de tela.
4. Dados gravados no Baserow antes do redirect com status "pre_checkout" — isso alimenta recuperacao de carrinho se o usuario nao concluir o PIX.
5. Campo WhatsApp: salvar no Baserow sem mascara (so digitos + DDI 55: "5511999999999").
6. Sem order bump nesta versao. Estrutura preparada para adicionar futuramente sem refatoracao — basta inserir o bloco entre a nota de privacidade e o CTA.
