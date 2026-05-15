# COPY — TELA DE CONVERSAO
**Versao:** v3.0
**Data:** 2026-05-08
**Status:** Pronto para desenvolvimento
**Posicao no funil:** Quiz (Tela 3) → [TELA DE CONVERSAO] → Checkout
**Changelog v2.0 → v3.0:**
- Estrutura reorganizada: formulario subiu, bloco de oferta desceu
- Preco + garantia + CTA agrupados no final em um bloco unico
- Registro emocional mantido do quiz ate o formulario sem quebra
- Copy do subheadline reescrita para continuar o estado do quiz

---

## FUNCAO DA TELA

Essa tela faz quatro coisas em sequencia, sem distracao:
1. Ancora emocionalmente — continua o estado criado no quiz
2. Remove a ultima objecao tecnica — player de audio ("como vai ficar?")
3. Coleta os dados — enquanto ela ainda esta quente, antes de qualquer conversa de preco
4. Fecha a venda — preco + garantia + CTA num bloco unico

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

## CABECALHO

Logo ViraHit centralizada. Nada mais.
Sem botao voltar. Sem menu. Sem X para fechar.
Qualquer elemento clicavel que nao seja o CTA e uma saida — nao dar saidas.
Quem precisar voltar usa o botao do proprio navegador.

---

## BARRA DE PROGRESSO

Nao aparece nesta tela.
O quiz terminou. Progresso nao e mais relevante.

---

## BLOCO 1 — ANCORA EMOCIONAL

### Headline principal
```
Agora a gente faz a musica [DA_DO] [NOME] existir.
```

Exemplos renderizados:
- "Agora a gente faz a musica da Ana existir."
- "Agora a gente faz a musica do Jorge existir."

Tipografia: Open Sans, weight 800, uppercase, cor teal (#2C5D63)
Alinhamento: centralizado

Nota de copy: o CTA final do quiz diz "A musica do [NOME] esta quase pronta" — se o headline da tela de conversao repetisse a mesma frase, a pessoa clicaria e sentiria que nao saiu do lugar. "Agora a gente faz existir" resolve os dois problemas de uma vez: elimina a repeticao e corrige a logica — "quase pronta" sugeria que algo ja estava acontecendo sem a acao dela, o que e falso e destroi urgencia. "Faz existir" coloca o poder na mao dela — a musica so vai existir porque ela esta aqui.

### Subheadline (3 frases curtas — uma ideia cada)
```
Voce acabou de contar uma historia linda.
A gente vai transformar essa historia numa musica unica.
Essa musica so vai existir por causa do que voce escreveu.
```

Tipografia: Merriweather, serif, 16px, teal 70%
Alinhamento: centralizado

Nota de copy: espelha de volta o estado emocional do quiz. A pessoa acabou de escrever a historia de alguem que ela ama — o subheadline reconhece isso antes de pedir qualquer coisa. Tres frases curtas, uma ideia cada, zero clausula relativa, zero vocabulario tecnico. Publico de quinta serie le sem travar.

---

## BLOCO 2 — PLAYER DE AUDIO

### Copy acima do player
```
Ouca como uma musica dessas soa.
```

Tipografia: Merriweather, 14px, teal 70%, centralizado

Nota de copy: "enquanto preenche" da v2 tratava o audio como acompanhamento de formulario. O audio e a prova mais poderosa da tela — precisa ser apresentado como o evento principal, nao como plano de fundo.

### Comportamento do player
- 1 player de audio de exemplo real
- Selecionado automaticamente com base no [estiloMusical] salvo no quiz
- Fallback se estilo nao tiver audio disponivel: player de Sertanejo
- Visual: minimalista, fundo cream (#F4EEDC), borda teal, botao play gold (#EAA115)
- Duracao maxima: 45 segundos

### Copy abaixo do player
```
Essa e uma musica feita pra outra pessoa, com outra historia.
A musica [DA_DO] [NOME] vai ser feita so com o que voce escreveu.
Diferente dessa. Diferente de qualquer outra.
```

Exemplos renderizados:
- "A musica da Ana vai ser feita so com o que voce escreveu."
- "A musica do Jorge vai ser feita so com o que voce escreveu."

Tipografia: Merriweather, 12px, teal 50%, centralizado, italico

Nota de copy: o disclaimer necessario ("e so um exemplo") foi transformado em argumento de exclusividade. Ao mencionar que essa musica e de outra pessoa, reativa o desejo — a musica do [NOME] vai ser diferente, feita so com a historia especifica que ela contou.

---

## BLOCO 3 — FORMULARIO

### Micro-texto de transicao (acima do headline)
```
So falta um passo.
Preenche aqui e a gente comeca a criar.
```

Tipografia: Merriweather, 15px, teal 70%, centralizado
Margem topo: 32px

Nota de copy: reduz a friccao de "por que estou preenchendo isso agora". Duas frases curtas que dizem: voce ja decidiu, isso e so logistica, e rapido.

### Headline do formulario
```
Para onde enviamos a musica [DA_DO] [NOME]?
```

Exemplos renderizados:
- "Para onde enviamos a musica da Ana?"
- "Para onde enviamos a musica do Jorge?"

Tipografia: Open Sans 700, 18px, teal, uppercase

---

### CAMPO 1 — Nome do comprador

Label:
```
Seu nome
```

Placeholder:
```
Seu nome aqui
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

## BLOCO 4 — OFERTA + GARANTIA + CTA

Este bloco e unico e indivisivel. Stack de valor, preco, garantia e CTA aparecem juntos — um movimento so no final da tela. A pessoa preencheu os dados, esta comprometida, e agora ve o preco com contexto de valor completo ao redor.

Separacao do formulario: divider discreto (linha 1px teal/10) + margem topo 32px.

---

### Stack de valor (5 itens com descricao — antes do preco)

```
O que voce recebe:
```
Tipografia: Open Sans 700, 13px, teal 50%, uppercase, letter-spacing 0.08em, centralizado

```
✓  Uma musica composta do zero
   So com a historia [DA_DO] [NOME]. Nao existe outra igual.

✓  Letra e melodia originais
   A gente escreve, grava e entrega. Voce nao faz nada.

✓  Entrega em ate 24h no seu WhatsApp
   Pronto pra voce dar de presente quando quiser.

✓  Arquivo de audio pra guardar pra sempre
   Nao some. Nao expira. Fica com voce.

✓  Zero risco — 7 dias de garantia
   Ouviu e nao gostou? A gente devolve tudo.
   Sem pergunta. Sem enrolacao. Devolucao total.
```

Visual: icone check gold, Merriweather 14px, teal
Linha de descricao: Merriweather 13px, teal 60%, italico, margem topo 4px
Gap entre itens: 20px
Alinhamento: texto alinhado a esquerda dentro de bloco centralizado (max-width 320px)

Nota de copy: cinco itens com valor descrito constroem o stack antes do preco aparecer. O preco de R$47 so e revelado depois que a pessoa ja processou o que recebe. A garantia esta integrada no stack — nao e um bloco separado, e o quinto item do que ela recebe. "Sem pergunta. Sem enrolacao." elimina o risco percebido com confianca declarada, nao so menciona a garantia.

---

### Preco
```
De R$ 97
Hoje: R$ 47
```

Visual:
- "De R$97": Merriweather, 14px, teal 40%, riscado
- "Hoje: R$47": Open Sans 800, 36px, teal (#2C5D63)
- Centralizado
- Separacao topo: 24px

Nota: badge "OFERTA DE LANCAMENTO" removido. Urgencia sem especificidade (data ou quantidade) nao e urgencia — e decoracao. Se no futuro houver limite real de vagas por dia ou data de encerramento, reintroduzir com dado especifico.

---

### CTA principal
```
Garantir a musica [DA_DO] [NOME] →
```

Exemplos renderizados:
- "Garantir a musica da Ana →"
- "Garantir a musica do Jorge →"

Visual:
- Fundo: gold (#EAA115)
- Texto: branco, Open Sans 800, uppercase
- Border-radius: pill (9999px)
- Largura: 100% mobile / max 480px centralizado desktop
- Padding: 18px 32px
- Hover: #C99A3C + scale 1.05
- Sombra: box-shadow 0 4px 16px rgba(234,161,21,0.3)
- Margem topo: 24px

Comportamento:
- Desabilitado se qualquer campo obrigatorio vazio ou invalido
- Estado desabilitado: gold/40, cursor not-allowed
- Ao clicar: spinner + texto "Aguardando..." (previne double-click)
- Dados gravados no Baserow com status "pre_checkout"
- Redirect para /checkout

---

## TRUST SIGNALS DE PAGAMENTO

Posicao: imediatamente abaixo do CTA, separacao 12px
Funcao: tranquilizar nos ultimos 3 segundos antes do clique

### Layout
Linha unica, icones lado a lado, centralizados:

```
[icone PIX]  [icone Visa]  [icone Mastercard]  [icone Apple Pay]  [icone Google Pay]
```

Abaixo dos icones:
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
Quer ajuda pra finalizar?
Fala com a Monica no WhatsApp →
```

Tipografia link: Merriweather, 13px, teal, sublinhado discreto
Alinhamento: centralizado

Nota de copy: "ficou com duvida" era passivo e pressupunha que a pessoa estava em duvida. "Quer ajuda pra finalizar" pressupoe que ela quer avançar e a Monica e a ajuda pra isso — postura ativa, nao defensiva.

Comportamento:
- Abre WhatsApp com mensagem pre-configurada: "Oi Monica! Preciso de ajuda pra finalizar minha musica personalizada."
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
- [ ] Subheadline continua o estado do quiz — sem introducao de informacao nova
- [ ] Copy abaixo do player usa [DA_DO][NOME] — personalizado
- [ ] Headline do formulario usa [DA_DO][NOME] — nao e generica
- [ ] Player carrega audio do estilo selecionado no quiz
- [ ] Formulario aparece ANTES do bloco de oferta
- [ ] Preco riscado R$97 visivel antes do R$47
- [ ] Badge + preco + valor + garantia + CTA num bloco unico indivisivel
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
