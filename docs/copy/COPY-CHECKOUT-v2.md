# COPY — CHECKOUT
**Versao:** v2.0
**Data:** 2026-05-08
**Status:** Pronto para desenvolvimento
**Posicao no funil:** Tela de Conversao → [CHECKOUT] → Pos-pagamento
**Changelog v1.0 → v2.0:**
- Modo Discreto removido — nao faz sentido no modelo de entrega atual
- Cartao adicionado como metodo alternativo (modal Stripe inline, sem redirect)
- Parcelamento 2x de R$23,50 sem juros
- PIX pre-gerado no background ao sair da tela de conversao
- Botao copiar PIX reposicionado acima do QR Code
- Garantia movida para antes do QR Code

---

## FUNCAO DA TELA

Uma unica funcao: a pessoa paga.

A venda foi feita na tela anterior. Os dados foram coletados na tela anterior.
Aqui nao tem copy de venda. Nao tem campo novo. Nao tem decisao nova.
Tem so o PIX pronto para escanear — e o cartao visivel para quem preferir.

O cartao nao esta aqui para vender. Esta aqui para transmitir credibilidade.
Quando a pessoa ve so PIX ela pode pensar em golpe. Ver PIX + cartao = empresa real.

---

## DADOS DISPONIVEIS

Todos gravados na tela anterior e no Baserow:

| Dado | Exemplo |
|---|---|
| [NOME] | Ana / Jorge |
| [A_O] | a / o |
| [DA_DO] | da / do |
| [estiloMusical] | Sertanejo |
| [vozMusical] | Feminina |
| [compradorNome] | Claudia |
| [compradorWhatsApp] | (11) 99999-9999 |
| [idPedido] | ID gerado pelo WOOVI |
| [dataEntregaGarantida] | calculado dinamicamente |

---

## CABECALHO

Logo ViraHit centralizada. Nada mais.
Sem botao voltar. Sem menu. Sem X.
Quem precisar voltar usa o botao do proprio navegador.

---

## BLOCO 1 — RESUMO DO PEDIDO

Posicao: topo da tela, primeiro elemento abaixo do cabecalho.
Funcao: ela confirma que esta tudo certo antes de pagar. Se errou alguma coisa no quiz, ve aqui.

### Linha principal
```
Sua musica para [A_O] [NOME]
```

Exemplos renderizados:
- "Sua musica para a Ana"
- "Sua musica para o Jorge"

Tipografia: Open Sans 700, 20px, teal (#2C5D63), centralizado

### Linha de detalhes
```
[estiloMusical]  ·  Voz [vozMusical]  ·  Entrega em 24h pelo WhatsApp
```

Exemplo renderizado:
- "Sertanejo  ·  Voz Feminina  ·  Entrega em 24h pelo WhatsApp"

Tipografia: Merriweather, 13px, teal 60%, centralizado
Separador "·": espaco dos dois lados, teal 40%

Separacao abaixo do bloco: divider 1px teal/10 + margem 24px

---

## BLOCO 2 — GARANTIA

Posicao: imediatamente abaixo do resumo, ANTES do QR Code.
Funcao: o ultimo pensamento antes de pagar nao pode ser "e se nao gostar?". A garantia resolve isso aqui.

### Box de garantia
Visual: fundo cream (#F4EEDC), borda 1px solid teal 20%, border-radius 12px, padding 16px

Layout interno: icone escudo lado esquerdo + texto lado direito

Icone: 🛡 teal, 24px

Copy:
```
Garantia 7 dias — nao gostou por qualquer motivo,
a gente devolve tudo. Sem perguntas.
```

Tipografia: Merriweather, 13px, teal

Separacao abaixo: margem 24px

---

## BLOCO 3 — PAGAMENTO

### Sub-titulo do bloco
```
COMO VOCE QUER PAGAR?
```
Tipografia: Open Sans 700, 13px, teal 50%, uppercase, letter-spacing 0.08em, centralizado

---

### SECAO PIX (default — ja expandida ao carregar)

#### Selector de metodo
Dois tabs lado a lado, largura igual, border-radius pill:

```
[  ● PIX  ]     [  ○ Cartao de Credito  ]
```

PIX selecionado por padrao (fundo teal, texto branco).
Cartao nao selecionado (fundo branco, borda teal 30%, texto teal 60%).
Tocar no tab do cartao colapsa o PIX e expande o form de cartao.

---

#### Instrucao
```
Escaneie o QR Code ou copie o codigo:
```
Tipografia: Merriweather, 14px, teal 70%, centralizado

---

#### Botao copiar codigo PIX
Posicao: ACIMA do QR Code.
Motivo: 80% do trafego e mobile. No mobile a pessoa nao escaneia — ela copia o codigo e cola no app do banco. O botao precisa ser o primeiro elemento, nao o segundo.

```
[ 📋  Copiar codigo PIX ]
```

Visual:
- Fundo: teal (#2C5D63)
- Texto: branco, Open Sans 700, 15px
- Border-radius: pill
- Largura: 100% mobile / max 320px centralizado desktop
- Padding: 16px 24px
- Icone de copia lado esquerdo

Comportamento:
- Copia o codigo PIX copia-e-cola para o clipboard
- Feedback imediato: texto muda para "Copiado! ✓" por 2 segundos, fundo teal mais escuro
- Volta ao texto original apos 2 segundos

---

#### QR Code
Posicao: abaixo do botao copiar.
Dimensao: 200x200px, centralizado
Padding ao redor: 16px fundo branco — garante leitura pelo celular
Borda: 1px solid teal, border-radius 8px

Comportamento: gerado via WOOVI no background quando a pessoa clicou no CTA da tela de conversao. Ao chegar no checkout, o QR Code ja esta pronto — zero loading, zero espera.

---

#### Valor
```
R$ 47,00
```
Tipografia: Open Sans 800, 32px, teal (#2C5D63), centralizado
Posicao: imediatamente abaixo do QR Code

---

#### Timer regressivo
```
PIX valido por 15:00
```
Tipografia: Merriweather, 13px, teal 60%, centralizado
Comportamento:
- Contador regressivo MM:SS a partir de 15:00
- Quando chega em 05:00: cor muda para #E53935 (vermelho)
- Quando chega em 00:00: estado de expiracao (ver abaixo)

---

#### Polling de confirmacao
- Frontend faz polling a cada 3 segundos no endpoint WOOVI
- Nenhum indicador visual — transparente para o usuario
- Quando pagamento confirmado: overlay de confirmacao + redirect para /pos-pagamento

---

### SECAO CARTAO (colapsada por padrao — expande ao tocar no tab)

Quando o tab "Cartao de Credito" e selecionado:
- Secao PIX colapsa com fade-out suave (200ms)
- Secao cartao expande com fade-in suave (200ms)
- QR Code nao some do servidor — PIX continua ativo ate expirar ou ser pago

#### Ancora de preco parcelado
```
2x de R$ 23,50 sem juros  —  ou  R$ 47,00 a vista
```
Tipografia: Merriweather, 14px, teal 70%, centralizado
Posicao: acima do form de cartao

Nota: essa linha e a ancora de preco do cartao. "2x de R$23,50" reduz percepcao de custo antes de mostrar o form. Aparece so quando cartao esta selecionado.

#### Form de cartao (Stripe Elements — inline, sem redirect)
Campos renderizados pelo Stripe diretamente na pagina:
- Numero do cartao
- Validade
- CVV
- Nome no cartao

Visual dos campos Stripe: customizar com variaveis CSS do Stripe Elements para alinhar com design system ViraHit (fonte Merriweather, cor teal, border-radius 8px, fundo cream).

#### CTA cartao
```
Pagar R$ 47,00 no cartao →
```

Visual: identico ao CTA padrao (gold, pill, branco, Open Sans 800)
Comportamento: processa pagamento via Stripe, redirect para /pos-pagamento em caso de sucesso

---

## BLOCO 4 — URGENCIA

Posicao: abaixo do bloco de pagamento, acima dos trust signals.

```
Entrega garantida ate [dataEntregaGarantida]
```

Exemplo renderizado:
- "Entrega garantida ate sabado, 10 de maio"

Calculo da data:
- Se horario atual < 18h em dia util: hoje + 1 dia util
- Se horario atual >= 18h OU fim de semana: proximo dia util + 1
- Formato: dia da semana + dia + mes

Tipografia: Merriweather, 13px, teal 70%, centralizado

---

## BLOCO 5 — TRUST SIGNALS

Posicao: abaixo da urgencia.
Funcao: tranquilizar. Nao informar, nao vender. So tranquilizar.

### Icones de pagamento
Linha unica, centralizada:
```
[PIX]  [Visa]  [Mastercard]  [Stripe]
```

Visual: fundo branco, borda 1px solid teal/10, border-radius 4px, padding 4px, opacidade 70%
Dimensao: 40x24px cada, gap 8px

Abaixo dos icones:
```
Pagamento 100% seguro
```
Tipografia: Merriweather, 11px, teal 50%, centralizado

---

### Trust signal WhatsApp
```
[icone WhatsApp estatico]  Duvidas? Monica disponivel no WhatsApp.
```

Tipografia: Merriweather, 11px, teal 50%, centralizado

IMPORTANTE: isso e texto informativo — NAO e botao clicavel.
Motivo: botao flutuante de WhatsApp no checkout aumenta abandono (dado Baymard: suprimir chat reduziu abandono de 55% para 38%). Icone estatico funciona como trust signal sem desviar a pessoa da pagina.

---

## RODAPE MINIMO

```
ViraHit · Musica personalizada feita com historia real
```
Tipografia: Merriweather, 11px, teal 40%, centralizado

---

## ESTADO — PIX EXPIRADO

Quando timer chega em 00:00 e pagamento nao confirmado:

QR Code some.
Botao copiar some.
Timer some.

Aparece:
```
O codigo PIX expirou.
```

Abaixo, CTA:
```
Gerar novo codigo PIX →
```

Visual: gold, pill — mesmo estilo do CTA padrao
Comportamento: gera novo QR Code via WOOVI, timer reinicia em 15:00

---

## ESTADO — PAGAMENTO CONFIRMADO (transicao)

Quando polling confirma pagamento PIX ou Stripe confirma cartao:

1. Overlay suave sobre a tela (fundo cream, 80% opacidade)
2. Icone check animado centralizado (verde #25D366, 64px, scale 0→1.1→1.0, 500ms)
3. Texto abaixo do check:
```
Pagamento confirmado!
```
4. Duracao do overlay: 1.5 segundos
5. Redirect automatico para /pos-pagamento

Nao ha botao neste estado — transicao automatica.

---

## CHECKLIST DE COPY

- [ ] Resumo do pedido com nome e detalhes corretos no topo
- [ ] Garantia visivel ANTES do QR Code
- [ ] Tab PIX pre-selecionado ao carregar
- [ ] Botao copiar PIX ACIMA do QR Code
- [ ] QR Code ja gerado ao chegar na pagina — zero loading
- [ ] Valor R$47,00 claro e visivel abaixo do QR Code
- [ ] Timer regressivo real — vira vermelho em 5 minutos
- [ ] Aba cartao visivel como alternativa — transmite credibilidade
- [ ] Ancora parcelamento "2x de R$23,50" aparece so quando cartao selecionado
- [ ] Form Stripe inline — sem redirect
- [ ] Urgencia com data dinamica real
- [ ] Trust signals discretos — nao competem com o CTA
- [ ] WhatsApp como texto informativo — NAO botao clicavel
- [ ] Nenhum campo novo de dados
- [ ] Nenhum conteudo de venda novo
- [ ] "Comprar" nao aparece em lugar nenhum

---

## NOTAS PARA O DEV

1. PIX pre-gerado: quando a pessoa clica no CTA da tela de conversao, o backend ja dispara a criacao do QR Code via WOOVI usando os dados do pedido (ja no Baserow com status "pre_checkout"). Ao chegar no checkout, o QR Code esta pronto. Zero loading.

2. Se a pessoa demorar mais de 15 minutos entre a tela de conversao e o checkout (raro mas possivel): gerar novo QR Code automaticamente ao carregar a pagina.

3. Polling PIX: GET /api/pagamento/status?pedidoId=[idPedido] a cada 3 segundos. Response: {status: "pendente" | "pago" | "expirado"}.

4. Cartao e PIX coexistem: quando cartao esta selecionado, o PIX continua ativo no servidor ate expirar naturalmente ou ser pago. Se a pessoa pagar no cartao, cancelar o PIX pendente via WOOVI API para nao ter dois pagamentos.

5. Stripe Elements: usar appearance API para customizar os campos do cartao com o design system ViraHit. Documentacao: stripe.com/docs/elements/appearance-api.

6. dataEntregaGarantida: calcular server-side para evitar inconsistencia de fuso horario. Retornar string formatada pronta ("sabado, 10 de maio").

7. Acesso direto por URL sem idPedido no sessionStorage: redirecionar para inicio do quiz.

8. Campo WhatsApp salvo no Baserow sem mascara: so digitos + DDI 55 ("5511999999999").

9. Parcelamento 2x: configurar no Stripe como installment plan. Sem juros = ViraHit absorve o custo do parcelamento (Stripe cobra a taxa cheia no processamento). Avaliar se vale a pena manter depois de ter dados de conversao por metodo.
