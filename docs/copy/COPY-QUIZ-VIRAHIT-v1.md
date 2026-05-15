# COPY DO QUIZ VIRAHIT — v1.1
**Data:** 2026-05-08
**Status:** Aprovado para desenvolvimento
**Escopo:** Copy palavra por palavra + especificacao de comportamento de cada tela
**Preco:** R$47 unico (ancoragem R$97 riscado + badge Oferta de Lancamento)
**Publico:** Mulheres 35-55, trafego frio Meta Ads, Problem Aware no maximo
**Changelog v1.0 → v1.1:**
- Removida frase de abertura da Tela 1 (redundante para quem vem da landing)
- Estilos musicais expandidos de 5 para 8 com grade 2x4
- Aviso suave antes do CTA reescrito — hierarquia corrigida, CTA unico
- Nota abaixo do CTA final substituida por linha emocional
- Comportamento do banner de rascunho alterado para toast inferior
- "Comecar do zero" removido do banner, realocado para menu/header

---

## PREMISSAS GERAIS

- Mobile-first absoluto. 80% do trafego e mobile.
- Voice input disponivel em TODOS os campos de texto — sem excecao.
- Transcricao do audio so e processada apos pagamento confirmado via webhook WOOVI. Antes disso o audio fica armazenado no pedido (IndexedDB).
- Auto-save em todos os campos de texto via localStorage a cada 3 segundos de inatividade.
- Barra de progresso visivel em todas as telas. Sem numeracao de passo — so barra preenchida proporcionalmente.
- Botao Voltar visivel da Tela 2 em diante. Nao apaga dados anteriores.
- CTA nunca bloqueia por campos opcionais. So bloqueia se campo obrigatorio estiver vazio.
- Nome coletado na Tela 1 aparece dinamicamente em todas as telas seguintes onde indicado como [NOME].

---

## COMPORTAMENTO DO RASCUNHO SALVO

Quando o usuario retorna ao quiz com dados salvos no localStorage:

**Comportamento:** Toast no canto inferior esquerdo da tela.
**Aparece:** 800ms apos a pagina carregar — deixa o conteudo renderizar primeiro.
**Duracao:** 4 segundos, some com fade-out suave.
**Nao bloqueia** nenhum elemento clicavel da tela.

**Visual do toast:**
```
+------------------------------------+
| ✓  Continuando de onde voce parou  |
+------------------------------------+
```
Fundo teal (#2C5D63), texto branco, icone check, border-radius pill, canto inferior esquerdo.

**"Comecar do zero":**
Nao aparece no toast. Fica acessivel como link discreto no menu do header (icone tres pontos) ou no rodape da tela. E uma saida de emergencia — nao uma acao promovida.

**Rascunho expira em:** 48 horas.

---

## MICRO-PROVA SOCIAL DINAMICA

Aparece em todas as telas, abaixo do titulo, e muda conforme o vinculo selecionado na Tela 1. So aparece depois que o usuario seleciona um vinculo.

| Vinculo selecionado | Texto da micro-prova |
|---|---|
| Mae | "Mais de 1.200 maes ja ganharam uma musica so delas." |
| Pai | "Mais de 600 pais receberam a musica que mereciam." |
| Parceiro/a | "Mais de 900 casais eternizaram a historia deles." |
| Filho/a | "Mais de 500 familias criaram a musica do filho delas." |
| Amigo/a | "Centenas de amizades viraram musica. A proxima e a de voces." |
| Irmao/a | "Irmaos que nunca souberam como agradecer — agora sabem." |
| Noivo/a | "Casais que vao comecar a vida nova com uma musica so deles." |
| Alguem especial | "Mais de 3.000 musicas entregues. A proxima e pra pessoa certa." |

---

## TELA 1 — PARA QUEM E A MUSICA?

### Objetivo da tela
Iniciar o comprometimento emocional. O usuario pensa na pessoa que ama, seleciona o vinculo e digita o nome. O presente comeca a existir na cabeca de quem compra.

### Barra de progresso
33% preenchido.

---

### Conteudo

**Titulo**
"Para quem vai essa musica?"

**Micro-prova social**
[aparece dinamicamente apos selecao do vinculo — ver tabela acima]

---

**Opcoes de vinculo — grade 2 colunas, 4 linhas**

| Coluna esquerda | Coluna direita |
|---|---|
| 🤱 Mae | 👨‍👧 Pai |
| ❤️ Parceiro/a | 👶 Filho/a |
| 🤝 Amigo/a | 👫 Irmao/a |
| 💍 Noivo/a | ✨ Alguem especial |

**Comportamento dos cards:**
Toque seleciona o card — borda gold, fundo gold/10. Nao avanca automaticamente. Aguarda o campo de nome abaixo ser preenchido.

---

**Campo de nome**
Aparece logo abaixo dos cards, na mesma tela, sem mudanca de pagina.

Label: "Qual e o nome dela/e?"
Placeholder: "Ex: Ana, Vovo Teresa, Seu Ze, Claudinha..."
Tipo: texto
Limite: 50 caracteres
Obrigatorio: sim — minimo 2 caracteres
Nota abaixo: "O nome vai aparecer na letra da musica."

**Botao de voz no campo de nome:**
Icone de microfone discreto dentro do campo, lado direito.
Ao tocar: captura o nome via Web Speech API (client-side, sem custo).
O nome transcrito preenche o campo automaticamente.

---

**CTA**
"Continuar →"

Desabilitado se: nenhum vinculo selecionado OU campo nome vazio ou com menos de 2 caracteres.

---

## TELA 2 — O ESTILO DA MUSICA

### Objetivo da tela
Definir o som. E o dado mais tecnico e mais irreversivel do quiz — errar o estilo e retrabalho total. O preview de audio de 8 segundos por estilo remove a inseguranca de quem nao tem certeza.

### Barra de progresso
66% preenchido.

---

### Conteudo

**Titulo**
"Que estilo a [NOME] vai amar?"

**Micro-prova social**
[continua o texto dinamico do vinculo selecionado na Tela 1]

---

**Opcoes de estilo — grade 2 colunas, 4 linhas**

| Coluna esquerda | Coluna direita |
|---|---|
| 🤠 Sertanejo | 🙏 Gospel |
| 🪗 Forro | 🥁 Pagode |
| 🎶 Samba | 🎸 MPB |
| 💔 Arrocha | 🤘 Rock Brasileiro |

**Cada card tem:**
- Emoji + nome do estilo
- Botao de preview de audio: [▶ Ouvir exemplo] — toca 8 segundos de uma musica real produzida pela ViraHit naquele estilo
- Tocar no preview NAO seleciona o estilo. Tocar no card (fora do botao de preview) seleciona.

**Nota abaixo dos cards:**
"Nao tem certeza? Ouca os exemplos antes de escolher."

---

**Selecao de voz**
Aparece logo abaixo dos cards de estilo, na mesma tela.

Label: "E a voz?"

Dois botoes lado a lado:
- [🎤 Feminina]
- [🎤 Masculina]

**Comportamento:**
Selecionar a voz com estilo ja selecionado avanca automaticamente para a Tela 3.
Se o estilo foi selecionado mas a voz nao: CTA aparece com nota discreta abaixo — "So falta escolher a voz."

---

**CTA**
"Continuar →"

Desabilitado se: nenhum estilo selecionado OU nenhuma voz selecionada.

---

## TELA 3 — A HISTORIA

### Objetivo da tela
Coletar o conteudo que transforma uma musica generica em uma musica que faz chorar. Tres perguntas curtas e direcionadas, cada uma capturando uma camada diferente: o detalhe poetico, a cena real, e a intencao emocional de quem compra.

### Por que tres campos separados e nao um campo livre
Um campo livre de 2000 caracteres paralisa. Tres campos pequenos com perguntas especificas sao mais faceis de responder e entregam ao compositor informacao mais util — cada pergunta puxa uma camada diferente da historia.

### Minimo para uma musica boa
Ao menos 80 caracteres em pelo menos um dos campos A ou B, ou um audio gravado em qualquer campo. Menos que isso e insuficiente para o compositor criar algo nao-generico. O CTA nunca bloqueia por isso — mas se os dois campos estiverem vazios e sem audio, aparece um aviso (ver abaixo).

### Barra de progresso
100% preenchido.

---

### Conteudo

**Titulo**
"Agora vem a parte que faz essa musica ser so da [NOME]."

**Subtitulo**
"Responde o que der — quanto mais detalhes, mais a musica vai ser dela. Pode falar em vez de escrever."

**Micro-prova social**
[continua o texto dinamico do vinculo selecionado na Tela 1]

---

### CAMPO A — A historia

**Label**
"Quem e a [NOME] pra voce? Conta a historia dela."

**Placeholder**
"Ex: ela criou 6 filhos sozinha depois que o marido foi embora... / ele saiu da roca, estudou e virou pastor... / a gente ficou separado 17 anos e se reencontrou na porta de casa... / ela nunca fez diferenca entre filho de sangue e filho de criacao..."

Tipo: textarea
Limite: 300 caracteres
Contador: visivel discretamente no canto inferior direito — "0/300"
Obrigatorio: nao
Auto-save: sim, a cada 3s de inatividade

**Botao de voz:**
"🎙 Prefere falar? Toque aqui."
Subtexto: "A gente transcreve depois — nao aparece como voz na musica."
Comportamento: grava audio, armazena no pedido (IndexedDB), nao transcreve antes do pagamento.

---

### CAMPO B — O detalhe concreto

**Label**
"Tem um detalhe, uma frase ou um momento que nao pode faltar na musica da [NOME]?"

**Placeholder**
"Ex: ela sempre dizia 'vai melhorar, vai dar certo'... / o dia que ele voltou pra cidade por amor a mae... / o apelido carinhoso que so a gente usa... / quando ela ficou do meu lado quando tudo deu errado..."

Tipo: textarea
Limite: 300 caracteres
Contador: visivel discretamente no canto inferior direito — "0/300"
Obrigatorio: nao
Auto-save: sim, a cada 3s de inatividade

**Botao de voz:**
"🎙 Prefere falar? Toque aqui."
Subtexto: "A gente transcreve depois — nao aparece como voz na musica."
Comportamento: identico ao Campo A.

---

### CAMPO C — A intencao emocional

**Label**
"O que voce quer que a [NOME] sinta quando ouvir essa musica?"

**Formato:** chips selecionaveis, multipla selecao permitida.

**Opcoes:**

| # | Texto do chip |
|---|---|
| 1 | Que ela chore de emocao |
| 2 | Que ela se sinta amada de verdade |
| 3 | Que ela saiba o quanto eu a admiro |
| 4 | Que a gente nunca esqueca esse momento |
| 5 | Que ela veja o sacrificio dela reconhecido |
| 6 | Outro — escreve aqui |

**Comportamento do chip "Outro — escreve aqui":**
Ao selecionar, abre um campo de texto inline abaixo do chip.
Placeholder: "O que voce quer que ela sinta?"
Limite: 150 caracteres
Botao de voz disponivel nesse campo tambem.

Obrigatorio: nao. Se nenhuma opcao for selecionada, CTA aparece normalmente.

---

### AVISO SUAVE — so aparece se campos A e B estiverem AMBOS vazios e sem audio gravado

Aparece diretamente acima do CTA, fundo gold/10, borda esquerda gold 3px.

Texto:
"Sem nenhum detalhe, a musica vai ter o nome dela — mas poderia ter a historia de voces.
Um detalhe ja muda tudo."

**CTA do aviso (unico, destaque):**
"Adicionar um detalhe antes de continuar →"

**Link secundario abaixo, sem botao, texto menor:**
"Continuar sem adicionar"

Logica: o caminho principal e preencher. Continuar sem preencher existe mas nao e o destaque. Nao ha dois CTAs competindo — ha um CTA e uma saida discreta.

---

### CTA FINAL DA TELA 3

"Finalizar e ver minha oferta →"

**Linha abaixo do CTA — uma unica linha emocional, sem explicacao logistica:**
"A musica da [NOME] esta quase pronta."

---

## DADOS COLETADOS AO FINAL DO QUIZ

| Dado | Tela | Tipo de campo | Obrigatorio |
|---|---|---|---|
| Vinculo afetivo | Tela 1 | Card (clique) | Sim |
| Nome do presenteado | Tela 1 | Texto | Sim |
| Estilo musical | Tela 2 | Card (clique) | Sim |
| Voz (feminina/masculina) | Tela 2 | Botao (clique) | Sim |
| A historia (quem e a pessoa, trajetoria) | Tela 3 | Campo A — texto ou audio | Nao |
| Detalhe concreto (frase, momento, apelido) | Tela 3 | Campo B — texto ou audio | Nao |
| Intencao emocional | Tela 3 | Campo C — chips + Outro | Nao |

**Total de campos obrigatorios:** 4
**Total de campos opcionais:** 3
**Voice input disponivel em:** Campo nome (Tela 1), Campo A, Campo B, Campo C opcao Outro (Tela 3)

---

## VOICE INPUT — ESPECIFICACAO TECNICA

**Disponivel em:** campo nome (Tela 1), Campo A (Tela 3), Campo B (Tela 3), Campo C opcao Outro (Tela 3).

**Fluxo do usuario:**
1. Toca no botao de microfone
2. Modal abre com animacao de onda sonora
3. Usuario fala
4. Ao parar: audio armazenado no pedido (IndexedDB)
5. Campo exibe: "Audio gravado ✓ — nossa equipe transcreve apos o pagamento"
6. Usuario pode gravar novamente para substituir, ou digitar manualmente

**Transcricao:**
- Ocorre so apos pagamento confirmado (webhook WOOVI dispara)
- Processado por AssemblyAI (ja na stack da ViraHit)
- Resultado salvo no campo correspondente no Baserow junto com os demais dados do pedido

**Excecao — campo nome na Tela 1:**
O nome e transcrito client-side via Web Speech API (gratuito, sem custo de AssemblyAI) porque precisa aparecer dinamicamente nas telas seguintes. E um campo curto, sem risco de qualidade.

**Fallback:**
Se o browser nao suportar gravacao (iOS Safari antigo, etc.): botao de microfone some, campo de texto permanece. Nenhuma funcionalidade e bloqueada.

---

## AUTO-SAVE — ESPECIFICACAO

**O que e salvo:**
- Selecoes de cards (vinculo, estilo, voz): salvas imediatamente ao tocar
- Campos de texto (nome, A, B, C Outro): salvos a cada 3 segundos de inatividade
- Audios gravados: salvos em IndexedDB (localStorage nao comporta binario)

**Indicador visual de auto-save:**
Aparece discretamente no canto inferior direito do campo que acabou de salvar.
Texto: "✓ Rascunho salvo" — 12px, teal 50%, some apos 2 segundos.

**Retorno com rascunho:**
Toast no canto inferior esquerdo, 800ms apos carregar, duracao 4 segundos.
Texto: "✓ Continuando de onde voce parou"
Visual: fundo teal, texto branco, border-radius pill.
"Comecar do zero": link no menu/header — nao no toast.

**Expiracao:** 48 horas.

---

## ESTILOS MUSICAIS — REFERENCIA PARA PREVIEWS

| Estilo | Publico principal | Regiao forte | Artistas de referencia para preview |
|---|---|---|---|
| Sertanejo | Mulheres 25-50, todas as regioes | Sul, Sudeste, Centro-Oeste | Simone Mendes, Marilia Mendonca, Lauana Prado |
| Gospel | Mulheres evangelicas 35-60 | Nacional | Isadora Pompeo, Gabriela Rocha, Fernanda Brum |
| Forro | Nordestinos e migrantes nordestinos | Nordeste | Estilo universitario ou eletronico |
| Pagode | Mulheres 30-55 Sudeste | RJ, SP | Sorriso Maroto, Dilsinho, Ferrugem |
| Samba | Mulheres 40-60 | RJ, SP | Estilo classico, nostalgico |
| MPB | Mulheres com maior escolaridade, 35-60 | Capitais, classes A/B | Tom Jobim, Caetano, Gilberto Gil |
| Arrocha | Mulheres nordestinas 35-55 | BA, CE, PE | Estilo romantico, letras de amor e saudade |
| Rock Brasileiro | Mulheres 45-60 que cresceram nos anos 80/90 | Sul, Sudeste | Legiao Urbana, Cazuza, Titas — estilo de geracao |

---

## REGRAS DE COPY — O QUE NUNCA APARECE NO QUIZ

- A palavra "opcional" como label ou marcador de campo
- "Comprar" em qualquer CTA — sempre "Criar", "Finalizar", "Ver minha oferta"
- "Plataforma", "tecnologia", "IA" em qualquer tela
- Placeholders genericos tipo "Digite aqui..." — todos os placeholders dao exemplos concretos
- Preco ou qualquer referencia a pagamento nas Telas 1, 2 e 3
- Dois CTAs competindo na mesma tela
- Frases que levantam objecoes que o usuario nao tinha
- Tom defensivo ou explicacoes de processo antes do pagamento

---

## PROXIMOS DOCUMENTOS

- COPY-TELA-CONVERSAO-v1.md — tela entre o quiz e o checkout (oferta + players de audio + 3 campos de dados do comprador)
- COPY-CHECKOUT-v1.md — tela de PIX puro (QR Code + timer + garantia)
- COPY-POS-PAGAMENTO-v1.md — confirmacao + upsell segunda musica
