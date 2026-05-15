# COPY — CHECKOUT PIX
**Versao:** v1.0
**Data:** 2026-05-08
**Status:** Pronto para desenvolvimento
**Posicao no funil:** Tela de Conversao → [CHECKOUT PIX] → Pos-pagamento
**Objetivo:** Tela tecnica de pagamento — sem nova venda, so fechar o PIX

---

## FUNCAO DA TELA

A venda foi feita na tela anterior. Aqui o objetivo e um so: o usuario escaneia ou copia o PIX e paga.

Nenhum conteudo novo de venda.
Nenhum campo de dados (todos ja foram coletados).
Nenhuma distracacao.
Uma acao: pagar.

---

## DADOS DISPONIVEIS VIA SESSIONSTORAGE / BASEROW

Todos gravados na tela anterior:

| Dado | Exemplo |
|---|---|
| [NOME] | Ana / Jorge |
| [A_O] | a / o |
| [DA_DO] | da / do |
| [estiloMusical] | Sertanejo |
| [vozMusical] | Feminina |
| [valorTotal] | R$ 47,00 ou R$ 74,00 (com order bump) |
| [idPedido] | ID gerado pelo WOOVI |
| [dataEntregaGarantida] | hoje + 1 dia util (calculado dinamicamente) |

---

## BLOCO 1 — RESUMO PERSONALIZADO

Posicao: topo da tela, antes do QR Code

### Linha principal
```
Sua musica para [A_O] [NOME]
```

Exemplos renderizados:
- "Sua musica para a Ana"
- "Sua musica para o Jorge"

### Linha de detalhes
```
Estilo: [estiloMusical]  ·  Voz: [vozMusical]  ·  Entrega: 24h pelo WhatsApp
```

Exemplo renderizado:
- "Estilo: Sertanejo  ·  Voz: Feminina  ·  Entrega: 24h pelo WhatsApp"

Tipografia linha principal: Open Sans 700, 20px, teal (#2C5D63)
Tipografia detalhes: Merriweather, 13px, teal 60%
Alinhamento: centralizado
Separador "·": espaco em branco dos dois lados, teal 40%

---

## BLOCO 2 — PIX / QR CODE

### Instrucao acima do QR Code
```
Escaneie o QR Code ou copie o codigo PIX:
```

Tipografia: Merriweather, 14px, teal 70%, centralizado

### QR Code
- Gerado via WOOVI assim que a pagina carrega
- Dimensao: 200x200px, centralizado
- Padding ao redor: 16px fundo branco (#FFFFFF) — garantia de leitura
- Borda: 1px solid teal (#2C5D63), border-radius 8px

### Valor e timer abaixo do QR Code

Linha do valor:
```
R$ 47,00
```
(ou R$ 74,00 se order bump foi marcado)

Tipografia: Open Sans 800, 28px, teal
Centralizado, imediatamente abaixo do QR Code

Timer regressivo:
```
PIX valido por 15:00
```

Tipografia: Merriweather, 13px, teal 60%
Comportamento:
- Contador regressivo MM:SS a partir de 15:00
- Quando chegar em 05:00: texto muda para "PIX valido por 05:00", cor muda para #E53935 (vermelho)
- Quando chegar em 00:00: tela exibe estado de expiracao (ver abaixo)
- Regressivo em tempo real — sem refresh de pagina

### Botao copiar codigo PIX
```
Copiar codigo PIX
```

Visual:
- Fundo: branco
- Borda: 2px solid teal (#2C5D63)
- Texto: teal, Open Sans 700, uppercase, 14px
- Border-radius: pill
- Largura: 100% mobile / max 320px centralizado desktop
- Icone: copia (dois quadrados sobrepostos) lado esquerdo do texto

Comportamento:
- Copia o codigo PIX copia-e-cola para o clipboard
- Feedback imediato: texto do botao muda para "Copiado! ✓" por 2 segundos, cor teal mais escura
- Volta ao texto original apos 2 segundos

### Polling de confirmacao
- Frontend faz polling a cada 3 segundos no endpoint WOOVI para verificar pagamento
- Nenhum indicador visual de polling (transparente para o usuario)
- Quando pagamento confirmado: redirect imediato para /pos-pagamento sem acao do usuario

---

## BLOCO 3 — MODO DISCRETO

Posicao: abaixo do bloco do QR Code, acima da garantia

### Copy do toggle
```
🎁  E um presente surpresa?
```

Tipografia: Merriweather, 14px, teal
Toggle: lado direito, estilo switch (off por padrao)

### Copy quando ativado (aparece abaixo do toggle)
```
Entendido. Nao mencionamos o valor na mensagem de entrega.
```

Tipografia: Merriweather, 12px, teal 60%, italico

Comportamento:
- Toggle off por padrao
- Quando ativado: flag "modoDiscreto: true" salva no pedido (Baserow)
- Quando ativado: mensagem de entrega no WhatsApp nao menciona valor pago

---

## BLOCO 4 — GARANTIA

Posicao: abaixo do Modo Discreto

### Box de garantia
Fundo: cream (#F4EEDC), borda 1px solid teal 30%, border-radius 12px, padding 16px

Icone: escudo com check (🛡) lado esquerdo, teal, 24px

Copy:
```
Garantia 7 dias — nao gostou, a gente recompoe ou devolve tudo.
Sem perguntas.
```

Tipografia: Merriweather, 13px, teal

---

## BLOCO 5 — URGENCIA

Posicao: abaixo da garantia

### Copy
```
Entrega garantida ate [dataEntregaGarantida]
```

Exemplo renderizado:
- "Entrega garantida ate sabado, 10 de maio"

Calculo da data:
- Se horario atual < 18h em dia util: hoje + 1 dia util
- Se horario atual >= 18h OU fds: proximo dia util + 1
- Formato: dia da semana + dia + mes (ex: "sabado, 10 de maio")

Tipografia: Merriweather, 13px, teal 70%, centralizado

---

## BLOCO 6 — TRUST SIGNALS

Posicao: abaixo da urgencia, antes do rodape

### Copy
```
Pagamento 100% seguro via PIX
```

Visual: logo WOOVI (pequena, 80px) + texto "Pagamento 100% seguro via PIX"
Alinhamento: centralizado, horizontal
Tipografia: Merriweather, 11px, teal 50%

### Duvidas (estatico, sem botao clicavel)
```
Duvidas? Monica disponivel no WhatsApp.
```

Tipografia: Merriweather, 11px, teal 50%, centralizado
Comportamento: sem botao — apenas informativo. Nao ha botao flutuante nesta tela.

---

## ESTADO — PIX EXPIRADO

Quando o timer chega em 00:00 e pagamento nao foi confirmado:

QR Code some.
Botao copiar some.
Timer some.

Aparece:
```
O codigo PIX expirou.
```

Abaixo:
```
Gerar novo codigo PIX →
```

Visual do botao: mesmo estilo do CTA da tela anterior (gold, pill)
Comportamento: gera novo QR Code via WOOVI, timer reinicia em 15:00

---

## ESTADO — PAGAMENTO CONFIRMADO (transicao)

Quando polling confirma pagamento:
- Overlay suave sobre a tela (fundo cream semi-transparente)
- Icone de check animado centralizado (verde, 64px, animacao de entrada 400ms)
- Texto abaixo: "Pagamento confirmado!"
- Duracao: 1.5 segundos
- Redirect automatico para /pos-pagamento

Nao ha botao neste estado — a transicao e automatica.

---

## O QUE NAO APARECE NESTA TELA

- Nenhum campo de dados novo
- Nenhuma selecao (order bump, planos)
- Nenhum conteudo de venda
- Nenhum botao flutuante de chat
- Sem CPF (nao obrigatorio para PIX abaixo de R$200 sem NF-e)
- Sem logo ViraHit grande ou header chamativo — foco total no QR Code

---

## CHECKLIST DE COPY

- [ ] Resumo personalizado com nome e detalhes do pedido no topo
- [ ] QR Code centralizado e legivel
- [ ] Valor claro e visivel
- [ ] Timer regressivo visivel (urgencia real, nao artificial)
- [ ] Botao copiar codigo funcional com feedback
- [ ] Modo Discreto discreto — toggle, nao destaque
- [ ] Garantia visivel mas nao dominante
- [ ] Trust signal WOOVI presente
- [ ] Nenhum campo novo de dados
- [ ] Nenhum CTA competindo

---

## NOTAS PARA O DEV

1. QR Code gerado via WOOVI logo que a pagina carrega. O ID do pedido ja existe no Baserow (criado na tela anterior). O QR Code usa esse ID.
2. Polling a cada 3 segundos: GET /api/pagamento/status?pedidoId=[idPedido]. Response: {status: "pendente" | "pago" | "expirado"}.
3. dataEntregaGarantida: calcular server-side para evitar inconsistencia de fuso horario. Retornar string formatada pronta para exibicao.
4. Modo Discreto: salvar como campo booleano no pedido no Baserow ("modo_discreto: true/false"). O sistema de entrega por WhatsApp le esse campo.
5. Se usuario recarregar a pagina enquanto PIX esta ativo: recuperar idPedido do localStorage/sessionStorage, gerar QR Code novo via WOOVI (o pedido ja existe). Nao criar pedido duplicado.
6. Order bump: se foi marcado na tela anterior, o valorTotal ja deve ser R$74,00 no QR Code. Nao re-calcular nesta tela.
