# COPY — POS-PAGAMENTO
**Versao:** v1.0
**Data:** 2026-05-08
**Status:** Pronto para desenvolvimento
**Posicao no funil:** Checkout PIX → [POS-PAGAMENTO] → (fim do funil obrigatorio)
**Objetivo:** Confirmar o pedido, transmitir seguranca e abrir para upsell de segunda musica

---

## FUNCAO DA TELA

Tres funcoes em ordem:
1. Confirmar — o usuario comprou, o pedido esta em producao, ele pode respirar
2. Orientar — o que acontece agora, quando chega, onde chega
3. Upsell — segunda musica com desconto, timer de 10 minutos, sem pressao agressiva

---

## DADOS DISPONIVEIS

| Dado | Exemplo |
|---|---|
| [NOME] | Ana / Jorge |
| [A_O] | a / o |
| [DA_DO] | da / do |
| [ELA_ELE] | ela / ele |
| [compradorWhatsApp] | (11) 99999-9999 |
| [compradorEmail] | exemplo@gmail.com |
| [estiloMusical] | Sertanejo |
| [vozMusical] | Feminina |
| [valorPago] | R$ 47,00 ou R$ 74,00 |
| [idPedido] | ID WOOVI |

---

## BLOCO 1 — CONFIRMACAO

### Icone de confirmacao
- Check animado, cor verde (#25D366), 64px
- Animacao: entrada com scale 0 → 1.1 → 1.0, duracao 500ms
- Centralizado

### Titulo
```
Pedido confirmado!
```

Tipografia: Open Sans 800, 28px, teal (#2C5D63), uppercase
Alinhamento: centralizado

### Mensagem principal
```
Sua musica para [A_O] [NOME] esta sendo criada agora.
```

Exemplos renderizados:
- "Sua musica para a Ana esta sendo criada agora."
- "Sua musica para o Jorge esta sendo criada agora."

Tipografia: Merriweather, 18px, teal

### Sub-mensagem
```
Voce recebe pelo WhatsApp e email em ate 24h.
```

Tipografia: Merriweather, 14px, teal 70%

---

## BLOCO 2 — O QUE ACONTECE AGORA

### Titulo da secao
```
O que acontece agora:
```

Tipografia: Open Sans 700, 14px, teal 60%, uppercase, letra-espacamento maior

### Lista numerada
```
1.  Nosso time ja recebeu seu pedido.

2.  A musica [DA_DO] [NOME] sera composta e entregue em ate 24h.

3.  Voce recebe no WhatsApp [compradorWhatsApp] e no email [compradorEmail].

4.  Qualquer duvida, a Monica esta no WhatsApp.
```

Exemplos renderizados (itens 2 e 3):
- "A musica da Ana sera composta e entregue em ate 24h."
- "Voce recebe no WhatsApp (11) 99999-9999 e no email exemplo@gmail.com."

Tipografia: Merriweather, 14px, teal
Icone numerico: circulo teal com numero branco, 20px
Espacamento entre itens: 16px

---

## BLOCO 3 — UPSELL (SEGUNDA MUSICA)

Posicao: abaixo do bloco "O que acontece agora"
Separacao: divider discreto (linha 1px teal 10%) antes do bloco

### Box de upsell
Visual: fundo cream (#F4EEDC), borda 2px solid gold (#EAA115), border-radius 16px, padding 24px
Sombra: editorial-shadow (box-shadow 20px 20px #2C5D630D)

### Timer
Posicao: topo do box, alinhado a direita
```
Oferta valida por [countdown]
```

Comportamento:
- Contador regressivo de 10 minutos — MM:SS
- Inicia assim que a tela renderiza
- Quando chega em 00:00: box de upsell some com fade-out (300ms)
- Nao ha renovacao de timer — quando acabou, acabou

Tipografia timer: Open Sans 700, 13px, teal 60%
Quando timer < 02:00: cor muda para #E53935

### Headline do upsell
```
Aproveite: crie uma segunda musica por apenas R$ 37.
```

Tipografia: Open Sans 800, 20px, teal, uppercase

### Sub-copy do upsell
```
Para outra pessoa especial. Os detalhes do quiz podem ser alterados.
```

Tipografia: Merriweather, 14px, teal 70%

### CTA do upsell
```
Quero uma segunda musica por R$ 37
```

Visual:
- Fundo: gold (#EAA115)
- Texto: branco, Open Sans 800, uppercase
- Border-radius: pill
- Largura: 100% dentro do box
- Padding: 16px 24px

Comportamento:
- Clicar leva para um quiz simplificado (Tela 1 + Tela 2 + Tela 3 do quiz original)
- Os dados do quiz anterior estao pre-preenchidos — usuario pode alterar ou manter
- Checkout ja com R$37 pre-carregado
- Dados do comprador (Nome/WhatsApp/Email) nao precisam ser preenchidos novamente

### Link de recusa
Abaixo do CTA, separacao 12px:
```
Nao, obrigado
```

Tipografia: Merriweather, 12px, teal 50%, sublinhado discreto
Comportamento: ao clicar, esconde o box de upsell com fade-out (300ms)
Sem confirmacao — clicou, sumiu.

---

## BLOCO 4 — DETALHES DO PEDIDO

Posicao: abaixo do upsell (ou abaixo do "O que acontece agora" se upsell foi recusado/expirado)

### Titulo da secao
```
Resumo do pedido
```

Tipografia: Open Sans 700, 13px, teal 50%, uppercase

### Tabela de resumo
```
Pedido:        #[idPedido]
Para:          [A_O] [NOME]
Estilo:        [estiloMusical]
Voz:           [vozMusical]
Valor pago:    [valorPago]
Entrega:       WhatsApp + email em ate 24h
```

Tipografia label: Merriweather, 12px, teal 50%
Tipografia valor: Merriweather, 12px, teal
Layout: duas colunas (label | valor), separador ":"

---

## BLOCO 5 — COMPARTILHAR (opcional)

Posicao: abaixo do resumo do pedido

### Copy
```
Tem uma amiga que tambem ia adorar dar uma musica de presente?
```

### CTA de compartilhamento
```
Contar para uma amiga →
```

Tipografia: Merriweather, 14px, teal, sublinhado
Comportamento:
- Abre WhatsApp com mensagem pre-configurada
- Mensagem pre-configurada:
  "Acabei de criar uma musica personalizada de presente — ficou incrivel! Da uma olhada: [URL da landing page]"
- Abre em nova aba (target="_blank")

Visual: link simples, sem botao
Alinhamento: centralizado

---

## BLOCO 6 — MONICA

Posicao: ultimo elemento antes do rodape

### Copy
```
A Monica esta no WhatsApp para qualquer duvida →
```

Visual: botao (nao link) — fundo branco, borda 2px solid teal, texto teal, border-radius pill
Icone: WhatsApp verde (#25D366) lado esquerdo
Largura: auto (centralizado)
Padding: 14px 24px

Comportamento:
- Abre WhatsApp com mensagem pre-configurada
- Mensagem: "Oi Monica! Quero tirar uma duvida sobre meu pedido [idPedido]."
- Abre em nova aba

---

## RODAPE MINIMO

```
ViraHit · Musica personalizada feita com historia real
```

Tipografia: Merriweather, 11px, teal 40%, centralizado

---

## ESTADO — UPSELL EXPIRADO

Quando timer do upsell chega em 00:00:
- Box de upsell some com fade-out (300ms)
- Nenhuma mensagem substituta — o espaco some limpo
- O restante da tela continua normal

---

## ESTADO — UPSELL RECUSADO

Quando usuario clica "Nao, obrigado":
- Box de upsell some com fade-out (300ms) — identico ao expirado
- Nenhuma mensagem substituta
- Sem tracking agressivo ou re-exibicao

---

## CHECKLIST DE COPY

- [ ] Icone de check animado transmite confirmacao imediata
- [ ] "Pedido confirmado!" claro e primeiro elemento acima da dobra
- [ ] Lista numerada orienta sem gerar ansiedade
- [ ] WhatsApp e email do comprador aparecem na lista — reafirma que chegara no lugar certo
- [ ] Upsell nao compete com a confirmacao — aparece depois
- [ ] Timer do upsell e real — quando acabou, o box some
- [ ] CTA do upsell usa "Quero" (aprovado) e nao "Comprar"
- [ ] Link de recusa existe e e discreto, mas existe — sem armadilha
- [ ] Monica no rodape visivel mas nao dominante
- [ ] Tokens de genero corretos em todos os campos dinamicos

---

## NOTAS PARA O DEV

1. Esta tela so e acessivel via redirect do checkout apos polling confirmar pagamento. Acesso direto por URL: redirecionar para landing page.
2. idPedido deve estar disponivel via sessionStorage ao chegar nesta tela (colocado no redirect do checkout).
3. Upsell — quiz simplificado: as Telas 1, 2 e 3 do quiz original com campos pre-preenchidos. Checkout do upsell cobra R$37 via novo QR Code WOOVI. Pedido upsell cria novo registro no Baserow com campo "pedido_origem: [idPedido original]".
4. Compartilhamento: URL da landing page deve ser a URL canonica com UTM de referral (utm_source=referral&utm_medium=whatsapp&utm_campaign=pos-pagamento) para rastrear conversoes por indicacao.
5. Monica — mensagem pre-configurada inclui idPedido para facilitar atendimento sem o usuario precisar explicar do zero.
6. Esta tela NAO dispara o webhook de entrega. O webhook de entrega e disparado pelo WOOVI na confirmacao do pagamento, independente desta tela.
