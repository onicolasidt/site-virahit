# PRD — Funil de Vendas ViraHit

**Versao:** 1.0
**Data:** 2026-05-07
**Autor:** Morgan — Product Manager ViraHit
**Status:** Aprovado para desenvolvimento

---

## 1. Objetivo

Converter visitante em pagador em menos de 5 minutos.

**Produto:** Musica personalizada como presente emocional, criada sob demanda com base em dados coletados no quiz.

**Precos:**
| Plano      | Valor | Descricao                                           |
|------------|-------|-----------------------------------------------------|
| Base       | R$47  | 1 musica, entrega em 24h, 1 estilo                  |
| Mais Escolhido | R$67 | 1 musica, entrega em 24h, 2 versoes de estilo   |
| Premium    | R$77  | 1 musica, entrega em 12h, 3 versoes + letra digital |

**Publico-alvo:** Mulheres entre 35 e 55 anos, trafego frio via Meta Ads (Facebook e Instagram).
O perfil predominante e o de quem quer presentear alguem querido (mae, filho, parceiro, amigo) com algo emocional e diferente.

**Stack aprovada:** Next.js 14 App Router + Tailwind CSS + shadcn/ui + Vercel + WOOVI SDK + Baserow REST API

---

## 2. Telas do Funil (4 Telas)

O funil e composto por quatro telas encadeadas: Landing Page, Quiz (5 passos), Checkout e Pos-pagamento.
Cada tela tem responsabilidade unica e deve ser optimizada de forma independente.

---

### 2.1 Tela 1 — Landing Page

**Objetivo:** Criar desejo emocional pelo produto e iniciar o quiz em menos de 30 segundos apos o clique do anuncio.

#### Componentes MUST HAVE

- **Hero com headline depoimento-aspas**
  Titulo no formato de fala real: `"Eu nunca vi minha mae chorar tanto de alegria"`. Sub-headline explicativo abaixo.
  CTA principal: botao grande e colorido com o texto `Criar minha musica personalizada`.

- **Carrossel de ocasioes**
  Exibir 8 cards clicaveis com emoji + rotulo: Amor, Casamento, Aniversario, Mae, Pai, Filho, Amizade, Formatura.
  Ao clicar em uma ocasiao, o usuario e levado direto ao quiz com a ocasiao pre-selecionada.

- **Secao "Historias reais, lagrimas reais"**
  Minimo de 3 videos curtos (formato portrait, estilo reacao) de clientes reais ao ouvir a musica.
  Cada video deve ter nome da pessoa, ocasiao e cidade visivel abaixo.

- **Players de audio**
  Tres musicas de exemplo com player embutido. Cada player exibe: nome do homenageado, ocasiao e estilo musical.
  Audio deve carregar sob demanda (lazy) para nao impactar performance.

- **Garantia 7 dias**
  Box visivel na landing page (nao apenas no checkout). Texto: "Garantia incondicional de 7 dias. Se nao gostar, devolvemos 100% do valor."
  Icone de escudo ou cadeado para reforcar seguranca.

- **Urgencia real**
  Texto em destaque: `Sua musica entregue em ate 24 horas`. Nao usar contadores falsos.
  Contextualizar com datas proximas quando possivel (ex: "Garanta para o Dia das Maes").

- **CTA secundario**
  Botao de ancora ao final da pagina que leva de volta ao hero, reutilizando o mesmo CTA principal.
  Posicionado apos a secao de garantia.

#### Componentes SHOULD HAVE

- **Barra de credibilidade no topo:** numero de musicas entregues (ex: "+3.200 musicas criadas").
- **Contador de estoque/vagas:** mensagem como "Apenas 8 vagas disponiveis hoje" — alimentado por logica real ou conservadora.
- **FAQ rapido:** 3 perguntas/respostas dobráveis para quebrar objecoes comuns (demora de entrega, qualidade, privacidade).
- **Logo/marca ViraHit** com posicionamento emocional no cabecalho.
- **Meta tags e Open Graph** corretos para compartilhamento via WhatsApp e Facebook.

#### Criterios de Aceite

1. A pagina carrega em menos de 3 segundos no mobile com conexao 4G (medido via Lighthouse).
2. O botao CTA principal esta visivel sem scroll em qualquer tela com largura minima de 375px.
3. O carrossel de ocasioes exibe todos os 8 cards e e navegavel por swipe no mobile.
4. Ao clicar em uma ocasiao no carrossel, o usuario e redirecionado para `/quiz?ocasiao=<slug>` com o valor correto na URL.
5. Os 3 players de audio funcionam sem erro em Chrome, Safari e Firefox.
6. A secao de garantia e visivel sem necessidade de scroll excessivo (dentro das primeiras 3 dobras).
7. Os 3 videos de reacao carregam sem travar a pagina (lazy load implementado).
8. O CTA secundario ancora corretamente para a secao hero.

#### Metrica de Sucesso

| Indicador                | Alvo      | Benchmark Minimo |
|--------------------------|-----------|------------------|
| Taxa de inicio de quiz   | 35% — 50% | 25%              |

---

### 2.2 Tela 2 — Quiz (Passos 1 a 5)

**Objetivo:** Capturar os dados necessarios para producao da musica e conduzir o usuario ate a selecao de plano, mantendo engajamento alto em cada passo.

#### Estrutura dos Passos

**Passo 1 — Para quem e a musica?**
Tela de selecao com 8 opcoes em cards visuais com emoji:
Mae, Pai, Filho/Filha, Parceiro/Parceira, Amigo/Amiga, Neto/Neta, Irmao/Irma, Alguem Especial.
Selecao avanca automaticamente para o proximo passo.

**Passo 2 — Nome da pessoa**
Campo de texto simples. Campo unico e obrigatorio em todo o quiz.
Placeholder: "Ex: Maria, Joao, Vovo Teresa...". Validacao basica (minimo 2 caracteres).

**Passo 3 — Estilo e voz**
Dois grupos de selecao:
- Estilo musical: Sertanejo / Pop Romantico / Gospel / Forro / MPB
- Tipo de voz: Masculina / Feminina
Selecao unica em cada grupo. Avancar so habilitado apos ambas as selecoes.

**Passo 4 — Historia (campo livre)**
Textarea opcional. Placeholder: "Conte algo especial sobre essa pessoa... (opcional)".
Voice input habilitado via Web Speech API (fallback gracioso se nao suportado).
Auto-save no localStorage a cada 3 segundos de inatividade.

**Passo 5 — Selecao de plano**
Tres cards de plano exibidos lado a lado (ou em coluna no mobile):
- R$47 — Base
- R$67 — Mais Escolhido (badge de destaque: "MAIS POPULAR")
- R$77 — Premium
Apos selecao, botao `Quero essa musica` leva para o checkout.

#### Componentes MUST HAVE

- **Barra de progresso** em todos os passos. Exibir "Passo X de 5" + barra visual preenchida proporcionalmente.
- **Botao voltar** visivel em todos os passos (exceto passo 1). Nao apaga os dados do passo anterior.
- **Micro-prova social dinamica** por tipo de destinatario selecionado no Passo 1.
  Exemplo: ao selecionar "Mae", exibir `"Mais de 800 maes ja receberam uma musica assim."`
  Texto muda conforme selecao. Exibido abaixo do titulo de cada passo.
- **Persistencia de dados no quiz** via localStorage ou sessionStorage para nao perder preenchimento em caso de recarga.

#### Componentes SHOULD HAVE

- Animacao de transicao suave entre passos (slide ou fade).
- Indicador de "campo salvo" no Passo 4 quando auto-save e acionado.
- Preview dinamico no Passo 5: "Sua musica para [Nome], estilo [Estilo], voz [Voz] — Plano [Plano]".
- Progress bar com cor da identidade visual ViraHit.

#### Criterios de Aceite

1. A barra de progresso reflete exatamente o passo atual (Passo 1 = 20%, Passo 5 = 100%).
2. O botao voltar retorna ao passo anterior sem perder dados ja preenchidos.
3. O Passo 2 bloqueia o avanco se o campo nome estiver vazio ou com menos de 2 caracteres.
4. O voice input no Passo 4 transcreve audio em texto no campo de historia (testado em Chrome mobile).
5. O auto-save no Passo 4 persiste o texto mesmo apos reload da pagina.
6. A micro-prova social exibe o texto correto para cada tipo de destinatario selecionado.
7. Ao chegar no Passo 5 e selecionar um plano, o botao `Quero essa musica` e habilitado.
8. Os dados do quiz sao transmitidos corretamente para a pagina de checkout via query params ou sessionStorage.

#### Metricas de Sucesso

| Passo  | Taxa de Conclusao Alvo | Taxa Minima Aceitavel |
|--------|------------------------|-----------------------|
| Passo 1 | 85% — 95%             | 75%                   |
| Passo 2 | 80% — 92%             | 70%                   |
| Passo 3 | 78% — 90%             | 68%                   |
| Passo 4 | 72% — 85%             | 62%                   |
| Passo 5 | 65% — 80%             | 55%                   |

---

### 2.3 Tela 3 — Checkout

**Objetivo:** Converter a intencao de compra em pagamento PIX confirmado, reduzindo friccao e mantendo o estado emocional do usuario.

#### Componentes MUST HAVE

- **Resumo personalizado no topo**
  Box com os dados coletados no quiz: Nome do presenteado, Ocasiao, Estilo musical, Tipo de voz, Plano selecionado e Valor.
  Serve como confirmacao e reafirmacao emocional antes do pagamento.

- **Formulario minimo**
  Apenas 3 campos: Nome completo do comprador, E-mail, Telefone (com mascara).
  Validacao client-side com mensagens de erro amigaveis.

- **Geracao de QR Code PIX via WOOVI**
  O QR Code e gerado automaticamente assim que o usuario preenche o campo de e-mail (sem necessidade de clicar em botao).
  Exibir chave PIX copia-e-cola abaixo do QR Code.
  Timer de expiracao do PIX visivel (ex: "PIX valido por 15 minutos").

- **Modo discreto toggle**
  Toggle com rotulo: `E um presente surpresa?`
  Quando ativado, exibe aviso: "Nao se preocupe, nao mencionaremos o valor na mensagem de entrega."

- **Players de audio (reprise)**
  Repetir 1 ou 2 players de audio da landing page no checkout para manter o estado emocional.
  Audio nao deve tocar automaticamente.

- **Garantia 7 dias em destaque**
  Box visual separado (fundo verde claro ou borda verde) com icone de escudo.
  Texto: "Garantia de 7 dias. Nao gostou? Devolvemos 100%."

- **Order bump**
  Posicionado entre o formulario e o botao de pagamento.
  Oferta: "Adicionar dedicatoria em video por +R$17" (ou outra oferta complementar).
  Checkbox simples com descricao da oferta e preco adicional em destaque.

- **Urgencia contextual**
  Texto dinamico: `Entrega garantida ate [data calculada = hoje + 1 dia util]`.
  Calculado no servidor ou client-side com base na data atual.

#### Componentes SHOULD HAVE

- Icones de seguranca (SSL, LGPD, pagamento seguro) abaixo do QR Code.
- Campo CPF opcional (para emissao de nota fiscal, se aplicavel).
- Contador regressivo do PIX com animacao.
- Feedback visual de "aguardando pagamento" com spinner enquanto polling esta ativo.

#### Criterios de Aceite

1. O resumo personalizado exibe corretamente todos os dados coletados no quiz.
2. O QR Code PIX e gerado em menos de 3 segundos apos o preenchimento do e-mail.
3. O toggle de modo discreto altera o estado visivelmente e persiste durante a sessao.
4. O order bump e exibido entre o formulario e o botao, com checkbox funcional.
5. O timer de expiracao do PIX conta regressivamente e exibe alerta ao atingir zero.
6. O polling de status WOOVI verifica a confirmacao a cada 5 segundos sem travar a UI.
7. Apos confirmacao do pagamento, o usuario e redirecionado automaticamente para `/obrigado`.
8. Em caso de erro na geracao do PIX, uma mensagem de erro amigavel e exibida com opcao de tentar novamente.

#### Metricas de Sucesso

| Indicador                        | Alvo      | Benchmark Minimo |
|----------------------------------|-----------|------------------|
| Taxa de pagamento PIX            | 55% — 70% | 40%              |
| Taxa de adesao ao Order Bump     | 15% — 25% | 8%               |
| Conversao final visitante->pago  | 3% — 6%   | 1.5%             |

---

### 2.4 Tela 4 — Pos-pagamento (/obrigado)

**Objetivo:** Confirmar o pedido, transmitir seguranca, entregar instrucoes claras e maximizar receita com upsell.

#### Componentes MUST HAVE

- **Confirmacao personalizada**
  Titulo: `Pedido confirmado, [Nome do Comprador]!`
  Mensagem: `Sua musica para [Nome Presenteado] esta sendo criada com muito carinho.`
  Icone de sucesso animado (checkmark verde).

- **Instrucoes do que acontece agora**
  Lista numerada clara:
  1. Nossa equipe ja recebeu seu pedido.
  2. Voce recebera a musica no WhatsApp e no e-mail informado em ate 24 horas.
  3. Se tiver duvidas, entre em contato via WhatsApp no numero [numero de suporte].

- **Upsell — Segunda musica**
  Box de oferta: `Aproveite: crie uma segunda musica por apenas R$37!`
  Botao de acao: `Quero uma segunda musica`
  Descricao breve: "Para outra pessoa especial. Os dados do quiz podem ser alterados."
  Temporizador de oferta (ex: "Oferta valida por 10 minutos").

- **Detalhes do pedido**
  Resumo compacto: plano contratado, valor pago, ocasiao, estilo. Numero do pedido (ID do WOOVI).

#### Componentes SHOULD HAVE

- Botao de compartilhamento: `Contar para uma amiga` com mensagem pre-configurada para WhatsApp.
- Link para grupo exclusivo de clientes ViraHit (WhatsApp ou Telegram).
- Avaliacao rapida (1 a 5 estrelas) com campo de comentario opcional.
- Pixel de conversao Meta Ads disparado nesta pagina.

#### Criterios de Aceite

1. A pagina exibe o nome do comprador e do presenteado corretamente, vindos do pedido confirmado.
2. O numero do pedido (ID WOOVI) e exibido na tela.
3. O upsell e exibido com preco correto (R$37) e temporizador funcionando.
4. Ao clicar no upsell, o usuario e levado para um novo checkout pre-preenchido com os dados do pedido original.
5. O botao de compartilhamento abre o WhatsApp com mensagem pre-configurada corretamente.
6. O Pixel Meta Ads dispara o evento `Purchase` com o valor correto ao carregar esta pagina.

#### Metricas de Sucesso

| Indicador              | Alvo     | Benchmark Minimo |
|------------------------|----------|------------------|
| Taxa de adesao upsell  | 8% — 15% | 4%               |

---

## 3. Integracoes

### 3.1 WOOVI — Pagamentos PIX

O WOOVI SDK e a solucao oficial para geracao e confirmacao de pagamentos PIX.

**Fluxo tecnico:**

1. Ao preencher o e-mail no checkout, o backend (Route Handler Next.js) chama `POST /api/v2/charge` no WOOVI com os dados do pedido.
2. A resposta inclui `brCode` (chave copia-e-cola) e `qrCodeImage` (base64 ou URL do QR Code).
3. O QR Code e exibido na tela de checkout.
4. O frontend inicia polling a cada 5 segundos via `GET /api/v2/charge/{correlationID}` verificando o campo `status`.
5. Quando `status === "COMPLETED"`, o frontend redireciona para `/obrigado`.
6. O WOOVI tambem dispara um webhook `POST /api/webhooks/woovi` no backend para confirmacao redundante.

**Variaveis de ambiente necessarias:**
```
WOOVI_APP_ID=<id_da_conta>
WOOVI_TOKEN=<token_api>
WOOVI_WEBHOOK_SECRET=<secret_para_validar_assinatura>
```

**Dados enviados na criacao da cobranca:**
- `correlationID`: UUID gerado no backend (vinculado ao pedido)
- `value`: valor em centavos (4700, 6700 ou 7700)
- `comment`: descricao da compra
- `customer`: nome, email, telefone

**Seguranca do webhook:**
- Validar assinatura HMAC no header `x-webhook-signature` antes de processar qualquer evento.
- Idempotencia: verificar se o pedido ja foi confirmado antes de salvar novamente no Baserow.

---

### 3.2 Baserow — Banco de Dados de Pedidos

Apos confirmacao do pagamento (via webhook WOOVI), o pedido e salvo na tabela de producao.

**Dados de acesso:**
- Tabela de Producao ID: `901528`
- Token de acesso: `cWMKvF1vPQUFlKZsFV3F1raIQ8s1bWrj`
- Endpoint base: `https://api.baserow.io/api/database/rows/table/901528/`

**Campos obrigatorios na criacao do registro:**

| Campo              | Tipo   | Descricao                                     |
|--------------------|--------|-----------------------------------------------|
| nome_comprador     | texto  | Nome completo do comprador                    |
| email              | texto  | E-mail do comprador                           |
| telefone           | texto  | Telefone com DDD                              |
| nome_presenteado   | texto  | Nome da pessoa homenageada                    |
| estilo             | texto  | Estilo musical selecionado                    |
| plano              | texto  | base / mais_escolhido / premium               |
| valor              | numero | Valor pago em reais (47, 67 ou 77)            |
| status             | texto  | aguardando / confirmado / producao / entregue |

**Chamada HTTP para criar registro:**
```http
POST https://api.baserow.io/api/database/rows/table/901528/?user_field_names=true
Authorization: Token cWMKvF1vPQUFlKZsFV3F1raIQ8s1bWrj
Content-Type: application/json
```

**Campos adicionais recomendados (SHOULD HAVE):**
- `ocasiao`: tipo de presente (Mae, Pai, etc.)
- `voz`: Masculina / Feminina
- `historia`: texto livre do Passo 4
- `order_bump`: booleano
- `upsell`: booleano
- `id_woovi`: correlationID do WOOVI
- `data_pedido`: timestamp ISO

---

## 4. Fluxo Completo

Abaixo o fluxo tecnico de dados de ponta a ponta, desde o clique no anuncio ate a entrega automatica.

```
[Meta Ads]
    |
    v
[Landing Page — /]
  - Exibe hero, carrossel, videos, players, garantia, urgencia
  - Usuario clica CTA ou ocasiao no carrossel
    |
    v
[Quiz — /quiz]
  Passo 1: selecao de destinatario -> sessionStorage.ocasiao
  Passo 2: nome presenteado -> sessionStorage.nomeHomenageado
  Passo 3: estilo + voz -> sessionStorage.estilo, sessionStorage.voz
  Passo 4: historia (opcional, auto-save localStorage) -> sessionStorage.historia
  Passo 5: selecao de plano -> sessionStorage.plano, sessionStorage.valor
    |
    v
[Checkout — /checkout]
  - Recupera dados do sessionStorage
  - Exibe resumo personalizado
  - Usuario preenche nome, email, telefone
  - Ao preencher email:
      -> POST /api/checkout/criar-pix
         -> WOOVI SDK: criar cobranca
         <- retorna brCode + qrCodeImage + correlationID
      -> Exibe QR Code + copia-e-cola
      -> Inicia polling GET /api/checkout/status?id=<correlationID>
         (a cada 5 segundos)
  - Usuario paga o PIX no app bancario
    |
    v (via webhook OU polling)
[Webhook WOOVI -> /api/webhooks/woovi]
  - Valida assinatura HMAC
  - Verifica idempotencia (pedido ja confirmado?)
  - Chama POST Baserow para salvar pedido com status=confirmado
  - (opcional) Dispara automacao WhatsApp + email (integrador externo ou Make/Zapier)
    |
    v
[Pos-pagamento — /obrigado?pedido=<ID>]
  - Exibe confirmacao personalizada
  - Exibe instrucoes de entrega
  - Exibe upsell (segunda musica por R$37)
  - Dispara Pixel Meta Ads evento Purchase
    |
    v (se usuario aceitar upsell)
[Novo Checkout — /checkout?upsell=true]
  - Pre-preenchido com dados do pedido original
  - Novo PIX gerado para o valor do upsell (R$37)
    |
    v
[Entrega — automatica em ate 24h]
  - WhatsApp via API (ex: Z-API ou Twilio)
  - E-mail via Resend ou SendGrid
```

---

## 5. Backlog Priorizado (Stories)

As stories estao ordenadas por dependencia tecnica e valor de negocio.
Cada story deve ser concluida e validada antes do inicio da proxima (exceto paralelas indicadas).

---

### Story 1 — Setup Next.js 14 + Tailwind + Estrutura de Pastas

**Descricao:** Criar o projeto base com todas as dependencias aprovadas configuradas e prontas para desenvolvimento.

**Criterios de Aceite:**
1. Projeto Next.js 14 com App Router criado e rodando localmente em `http://localhost:3000`.
2. Tailwind CSS configurado com tema customizado ViraHit (cores, fontes, espacamentos).
3. shadcn/ui instalado com componentes basicos adicionados: Button, Card, Input, Progress, Toggle.
4. Estrutura de pastas criada: `/app`, `/components`, `/lib`, `/hooks`, `/public/audio`, `/public/video`.
5. Variaveis de ambiente configuradas em `.env.local` e `.env.example` documentado.
6. Deploy inicial no Vercel funcionando com build sem erros.

**Dependencias:** Nenhuma.

---

### Story 2 — Landing Page (Componentes Visuais + Design System ViraHit)

**Descricao:** Implementar a landing page completa com todos os componentes MUST HAVE e design system aplicado.

**Criterios de Aceite:**
1. Hero com headline em formato depoimento-aspas, sub-headline e botao CTA visivel sem scroll em 375px.
2. Carrossel de 8 ocasioes com emoji funcional e swipe no mobile. Clique redireciona para `/quiz?ocasiao=<slug>`.
3. Secao de 3 videos de reacao com lazy load implementado (nao bloqueia o carregamento inicial).
4. Tres players de audio com lazy load. Cada player exibe nome, ocasiao e estilo.
5. Box de garantia 7 dias visivel na pagina (nao apenas no checkout).
6. Texto de urgencia `Sua musica entregue em ate 24 horas` em destaque na pagina.
7. CTA secundario no rodape ancora corretamente para o hero.
8. Lighthouse Performance Score >= 80 no mobile.

**Dependencias:** Story 1.

---

### Story 3 — Quiz Passos 1 a 4 (Progress Bar, Auto-save, Voice Input)

**Descricao:** Implementar os primeiros 4 passos do quiz com toda a logica de navegacao, persistencia e micro-provas sociais.

**Criterios de Aceite:**
1. Passo 1 exibe 8 opcoes com emoji. Selecao avanca automaticamente para o Passo 2.
2. Passo 2 tem campo de nome obrigatorio. Botao Proximo bloqueado se vazio ou < 2 caracteres.
3. Passo 3 tem selecao de estilo (5 opcoes) e voz (2 opcoes). Avancar so ativo apos ambas selecionadas.
4. Passo 4 tem textarea opcional, voice input funcional no Chrome mobile e auto-save a cada 3s de inatividade.
5. Barra de progresso reflete o passo atual corretamente em todos os passos.
6. Botao voltar disponivel nos Passos 2, 3 e 4. Nao apaga dados do passo anterior.
7. Micro-prova social exibe texto correto para cada tipo de destinatario selecionado no Passo 1.
8. Dados de todos os passos sao persistidos em sessionStorage e sobrevivem a reload.

**Dependencias:** Story 1.

---

### Story 4 — Quiz Passo 5 (Selecao de Plano)

**Descricao:** Implementar o passo final do quiz com cards de plano, destaque no plano recomendado e transicao para o checkout.

**Criterios de Aceite:**
1. Tres cards de plano exibidos com preco, nome e diferenciais de cada plano.
2. Card "Mais Escolhido" (R$67) tem badge visual de destaque `MAIS POPULAR`.
3. Selecao de plano habilita o botao `Quero essa musica`.
4. Preview dinamico exibe os dados do quiz antes da confirmacao.
5. Ao clicar em `Quero essa musica`, usuario e redirecionado para `/checkout` com todos os dados do quiz no sessionStorage.

**Dependencias:** Story 3.

---

### Story 5 — Checkout Formulario + Integracao WOOVI Sandbox

**Descricao:** Implementar o formulario de checkout e a integracao com WOOVI em modo sandbox para geracao de cobranca PIX.

**Criterios de Aceite:**
1. Resumo personalizado exibe nome, ocasiao, estilo, voz, plano e valor vindos do quiz.
2. Formulario com 3 campos: nome comprador, email, telefone (com mascara). Validacoes client-side funcionando.
3. Ao preencher email valido, a API Route `/api/checkout/criar-pix` e chamada e retorna `brCode` e `qrCodeImage`.
4. QR Code e exibido em menos de 3 segundos apos preenchimento do email.
5. Chave PIX copia-e-cola exibida abaixo do QR Code com botao de copiar funcional.
6. Em modo sandbox, pagamento simulado e aceito e polling detecta confirmacao.

**Dependencias:** Story 4.

---

### Story 6 — Checkout QR Code + Polling de Confirmacao + Modo Discreto

**Descricao:** Finalizar o checkout com polling de status, timer de expiracao, modo discreto e redirecionamento automatico.

**Criterios de Aceite:**
1. Timer de expiracao do PIX (15 minutos) conta regressivamente na tela.
2. Ao atingir zero, mensagem de expiracao e exibida com botao `Gerar novo PIX`.
3. Polling GET status WOOVI executado a cada 5 segundos sem bloquear a UI.
4. Apos confirmacao, usuario e redirecionado automaticamente para `/obrigado?pedido=<ID>`.
5. Toggle `E um presente surpresa?` funciona e exibe mensagem de confirmacao ao ser ativado.
6. Feedback visual de "aguardando pagamento" (spinner + texto) ativo durante polling.

**Dependencias:** Story 5.

---

### Story 7 — Pagina Obrigado + Upsell

**Descricao:** Implementar a pagina pos-pagamento com confirmacao personalizada, instrucoes de entrega e oferta de upsell.

**Criterios de Aceite:**
1. Pagina exibe nome do comprador e do presenteado corretamente.
2. Numero do pedido (ID WOOVI / correlationID) e exibido.
3. Lista de instrucoes claras com proximos passos exibida.
4. Box de upsell exibe preco R$37 e temporizador de 10 minutos funcionando.
5. Botao `Quero uma segunda musica` redireciona para novo checkout pre-preenchido.
6. Pixel Meta Ads evento `Purchase` dispara com valor correto ao carregar a pagina.

**Dependencias:** Story 6.

---

### Story 8 — Integracao Baserow (Salvar Pedido)

**Descricao:** Implementar o webhook WOOVI e a logica de persistencia do pedido no Baserow apos confirmacao de pagamento.

**Criterios de Aceite:**
1. Endpoint `/api/webhooks/woovi` recebe e valida assinatura HMAC corretamente.
2. Pedido e salvo no Baserow com todos os campos obrigatorios preenchidos.
3. Idempotencia implementada: pedido duplicado nao cria novo registro.
4. Status inicial salvo como `confirmado`.
5. Em caso de falha na API Baserow, o erro e logado e uma nova tentativa e agendada.
6. Logs de webhook visiveis no Vercel Functions para debug.

**Dependencias:** Story 6.

---

### Story 9 — Order Bump no Checkout

**Descricao:** Implementar o componente de order bump entre o formulario e o botao de pagamento.

**Criterios de Aceite:**
1. Order bump exibido entre formulario e botao, com checkbox e descricao da oferta.
2. Preco adicional exibido em destaque (+R$17 ou valor definido).
3. Ao marcar o checkbox, o valor total do PIX e atualizado antes da geracao do QR Code.
4. Se QR Code ja foi gerado, novo QR Code com valor atualizado e gerado automaticamente.
5. Campo `order_bump` salvo como `true` no registro Baserow quando aceito.
6. Taxa de adesao rastreavel via evento no Pixel Meta Ads.

**Dependencias:** Story 5, Story 8.

---

### Story 10 — Testes End-to-End + Correcoes QA

**Descricao:** Executar suite de testes automatizados e manuais em todo o funil. Corrigir todos os bugs criticos e majorias.

**Criterios de Aceite:**
1. Suite Playwright ou Cypress cobrindo o fluxo completo: landing -> quiz -> checkout -> obrigado.
2. Testes de regressao para os 3 planos e para o order bump.
3. Testes em dispositivos reais ou emulados: iPhone SE, iPhone 14, Samsung S21, iPad.
4. Zero bugs criticos (bloqueiam o fluxo de compra) abertos.
5. Bugs menores documentados no backlog com priorizacao.

**Dependencias:** Stories 1 a 9.

---

### Story 11 — Copy Real Injetada

**Descricao:** Substituir todos os textos de placeholder pela copy definitiva aprovada pelo time de marketing.

**Criterios de Aceite:**
1. Todos os headlines, sub-headlines e CTAs substituidos pela copy final.
2. Depoimentos reais inseridos no hero e no carrossel.
3. Textos das micro-provas sociais do quiz revisados e aprovados.
4. Copy do order bump e upsell finalizada.
5. FAQ com perguntas e respostas reais inserido na landing page.
6. Revisao ortografica completa sem erros.

**Dependencias:** Story 2, Story 3, Story 4, Story 7, Story 9.

---

### Story 12 — Otimizacoes Mobile + Performance

**Descricao:** Garantir performance e usabilidade maximas no mobile, com foco no publico-alvo (mulheres 35-55, dispositivos intermediarios).

**Criterios de Aceite:**
1. Lighthouse Performance >= 85 no mobile em todas as 4 telas principais.
2. Largest Contentful Paint (LCP) <= 2.5s na landing page em 4G simulado.
3. Todos os videos e audios com lazy load correto.
4. Nenhum elemento com tap target menor que 44x44px no mobile.
5. Fonte principal carregada via `next/font` sem layout shift (CLS <= 0.1).
6. Imagens otimizadas com `next/image` em todos os casos aplicaveis.

**Dependencias:** Story 10, Story 11.

---

## 6. Riscos

| # | Risco | Probabilidade | Impacto | Mitigacao |
|---|-------|---------------|---------|-----------|
| 1 | **Indisponibilidade da API WOOVI em producao** | Media | Alto | Implementar retry com backoff exponencial. Ter contato direto com suporte WOOVI. Monitorar uptime via UptimeRobot. |
| 2 | **Taxa de conversao abaixo do benchmark minimo (< 1.5%)** | Media | Alto | Monitorar heatmaps (Hotjar) desde o dia 1. Ter hipoteses de A/B test prontas para headline, CTA e plano destacado. Revisar copy com especialista em direct response. |
| 3 **Falha no webhook WOOVI (pedido confirmado mas nao salvo no Baserow)** | Baixa | Alto | Implementar idempotencia + fila de retry. Reconciliacao diaria entre pagamentos WOOVI e registros Baserow. Alertas via Slack/email para falhas de webhook. |
| 4 | **Performance ruim em dispositivos Android intermediarios** | Alta | Medio | Testar em dispositivos reais com conexao 4G desde a Story 2. Limite de bundle JS < 200kb na first load. Videos em formato .mp4 otimizado. |
| 5 | **Abandono elevado no Passo 4 do quiz (campo historia)** | Media | Medio | Tornar o campo completamente opcional com indicacao visual clara. Adicionar placeholders inspiradores. Voice input como alternativa ao texto. Validar drop-off com analytics. |
| 6 | **Bloqueio de anuncios Meta Ads por termos sensiveis** | Media | Alto | Revisar copy da landing page com checklist de politicas Meta. Nao usar termos como "garantido", "milagre". Ter variacao de landing page para testes de aprovacao. |
| 7 | **LGPD e privacidade de dados** | Baixa | Alto | Adicionar banner de cookies, politica de privacidade, consentimento explicito no formulario. Dados de clientes armazenados apenas no Baserow (nao em localStorage apos pagamento). |

---

## 7. Definicao de Pronto

Uma story e considerada **PRONTA** quando todos os criterios abaixo forem atendidos:

**Codigo:**
- [ ] Todos os criterios de aceite da story foram implementados e verificados manualmente.
- [ ] Codigo revisado por ao menos 1 outro membro da equipe (pull request aprovado).
- [ ] Nenhum warning de TypeScript ou ESLint introduzido pela mudanca.
- [ ] Nenhum `console.log` de debug deixado no codigo de producao.

**Testes:**
- [ ] Testes unitarios escritos para logica critica (calculos de valor, validacoes, chamadas de API).
- [ ] Fluxo principal testado manualmente em Chrome (desktop) e Safari (mobile).
- [ ] Nenhum erro no console do browser durante o fluxo principal.

**Performance:**
- [ ] Lighthouse Performance Score nao caiu abaixo de 75 no mobile para a pagina afetada.

**Deploy:**
- [ ] Build de producao (`next build`) passa sem erros.
- [ ] Feature deployada no ambiente de staging no Vercel.
- [ ] Variaveis de ambiente necessarias documentadas no `.env.example`.

**Produto:**
- [ ] PM ou stakeholder validou a entrega no staging antes de marcar como pronta.
- [ ] Metricas de acompanhamento configuradas (evento no Pixel, log de analytics).
- [ ] Documentacao atualizada se houver mudanca de fluxo ou integracao.

---

## Apendice A — Design System ViraHit (Referencia)

| Token           | Valor           | Uso                              |
|-----------------|-----------------|----------------------------------|
| `primary`       | `#E91E8C`       | CTAs, botoes, destaques          |
| `primary-dark`  | `#C0156F`       | Hover de botoes primarios        |
| `secondary`     | `#FF6B35`       | Urgencia, badges, alertas        |
| `success`       | `#22C55E`       | Garantia, confirmacao, sucesso   |
| `background`    | `#FFF8F5`       | Fundo geral da pagina            |
| `text-primary`  | `#1A1A2E`       | Titulos e textos principais      |
| `text-muted`    | `#6B7280`       | Textos secundarios               |
| Fonte titulo    | `Playfair Display` | Headlines e depoimentos        |
| Fonte corpo     | `Inter`         | Paragrafo, formularios, labels   |

---

## Apendice B — Estrutura de Pastas Recomendada

```
/funil-web
  /app
    /page.tsx                  <- Landing Page
    /quiz/page.tsx             <- Quiz (gerencia passos via estado)
    /checkout/page.tsx         <- Checkout
    /obrigado/page.tsx         <- Pos-pagamento
    /api
      /checkout/criar-pix/route.ts
      /checkout/status/route.ts
      /webhooks/woovi/route.ts
  /components
    /landing
      HeroSection.tsx
      OcasiaoCarousel.tsx
      VideoReacoes.tsx
      AudioPlayers.tsx
      GarantiaBox.tsx
    /quiz
      ProgressBar.tsx
      QuizStep1.tsx
      QuizStep2.tsx
      QuizStep3.tsx
      QuizStep4.tsx
      QuizStep5.tsx
      MicroProvaSocial.tsx
    /checkout
      ResumoPedido.tsx
      FormularioComprador.tsx
      QRCodePix.tsx
      ModoDiscreto.tsx
      OrderBump.tsx
      UrgenciaCheckout.tsx
    /shared
      AudioPlayer.tsx
      GarantiaBox.tsx
      CTAButton.tsx
  /lib
    woovi.ts                   <- cliente WOOVI
    baserow.ts                 <- cliente Baserow
    quiz-store.ts              <- logica sessionStorage
  /hooks
    useQuizState.ts
    usePollingPix.ts
  /public
    /audio
    /video
    /images
```

---

## Apendice C — Checklist de Launch

- [ ] Variaveis de ambiente de producao configuradas no Vercel (WOOVI producao, Baserow token).
- [ ] Webhook WOOVI cadastrado no painel WOOVI apontando para URL de producao.
- [ ] Pixel Meta Ads configurado com os eventos: `ViewContent` (landing), `InitiateCheckout` (quiz p5), `Purchase` (obrigado).
- [ ] Google Analytics 4 ou Plausible configurado.
- [ ] Dominio customizado configurado no Vercel com SSL.
- [ ] Politica de privacidade e termos de uso publicados e linkados no footer.
- [ ] Teste de compra real com todos os 3 planos antes de subir trafego pago.
- [ ] Monitoramento de erros (Sentry) configurado.
- [ ] Backup automatico Baserow configurado.
- [ ] Numero de suporte WhatsApp funcional e testado.

---

*PRD gerado por Morgan — Product Manager ViraHit. Versao 1.0 — Maio 2026.*
*Para sugestoes ou alteracoes, abrir issue no repositorio ou contatar o PM diretamente.*
