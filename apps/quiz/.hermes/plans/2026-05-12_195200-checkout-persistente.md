# Plano: Checkout Persistente + Recuperação de Abandono

**Data:** 2026-05-12  
**Objetivo:** Permitir compartilhamento e recuperação de checkout para escalar a 100 vendas/dia sem quebrar o que funciona.  
**Princípio:** Copiar > Criar. O esqueleto ja existe — sao correcoes cirurgicas.  
**Status:** Analise completa com codigo + infra (Caddyfile verificado).

---

## PROVA DA INFRA (Caddyfile confirmado)

```
# /etc/caddy/Caddyfile (LIVE na VPS)
virahit.ai {
    handle /quiz* {
        reverse_proxy 127.0.0.1:3000    ← NOSSO APP (PM2, 2 instancias)
    }
    handle /* {
        reverse_proxy https://site-liard-ten-52.vercel.app    ← SITE ANTIGO
    }
}
```

```
# vite.config.ts — linha 23
base: '/quiz/',
```

**Conclusao confirmada:**  
- `virahit.ai/quiz/?pedido=xyz` → porta 3000 → nosso app ✅  
- `virahit.ai/?pedido=xyz` → Vercel → site antigo → perde tudo ❌  

O `handleCopyLink` gera URL sem `/quiz/` — esse e o bug principal.

---

## DIAGNOSTICO — O que ja existe vs. O que falta

### ✅ JA FUNCIONA (nao mexer — confirmado no codigo)
- CheckoutScreen le `?pedido=xyz` da URL e busca no Firestore (linhas 454-462)
- `handleRegeneratePix` gera novo PIX no MESMO pedido (linha 748) — nao cria pedido novo
- Timer reseta para 15min ao gerar novo PIX (linha 768)
- Abas PIX e Cartao funcionam independentemente (linhas 873-1046)
- Stripe com PaymentElement SEPARADO do ExpressCheckoutElement (linhas 1019-1044) — nunca no mesmo provider
- Firestore real-time listener (onSnapshot) detecta pagamento e mostra tela confirmacao (linhas 633-661)
- PIX expirado mostra botao "Gerar novo PIX" (linhas 960-970)
- ConversionScreen cria pedido no Firestore com status `pendente` (linha 152)
- `buscarPedido()` e `salvarPedido()` em `src/lib/firebase.ts` — CRUD funcional

### ❌ O QUE QUEBRA HOJE (bugs confirmados no codigo)

| # | Bug | Linha | Causa Raiz | Impacto |
|---|---|---|---|---|
| 1 | Link compartilhado vai para site antigo | 735 | `handleCopyLink` gera `/?pedido=` sem `/quiz/` | 100% perda — link vai para Vercel |
| 2 | Pedido pago via link mostra checkout | 457-462 | `loadData()` faz `setSession(data)` SEM checar `status === 'pago'` | Pessoa ve checkout de pedido ja pago |
| 3 | Pedido inexistente via link — sem fallback | 458-462 | `if (data)` é false, mas cai no branch localStorage sem redirecionar | Tela estranha ou comportamento indefinido |
| 4 | Flicker quiz → checkout no App.tsx | 12-20 | `useEffect([], [])` roda DEPOIS do primeiro render | Quiz aparece 0.5s antes do checkout |

### ⚠️ REGRAS ABSOLUTAS (violacao = quebrar LIVE)
- **Nao tocar** em `server.ts` — `/api/pix` e `/api/pagamento/criar-intencao` funcionando
- **Nao tocar** no Stripe PaymentElement / ExpressCheckoutElement — Apple Pay e cartao funcionando
- **Nao tocar** no Woovi integration — PIX funcionando
- **Nao tocar** no `handleRegeneratePix` — ja gera no mesmo pedido
- **Nao tocar** no `onSnapshot` listener — deteccao de pagamento funcionando
- **Nao tocar** no ConversionScreen — criacao de pedido funcionando

---

## PLANO DE EXECUCAO — 4 etapas cirurgicas

### Etapa 1: Corrigir URL de compartilhamento

**Arquivo:** `src/components/CheckoutScreen.tsx`  
**Funcao:** `handleCopyLink` (linha 735)

**Mudanca exata:**
```tsx
// LINHA 735 — DE:
const url = `${window.location.origin}/?pedido=${session.idPedido}`;

// PARA:
const url = `${window.location.origin}/quiz/?pedido=${session.idPedido}`;
```

**Por que:** O Caddy roteia `/quiz*` para porta 3000. `/*` vai para Vercel. Sem `/quiz/`, o link morre.

**Validacao:** Copiar link, abrir em aba anonima → deve cair no checkout.

---

### Etapa 2: Detectar "pedido ja pago" e "pedido invalido" ao acessar via link

**Arquivo:** `src/components/CheckoutScreen.tsx`  
**Funcao:** `loadData()` dentro do useEffect (linha 452)

**Mudanca na logica do branch `if (urlPedidoId)`:**

```tsx
// LINHAS 454-463 — DE:
if (urlPedidoId) {
  const data = await buscarPedido(urlPedidoId);
  if (data) {
    setSession(data as SessionData);
    return;
  }
}

// PARA:
if (urlPedidoId) {
  const data = await buscarPedido(urlPedidoId);
  if (data) {
    if ((data as any).status === 'pago') {
      setIsPaidOrder(true);
      setSession(data as SessionData);
      return;
    }
    setSession(data as SessionData);
    return;
  } else {
    // Pedido nao existe no Firestore
    setIsInvalidOrder(true);
    return;
  }
}
```

**Novos estados (adicionar junto com os existentes, ~linha 445):**
```tsx
const [isPaidOrder, setIsPaidOrder] = useState(false);
const [isInvalidOrder, setIsInvalidOrder] = useState(false);
```

**Nova tela "pedido ja pago" (adicionar ANTES de `if (pageState === 'confirmed')`, ~linha 793):**
```tsx
// Tela: pedido ja foi pago — quem acessa link de pedido pago
if (isPaidOrder) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F4EEDC] px-6">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm w-full">
        {/* Check icon — ja pago */}
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-[#128C7E]">
          <CheckCircle className="w-14 h-14 text-white" strokeWidth={2} />
        </div>
        
        <h1 style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 800 }}
            className="text-2xl uppercase text-[#128C7E] leading-tight">
          Essa música já foi paga!
          <span className="block normal-case text-[18px] mt-2 text-[#2C5D63]"
                style={{ fontFamily: 'Merriweather, serif', fontWeight: 700 }}>
            {session.nome ? `Música para ${session.nome}` : 'Seu pedido está confirmado'}
          </span>
        </h1>
        
        <div className="flex flex-col gap-3 w-full mt-2 items-center">
          {/* Botao WhatsApp */}
          <a href={getWhatsAppUrl(session)}
             className="flex items-center justify-center gap-3 px-6 w-full max-w-[340px] h-[54px]
                        rounded-[10px] bg-[#25D366] text-white uppercase tracking-wide text-[14px]
                        transition-all hover:bg-[#20bd5a] active:scale-[0.98]
                        shadow-[0_8px_20px_rgba(37,211,102,0.3)]"
             style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 800, textDecoration: 'none' }}>
            Acompanhar no WhatsApp
          </a>
          
          {/* Botao criar nova musica */}
          <button
            onClick={() => { window.location.href = '/quiz/'; }}
            className="flex items-center justify-center gap-2 w-full max-w-[340px] h-[54px]
                       rounded-[10px] bg-[#2C5D63] text-white uppercase tracking-wide text-[14px]
                       transition-all hover:bg-[#1a3d42] active:scale-[0.98]
                       shadow-[0_8px_20px_rgba(44,93,99,0.3)]"
            style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 800 }}>
            Criar outra música
          </button>
          
          <p className="text-[#2C5D63]/60 text-[12px] font-medium mt-1">
            Pedido: {session.idPedido}
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Nova tela "link invalido" (adicionar depois da tela "pago"):**
```tsx
// Tela: link nao encontrado — pedido foi deletado ou ID errado
if (isInvalidOrder) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F4EEDC] px-6">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm w-full">
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-[#EAA115]">
          <Clock className="w-14 h-14 text-white" strokeWidth={2} />
        </div>
        
        <h1 style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 800 }}
            className="text-2xl uppercase text-[#2C5D63] leading-tight">
          Link não encontrado
          <span className="block normal-case text-[18px] mt-2 text-[#2C5D63]/80"
                style={{ fontFamily: 'Merriweather, serif', fontWeight: 700 }}>
            Esse pedido pode ter expirado ou o link está incorreto.
          </span>
        </h1>
        
        <button
          onClick={() => { window.location.href = '/quiz/'; }}
          className="flex items-center justify-center gap-2 w-full max-w-[340px] h-[54px]
                     rounded-[10px] bg-[#2C5D63] text-white uppercase tracking-wide text-[14px]
                     transition-all hover:bg-[#1a3d42] active:scale-[0.98]"
          style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 800 }}>
          Criar sua música
        </button>
      </div>
    </div>
  );
}
```

**Importante:** Usar os mesmos icones que ja sao importados no topo do arquivo:
```tsx
import { Lock, ShieldCheck, Copy, Check, Clock, Truck, CheckCircle, CreditCard, QrCode, Loader2, Share2 } from 'lucide-react';
```
`CheckCircle` e `Clock` ja estao importados. Nao adicionar imports novos.

**Validacao:**
- Pedido pago → acessar via link → tela "ja pago"
- Pedido inexistente → acessar via link → tela "link invalido"

---

### Etapa 3: Eliminar flicker no App.tsx

**Arquivo:** `src/App.tsx`

**Mudanca exata:**
```tsx
// LINHAS 12-20 — DE:
const [currentScreen, setCurrentScreen] = useState<'quiz' | 'conversion' | 'checkout'>('quiz');

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('pedido')) {
    setCurrentScreen('checkout');
  }
}, []);

// PARA:
const initialScreen = (() => {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('pedido')) return 'checkout';
  } catch {}
  return 'quiz';
})();
const [currentScreen, setCurrentScreen] = useState<'quiz' | 'conversion' | 'checkout'>(initialScreen);
// Remover o useEffect que detecta ?pedido (linhas 15-20) — nao e mais necessario
```

**Validacao:** Abrir `/quiz/?pedido=xyz` → checkout aparece sem piscar quiz.

---

### Etapa 4: Build e validacao

1. `npx tsc --noEmit` — zero erros de tipo
2. `npm run build` — build sem erros
3. `git diff` — revisar mudancas antes de deploy
4. Deploy na VPS:
   - `scp dist/ para VPS` ou git pull na VPS
   - `pm2 restart quiz-virahit --update-env`

---

### Etapa 5: Testes E2E em LIVE (manual — General faz)

| # | Cenario | URL | Resultado esperado |
|---|---|---|---|
| 1 | Fluxo normal | `/quiz/` | Quiz → conversion → checkout → PIX (como hoje) |
| 2 | Copiar link, abrir anonima | `/quiz/?pedido=xyz` | Checkout do MESMO pedido |
| 3 | PIX expira | Botao "Gerar novo PIX" | Novo QR code, timer 15min |
| 4 | Aba Cartao | Clicar "Cartao" | PaymentElement aparece |
| 5 | Apple Pay | Clicar Apple Pay | ExpressCheckout funciona |
| 6 | Pedido pago via link | `/quiz/?pedido=PAGO_ID` | Tela "ja pago" |
| 7 | Link invalido | `/quiz/?pedido=NAOEXISTE` | Tela "link invalido" |
| 8 | Recarregar checkout | F5 no checkout | Reconstrui do Firestore |
| 9 | Fluxo sem ?pedido | `/quiz/` | Nada muda vs hoje |

---

## ARQUIVOS QUE VAO MUDAR

| Arquivo | Mudanca | Risco |
|---|---|---|
| `src/components/CheckoutScreen.tsx` | handleCopyLink URL + 2 novos estados + 2 telas condicionais | Medio (arquivo principal do checkout) |
| `src/App.tsx` | Inicializacao direta de currentScreen, remover useEffect | Baixo |

**Arquivos que NAO mudam:**
- `server.ts` — APIs intactas
- `src/lib/firebase.ts` — CRUD intacto
- `src/components/ConversionScreen.tsx` — criacao de pedido intacta
- `src/components/Quiz.tsx` — quiz intacto

---

## RISCOS E MITIGACOES

| Risco | Probabilidade | Mitigacao |
|---|---|---|
| `buscarPedido()` falha (Firestore offline) | Baixa | Catch ja retorna null → mostra "link invalido" |
| Stripe quebra com mudanca | Nula | Nao toca em Stripe |
| Apple Pay quebra | Nula | Nao toca em ExpressCheckout |
| Icone nao importado | Baixa | `CheckCircle` e `Clock` ja estao no import |
| Session do pedido pago nao tem campos UI | Media | Pedido criado no ConversionScreen tem todos os campos. Verificar no console se `session.nome` existe. |

---

## PROMPT PARA NOVA SESSAO (copiar e colar)

```
Execute o plano salvo em: ~/empresa/funil-web/quiz-virahit-v2/.hermes/plans/2026-05-12_195200-checkout-persistente.md

OBJETIVO: Implementar checkout persistente via ?pedido=xyz para recuperar vendas perdidas por abandono.

CONTEXTO DO PROJETO:
- Diretorio: ~/empresa/funil-web/quiz-virahit-v2/
- App roda em /quiz/ (Vite base: '/quiz/', Caddy handle /quiz* → porta 3000)
- Deploy: VPS com PM2 (cluster mode, 2 instancias), NAO e Vercel
- Firebase: ai-studio-5f1d09ec, collection = 'pedidos'
- Modo teste: R$1,00

ARQUIVOS PARA MODIFICAR (SO esses 2):
1. src/components/CheckoutScreen.tsx — corrigir URL de compartilhamento + telas de pedido pago/invalido
2. src/App.tsx — eliminar flicker com inicializacao direta

REGRAS ABSOLUTAS:
1. Nao tocar em: server.ts, firebase.ts, ConversionScreen.tsx, Quiz.tsx, package.json, vite.config.ts
2. Nao tocar na logica Stripe/PaymentElement/ExpressCheckoutElement
3. Nao tocar na logica de PIX (handleRegeneratePix ja funciona corretamente)
4. Nao tocar no onSnapshot listener (deteccao de pagamento)
5. Nao adicionar novos imports de icones — CheckCircle e Clock ja estao importados de lucide-react
6. Cada mudanca deve ser minima e cirurgica — usar patch, nao reescrever o arquivo

FLUXO DE EXECUCAO:
1. Leia o plano completo no path acima
2. Leia CheckoutScreen.tsx e App.tsx para entender o contexto atual
3. Execute Etapa 1 (fix URL) → patch cirurgico
4. Execute Etapa 2 (pedido pago/invalido) → adicionar estados + telas condicionais
5. Execute Etapa 3 (App.tsx flicker) → inicializacao direta
6. Rodar `npx tsc --noEmit` — confirmar zero erros
7. Rodar `npm run build` — confirmar build sem erros
8. Rodar `git diff` — mostrar resumo das mudancas
9. Descrever para o General exatamente o que mudou, com before/after

IMPORTANTE:
- Se algo nao compilar, pare e informe o erro — nao tente "gambiarra"
- Se o plano estiver ambiguo em algum ponto, pergunte ao General antes de chutar
- Apos build com sucesso, NAO faca deploy automatico — apenas descreva o que mudou e aguarde instrucao
```
