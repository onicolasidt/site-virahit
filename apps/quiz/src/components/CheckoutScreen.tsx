import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  loadStripe,
  type StripeElementsOptions,
  type Appearance,
} from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Lock, ShieldCheck, Copy, Check, Clock, Truck, CheckCircle, CreditCard, QrCode, Loader2, Share2 } from 'lucide-react';
import { resolverGenero } from './Quiz';
import { trackMetaEvent } from '../lib/metaTracking';

// Initialize Stripe with VITE_STRIPE_PUBLISHABLE_KEY.
// Handle gracefully if not set (it will return null to elements).
const stripeKey = (import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

// Helper: emitir evento de pagamento para observability
async function emitPaymentEvent(pedidoId: string, etapa: string, opts?: { erro?: string; meta?: Record<string, any> }) {
  try {
    await fetch('/api/payment-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pedidoId, etapa, gateway: 'stripe', ...opts }),
    });
  } catch { /* fire-and-forget — nunca bloqueia o fluxo principal */ }
}

type PaymentTab = 'pix' | 'card';
type PixState = 'active' | 'expired';
type PageState = 'checkout' | 'confirmed';

interface SessionData {
  nome: string;
  generoDestinatario: 'F' | 'M';
  estiloMusical: string;
  vozMusical: string;
  compradorNome: string;
  compradorWhatsApp: string;
  compradorEmail: string;
  idPedido: string;
  pixQRCodeUrl: string;
  pixCopiaCola: string;
  dataEntregaGarantida: string;
}

// Categorização de erros — para distinguir banco de infraestrutura
const BANK_ERRORS = new Set([
  'card_declined', 'insufficient_funds', 'incorrect_cvc', 'expired_card',
  'incorrect_number', 'invalid_number', 'invalid_expiry_month', 'invalid_expiry_year',
  'invalid_cvc', 'incomplete_number', 'incomplete_expiry', 'incomplete_cvc',
  'processing_error', 'authentication_required',
  'do_not_honor', 'restricted_card', 'pickup_card', 'card_not_supported', 'currency_not_supported', 'transaction_not_allowed',
]);

function categorizeError(code?: string): 'banco' | '3ds_timeout' | 'infra' {
  if (code === 'payment_timeout') return '3ds_timeout';
  if (code && BANK_ERRORS.has(code)) return 'banco';
  return 'infra';
}

const STRIPE_ERROR_MESSAGES: Record<string, string> = {
  card_declined: 'Cartão recusado pelo banco.',
  insufficient_funds: 'Saldo insuficiente.',
  incorrect_cvc: 'Código de segurança (CVV) incorreto.',
  expired_card: 'Cartão vencido.',
  incorrect_number: 'Número do cartão incorreto.',
  invalid_expiry_month: 'Mês de validade inválido.',
  invalid_expiry_year: 'Ano de validade inválido.',
  invalid_cvc: 'CVV inválido.',
  payment_timeout: 'Autenticação com o banco excedeu o tempo limite.',
  processing_error: 'Erro ao processar pagamento.',
  incomplete_number: 'Número do cartão incompleto.',
  incomplete_expiry: 'Data de validade incompleta.',
  incomplete_cvc: 'Código de segurança (CVV) incompleto.',
  invalid_number: 'Número do cartão inválido.',
  authentication_required: 'Autenticação necessária.',
  do_not_honor: 'Pagamento não autorizado pelo banco. Tente outro cartão ou use o PIX.',
  restricted_card: 'Este cartão tem restrições. Tente outro cartão ou use o PIX.',
  pickup_card: 'Cartão bloqueado pelo banco. Use outro cartão ou pague com PIX.',
  card_not_supported: 'Este tipo de cartão não é aceito. Tente outro cartão ou use o PIX.',
  currency_not_supported: 'Cartão não aceita pagamentos em BRL. Use outro cartão ou pague com PIX.',
  transaction_not_allowed: 'Transação não permitida pelo banco. Tente outro cartão ou use o PIX.',
};

function humanizeStripeError(code?: string, message?: string): string {
  if (!code && !message) return 'Erro ao processar.';
  if (code && STRIPE_ERROR_MESSAGES[code]) return STRIPE_ERROR_MESSAGES[code];
  if (message) return message;
  return 'Erro ao processar.';
}

const stripeAppearance: Appearance = {
  theme: 'flat',
  variables: {
    colorPrimary: '#128C7E',
    colorBackground: '#FFFFFF',
    colorText: '#1a1a1a',
    fontFamily: '"Open Sans", system-ui, sans-serif',
    borderRadius: '12px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      border: '1.5px solid #E5E7EB',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      padding: '14px 16px',
      fontSize: '16px',
    },
    '.Input:focus': {
      borderColor: '#128C7E',
      boxShadow: '0 0 0 1px #128C7E',
      outline: 'none',
    },
    '.Label': {
      fontWeight: '700',
      color: '#4B5563',
      fontSize: '13px',
      textTransform: 'uppercase',
    },
  },
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface ExpressOnlyFormProps {
  pedidoId: string;
  onPaymentConfirmed?: () => void;
}

// Componente isolado APENAS para ExpressCheckoutElement (Apple Pay / Google Pay)
// Deve ficar em um <Elements> provider separado do CardForm
// para evitar validacao cruzada entre os dois elementos
function ExpressOnlyForm({ pedidoId, onPaymentConfirmed }: ExpressOnlyFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [expressError, setExpressError] = useState<string | null>(null);

  const handleExpressConfirm = async (event: any) => {
    if (!stripe || !elements) return;
    setExpressError(null);
    emitPaymentEvent(pedidoId, 'express_confirmed', {
      meta: { expressType: event?.expressPaymentType || 'unknown' },
    });

    try {
      // Race com timeout de 120s — mesmo Apple Pay pode precisar de 3DS em alguns bancos
      const result = await Promise.race([
        stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/quiz/?pedido=${pedidoId}`,
            payment_method_data: {
              billing_details: {
                address: {
                  country: 'BR',
                  postal_code: '00000-000',
                  state: 'SP',
                  city: 'São Paulo',
                  line1: 'Rua Exemplo, 123'
                }
              }
            }
          },
          redirect: 'if_required',
        }),
        new Promise<{ error: { code: string; message: string } }>((resolve) =>
          setTimeout(() => resolve({
            error: {
              code: 'payment_timeout',
              message: 'Autenticação com o banco excedeu o tempo limite. Tente PIX ou outro cartão.',
            },
          }), 120000)
        ),
      ]);

      if (result.error) {
        const errorType = categorizeError(result.error.code);
        emitPaymentEvent(pedidoId, 'pagamento_falhou', {
          erro: `${result.error.code}: ${result.error.message}`,
          meta: { type: 'express', errorType }
        });
        setExpressError(humanizeStripeError(result.error.code, result.error.message));
      } else {
        emitPaymentEvent(pedidoId, 'pagamento_aprovado', { meta: { type: 'express' } });
        if (onPaymentConfirmed) onPaymentConfirmed();
      }
    } catch (e: any) {
      const msg = humanizeStripeError('processing_error', 'Erro ao processar. Tente PIX.');
      setExpressError(msg);
      emitPaymentEvent(pedidoId, 'pagamento_falhou', {
        erro: e?.message || 'confirmPayment crashed',
        meta: { type: 'express', errorType: 'infra' }
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="min-h-[44px]">
        <ExpressCheckoutElement onConfirm={handleExpressConfirm} />
      </div>
      {expressError && (
        <div className="flex flex-col gap-2 bg-amber-50 border border-amber-400 rounded-xl px-4 py-3">
          <div className="flex items-start gap-2">
            <span className="text-amber-600 mt-0.5">⚠️</span>
            <div>
              <p className="text-amber-900 text-[13px] font-bold font-['Open_Sans']">{expressError}</p>
              <p className="text-amber-700 text-[12px] mt-0.5 font-['Merriweather']">
                Tente PIX ou use os dados do cartão abaixo.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CardFormProps {
  onSwitchToPix: () => void;
  onPaymentConfirmed?: () => void;
  pedidoId: string;
}

function CardForm({ onSwitchToPix, onPaymentConfirmed, pedidoId }: CardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardLoading, setCardLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  // Emitir evento quando o form monta (Elements pronto)
  useEffect(() => {
    if (stripe && elements && pedidoId) {
      emitPaymentEvent(pedidoId, 'card_mounted');
    }
  }, [stripe, elements, pedidoId]);

  const processPayment = async () => {
    if (!stripe || !elements) return;
    setCardLoading(true);
    setCardError(null);
    emitPaymentEvent(pedidoId, 'card_submitted');

    // Depois de 10s, avisa que está aguardando o banco (3D Secure pode demorar)
    const statusTimer = setTimeout(() => {
      setCardError('⏳ Aguardando autenticação do seu banco...');
    }, 10000);

    try {
      // Timeout de 120s — tempo suficiente para 3D Secure legítimo.
      // Se estourar, é problema de rede ou do banco, não do nosso sistema.
      const result = await Promise.race([
        stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/quiz/?pedido=${pedidoId}`,
            payment_method_data: {
              billing_details: {
                address: {
                  country: 'BR',
                  postal_code: '00000-000',
                  state: 'SP',
                  city: 'São Paulo',
                  line1: 'Rua Exemplo, 123'
                }
              }
            }
          },
          redirect: 'if_required',
        }),
        new Promise<{ error: { code: string; message: string } }>((resolve) =>
          setTimeout(() => resolve({
            error: {
              code: 'payment_timeout',
              message: 'Autenticação com o banco excedeu o tempo limite. Tente Apple Pay, PIX ou outro cartão.',
            },
          }), 120000)
        ),
      ]);

      clearTimeout(statusTimer);

      if (result.error) {
        const msg = humanizeStripeError(result.error.code, result.error.message);
        const errorType = categorizeError(result.error.code);
        setCardError(msg);
        emitPaymentEvent(pedidoId, 'pagamento_falhou', {
          erro: `${result.error.code}: ${result.error.message}`,
          meta: { type: 'card', errorType }
        });
        setCardLoading(false);
      } else {
        emitPaymentEvent(pedidoId, 'pagamento_aprovado', { meta: { type: 'card' } });
        ['idPedido','pixQRCodeUrl','pixCopiaCola','dataEntregaGarantida',
         'compradorNome','compradorWhatsApp','generoDestinatario','estiloMusical','vozMusical'
        ].forEach(k => localStorage.removeItem(k));
        if (onPaymentConfirmed) {
          onPaymentConfirmed();
        }
      }
    } catch (e: any) {
      clearTimeout(statusTimer);
      const msg = humanizeStripeError('processing_error', 'Erro ao processar. Tente PIX ou Apple Pay.');
      setCardError(msg);
      emitPaymentEvent(pedidoId, 'pagamento_falhou', {
        erro: e?.message || 'confirmPayment crashed',
        meta: { type: 'card', errorType: 'infra' }
      });
      setCardLoading(false);
    }
  };

  const handleCardSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await processPayment();
  };

  return (
    <form onSubmit={handleCardSubmit} className="flex flex-col gap-4">
      <div className="rounded-xl overflow-hidden p-1 bg-white">
        {stripe ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <hr className="flex-1 border-[#E5E7EB]" />
              <span className="text-[#9CA3AF] text-[11px] font-bold uppercase tracking-wider font-['Open_Sans']">Pague com cartão</span>
              <hr className="flex-1 border-[#E5E7EB]" />
            </div>
            <PaymentElement options={{ 
              layout: 'accordion',
              // wallets desabilitados aqui — Apple Pay e Google Pay estao no ExpressOnlyForm acima
              wallets: { applePay: 'never', googlePay: 'never' },
              fields: {
                billingDetails: {
                  address: 'never'
                }
              }
            }} />
          </div>
        ) : <p className="text-sm text-center text-red-500 py-4">Stripe não configurado (Falta a chave na variável de ambiente VITE_STRIPE_PUBLISHABLE_KEY).</p>}
      </div>
      {cardError && (
        <div className="flex flex-col gap-3 bg-amber-50 border border-amber-400 rounded-xl px-5 py-4">
          <div className="flex items-start gap-2">
            <span className="text-amber-600 mt-0.5 text-lg">⚠️</span>
            <div>
              <p className="text-amber-900 text-[14px] font-bold font-['Open_Sans']">{cardError}</p>
              <p className="text-amber-700 text-[13px] mt-1 font-['Merriweather']">
                Tente estas alternativas:
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                // Scrollar para o Apple Pay / Google Pay (ExpressCheckoutElement)
                const el = document.querySelector('[class*="min-h-[44px]"]');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-black text-white rounded-lg text-[12px] font-bold font-['Open_Sans'] hover:bg-gray-800 transition-colors"
            >
              <span className="text-base"></span> Pay
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.querySelector('[class*="min-h-[44px]"]');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-[#4285F4] text-white rounded-lg text-[12px] font-bold font-['Open_Sans'] hover:bg-[#3367D6] transition-colors"
            >
              <span className="text-base">G</span> Pay
            </button>
            <button
              type="button"
              onClick={onSwitchToPix}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-[#2C5D63] text-white rounded-lg text-[12px] font-bold font-['Open_Sans'] hover:bg-[#1a3d42] transition-colors"
            >
              <span className="text-base">⬡</span> PIX
            </button>
          </div>
        </div>
      )}
      <button
        type="submit"
        disabled={cardLoading || !stripe || !elements}
        className={'relative w-full h-[56px] mx-auto flex items-center justify-center gap-2 rounded-xl font-[\'Open_Sans\'] font-extrabold uppercase text-white transition-all group border-none overflow-hidden mt-1 ' + (cardLoading || !stripe || !elements ? 'bg-[#33A854]/70 cursor-wait shadow-none' : 'bg-[#33A854] hover:bg-[#2d954b] shadow-[0_8px_20px_rgba(51,168,84,0.3)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer')}
      >
        {!cardLoading && stripe && elements && (
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"></div>
        )}
        <div className="relative z-10 flex items-center justify-center gap-2 text-[15px] tracking-widest leading-none">
          {cardLoading ? <><Loader2 className="w-5 h-5 animate-spin" />PROCESSANDO...</> : <>CRIAR POR R$ 1,00<span className="material-symbols-outlined text-[22px] animate-slide-right inline-block">arrow_forward</span></>}
        </div>
      </button>

      <div className="flex items-center justify-center gap-1.5 mt-3">
        <ShieldCheck className="w-[14px] h-[14px] text-[#9CA3AF]" strokeWidth={2.5} />
        <span className="text-[11px] text-[#9CA3AF] font-semibold font-['Open_Sans'] uppercase tracking-wide">
          Pagamento criptografado via Stripe
        </span>
      </div>
    </form>
  );
}

import { salvarPedido, db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

function getWhatsAppUrl(session: SessionData) {
  const nomeFormatado = session.nome ? session.nome.charAt(0).toUpperCase() + session.nome.slice(1).toLowerCase() : 'a pessoa';
  const aO = session.generoDestinatario === 'F' ? 'a' : 'o';
  const codigoCurtoWpp = localStorage.getItem('codigoPedido') || (session.idPedido ? 'VH-' + session.idPedido.slice(0, 6) : 'sem-id');
  const text = `Oi Mônica! Acabei de pagar a música d${aO} ${nomeFormatado}. Pedido: ${codigoCurtoWpp}`;
  return `https://wa.me/5511926681180?text=${encodeURIComponent(text)}`;
}

export function CheckoutScreen({ onCompleted }: { onCompleted: () => void }) {
  const [session, setSession] = useState<SessionData>({
    nome: '', generoDestinatario: 'M', estiloMusical: '', vozMusical: '',
    compradorNome: '', compradorWhatsApp: '', compradorEmail: '', idPedido: '',
    pixQRCodeUrl: '', pixCopiaCola: '', dataEntregaGarantida: '',
  });
  const [activeTab, setActiveTab] = useState<PaymentTab>('pix');
  const [pixState, setPixState] = useState<PixState>('active');
  const [pageState, setPageState] = useState<PageState>('checkout');
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [showFallbackRedirect, setShowFallbackRedirect] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cardInitError, setCardInitError] = useState<string | null>(null);
  const [cardInitLoading, setCardInitLoading] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [pixGenerating, setPixGenerating] = useState(false); // false — handleRegeneratePix define true quando inicia
  const [pixError, setPixError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false); // impede EAGER PIX de disparar antes do loadData() terminar
  const [checkingPaidStatus, setCheckingPaidStatus] = useState(false); // evita flash de checkout enquanto verifica Firestore
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const purchaseTracked = useRef(false); // Guard to prevent Purchase event double-firing

  useEffect(() => {
    async function loadData() {
      const params = new URLSearchParams(window.location.search);
      const urlPedidoId = params.get('pedido');

      if (urlPedidoId) {
        // Busca no servidor — evita lentidão do Client SDK no browser (20s → <1s)
        setCheckingPaidStatus(true);

        try {
          const resp = await fetch(`/api/pedido/${encodeURIComponent(urlPedidoId)}`);
          if (resp.ok) {
            const result = await resp.json();
            const data = result.pedido;
            const idParaBuscar = data.idPedido || urlPedidoId;

            const p = data;
            // Pedido já pago? Mostrar tela de obrigado
            if (p.status === 'pago') {
              setSession({
                nome: p.nome || '',
                generoDestinatario: p.genero === 'F' ? 'F' : 'M',
                estiloMusical: p.estilo || p.estiloMusical || '',
                vozMusical: p.voz || p.vozMusical || '',
                compradorNome: p.compradorNome || '',
                compradorWhatsApp: p.compradorWhatsApp || '',
                compradorEmail: p.compradorEmail || '',
                idPedido: idParaBuscar,
                pixQRCodeUrl: p.pixQRCodeUrl || '',
                pixCopiaCola: p.pixCopiaCola || '',
                dataEntregaGarantida: p.dataEntregaGarantida || '',
              });
              setPageState('confirmed');
              setRedirectCountdown(null); // não redireciona automaticamente
              setCheckingPaidStatus(false);
              return;
            }

            // Mapear campos Firestore (estilo/voz/genero) para SessionData
            setSession({
              nome: p.nome || '',
              generoDestinatario: p.genero === 'F' ? 'F' : 'M',
              estiloMusical: p.estilo || p.estiloMusical || '',
              vozMusical: p.voz || p.vozMusical || '',
              compradorNome: p.compradorNome || '',
              compradorWhatsApp: p.compradorWhatsApp || '',
              compradorEmail: p.compradorEmail || '',
              idPedido: idParaBuscar,
              pixQRCodeUrl: p.pixQRCodeUrl || '',
              pixCopiaCola: p.pixCopiaCola || '',
              dataEntregaGarantida: p.dataEntregaGarantida || '',
              ...(p.campoA !== undefined && { campoA: p.campoA }),
              ...(p.campoB !== undefined && { campoB: p.campoB }),
              ...(p.campoC !== undefined && { campoC: p.campoC }),
              ...(p.campoCOutro !== undefined && { campoCOutro: p.campoCOutro }),
              ...(p.vinculo !== undefined && { vinculo: p.vinculo }),
              ...(p.genero !== undefined && { genero: p.genero }),
            });
            // Calcular tempo restante real do PIX com base em pixCriadoEm
            if (p.pixCopiaCola && p.pixCriadoEm) {
              const criadoEm = new Date(p.pixCriadoEm).getTime();
              const expiresAt = criadoEm + 30 * 60 * 1000;
              const segundosRestantes = Math.floor((expiresAt - Date.now()) / 1000);
              if (segundosRestantes <= 0) {
                setPixState('expired');
                setTimeLeft(0);
              } else {
                setPixState('active');
                setTimeLeft(segundosRestantes);
              }
            }
            // PIX já existe no Firestore — não precisa gerar, para o loading
            if (p.pixCopiaCola) setPixGenerating(false);
            setCheckingPaidStatus(false);
            setDataLoaded(true);
            return;
          }
        } catch { /* pedido não encontrado ou erro — continua pro localStorage */ }
      }

      // Nenhum pedido encontrado via URL — prossegue com localStorage
      setCheckingPaidStatus(false);

      const get = (key: string) => localStorage.getItem(key) ?? '';
      let quizData: any = {};
      try {
        const draft = localStorage.getItem('virahit_quiz_draft');
        if (draft) quizData = JSON.parse(draft);
      } catch { }

      const raw = quizData.genero || get('generoDestinatario') || get('compradorGenero'); 
      // Pegar áudios em base64 do localStorage
      let audioBlobs: Record<string, string> = {};
      try {
        audioBlobs = JSON.parse(localStorage.getItem('virahit_audio_blobs') || '{}');
      } catch { }

      const storedIdPedido = get('idPedido');

      // Verificar se o idPedido salvo no localStorage ainda e valido (nao pago/expirado)
      // Se estiver pago ou for muito antigo, limpar e tratar como sessao nova
      if (storedIdPedido && storedIdPedido !== 'demo-pedido') {
        try {
          // Busca via API server-side (<1s) em vez de Client SDK direto (20s)
          const resp = await fetch(`/api/pedido/${encodeURIComponent(storedIdPedido)}`);
          if (resp.ok) {
            const result = await resp.json();
            const p = result.pedido;
            if (p?.status === 'pago') {
              // Pedido ja foi pago em outra sessao — limpar tudo e comecar do zero
              ['idPedido','pixQRCodeUrl','pixCopiaCola','dataEntregaGarantida',
               'compradorNome','compradorWhatsApp','generoDestinatario','estiloMusical','vozMusical',
               'virahit_quiz_draft','virahit_audio_blobs'
              ].forEach(k => localStorage.removeItem(k));
              // Redirecionar de volta ao quiz
              window.location.href = window.location.pathname;
              return;
            }
            // Se o pedido existe e NAO está pago, usar os dados DELE
            // (ConversionScreen salvou tudo no addDoc — nome, estilo, voz, gênero, etc.)
            // Isso evita o bug do "nome antigo" quando virahit_quiz_draft foi deletado
            if (p) {
              setSession({
                nome: p.nome || '',
                generoDestinatario: p.genero === 'F' ? 'F' : 'M',
                estiloMusical: p.estilo || '',
                vozMusical: p.voz || '',
                compradorNome: p.compradorNome || '',
                compradorWhatsApp: p.compradorWhatsApp || '',
                compradorEmail: p.compradorEmail || '',
                idPedido: storedIdPedido,
                pixQRCodeUrl: p.pixQRCodeUrl || '',
                pixCopiaCola: p.pixCopiaCola || '',
                dataEntregaGarantida: p.dataEntregaGarantida || '',
                ...(p.campoA !== undefined && { campoA: p.campoA }),
                ...(p.campoB !== undefined && { campoB: p.campoB }),
                ...(p.campoC !== undefined && { campoC: p.campoC }),
                ...(p.campoCOutro !== undefined && { campoCOutro: p.campoCOutro }),
                ...(p.vinculo !== undefined && { vinculo: p.vinculo }),
                ...(p.genero !== undefined && { genero: p.genero }),
              });

              // Calcular tempo restante real do PIX com base em pixCriadoEm
              if (p.pixCopiaCola && p.pixCriadoEm) {
                const criadoEm = new Date(p.pixCriadoEm).getTime();
                const expiresAt = criadoEm + 30 * 60 * 1000; // 30 minutos
                const segundosRestantes = Math.floor((expiresAt - Date.now()) / 1000);
                if (segundosRestantes <= 0) {
                  // PIX já expirou — mostrar estado expirado
                  setPixState('expired');
                  setTimeLeft(0);
                } else {
                  // PIX ainda válido — cronômetro de onde parou
                  setPixState('active');
                  setTimeLeft(segundosRestantes);
                }
              }

              // PIX já existe — não precisa gerar, para o loading
              if (p.pixCopiaCola) setPixGenerating(false);
              setDataLoaded(true);
              return;
            }
          }
        } catch { /* se falhar a busca, continua normalmente */ }
      }

      const newSession = {
        nome: quizData.nome || get('compradorNome'), 
        generoDestinatario: (raw === 'F' ? 'F' : 'M') as 'F' | 'M',
        estiloMusical: quizData.estilo || get('estiloMusical'), 
        vozMusical: quizData.voz || get('vozMusical'),
        compradorNome: get('compradorNome'), 
        compradorWhatsApp: get('compradorWhatsApp'),
        idPedido: storedIdPedido || 'demo-pedido', 
        pixQRCodeUrl: get('pixQRCodeUrl'),
        pixCopiaCola: get('pixCopiaCola'), 
        dataEntregaGarantida: get('dataEntregaGarantida'),
        // Campos de áudio do quiz
        campoA: quizData.campoA || '',
        campoB: quizData.campoB || '',
        campoC: quizData.campoC || '',
        campoCOutro: quizData.campoCOutro || '',
        vinculo: quizData.vinculo || '',
        genero: quizData.genero || '',
        // IDs das gravações
        audioNome: quizData.audioNome || [],
        audioCampoA: quizData.audioCampoA || [],
        audioCampoB: quizData.audioCampoB || [],
        audioCampoCOutro: quizData.audioCampoCOutro || [],
        // Base64 dos áudios gravados
        ...(Object.keys(audioBlobs).length > 0 ? { audioBlobs } : {}),
      };
      
      setSession(newSession);

      if (newSession.idPedido !== 'demo-pedido') {
        await salvarPedido(newSession.idPedido, newSession);
      }

      // Se já tem PIX no localStorage, para o loading
      if (newSession.pixCopiaCola) setPixGenerating(false);
      setDataLoaded(true);
    }

    loadData();
  }, []);

  // Track InitiateCheckout when checkout page loads with data
  useEffect(() => {
    if (dataLoaded && pageState === 'checkout' && session.idPedido && session.idPedido !== 'demo-pedido') {
      trackMetaEvent('InitiateCheckout', {
        value: 47.00,
        currency: 'BRL',
        content_ids: ['music-personalizada'],
        content_type: 'product',
      });
    }
  }, [dataLoaded, pageState, session.idPedido]);

  // EAGER PIX: gerar QR code automaticamente assim que o pedido estiver carregado
  // (não espera o usuário clicar na aba PIX). Menos cliques = mais conversão.
  useEffect(() => {
    if (
      dataLoaded &&
      session.idPedido &&
      session.idPedido !== 'demo-pedido' &&
      !session.pixCopiaCola &&
      pixState !== 'expired' &&
      pageState === 'checkout'
    ) {
      handleRegeneratePix();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.idPedido, session.pixCopiaCola, pixState, pageState, dataLoaded]);

  const fetchClientSecret = useCallback(async (forcePedidoId?: string) => {
    const id = forcePedidoId || session.idPedido;
    if (clientSecret || !id || id === 'demo-pedido') return;
    setCardInitLoading(true);
    setCardInitError(null);
    console.log('[ViraHit Stripe] Buscando clientSecret para pedido:', id);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      const res = await fetch('/api/pagamento/criar-intencao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedidoId: id }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.clientSecret) {
        console.log('[ViraHit Stripe] clientSecret recebido com sucesso');
        setClientSecret(data.clientSecret);
        setCardInitError(null);
        emitPaymentEvent(id, 'intent_criado', { meta: { intentId: data.clientSecret.split('_secret_')[0] } });
      } else {
        console.error('[ViraHit Stripe] API retornou sem clientSecret:', data);
        const msg = data.error || 'Não foi possível preparar o pagamento. Tente novamente.';
        setCardInitError(msg);
        emitPaymentEvent(id, 'pagamento_falhou', { erro: data.error || 'clientSecret ausente na resposta', meta: { etapa: 'criar_intencao' } });
      }
    } catch (e: any) {
      console.error('[ViraHit Stripe] Erro ao buscar clientSecret:', e);
      const msg = e?.name === 'AbortError' ? 'O servidor demorou muito para responder. Tente novamente.' : 'Erro de conexão. Verifique sua internet e tente novamente.';
      setCardInitError(msg);
      emitPaymentEvent(id, 'pagamento_falhou', { erro: e?.message || 'fetch /api/pagamento/criar-intencao falhou', meta: { etapa: 'criar_intencao' } });
    } finally {
      setCardInitLoading(false);
    }
  }, [clientSecret, session.idPedido]);

  useEffect(() => {
    // Scroll to top when checkout screen is opened
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, []);

  useEffect(() => {
    // Fetch clientSecret eager — assim que temos pedidoId valido
    if (session.idPedido && session.idPedido !== 'demo-pedido') fetchClientSecret();
  }, [session.idPedido, fetchClientSecret]);

  useEffect(() => {
    // Fetch clientSecret quando usuario clica na aba Cartao (caso o eager fetch tenha falhado)
    if (activeTab === 'card' && session.idPedido && session.idPedido !== 'demo-pedido' && !clientSecret && !cardInitLoading) {
      console.log('[ViraHit Stripe] Usuario clicou em Cartao sem clientSecret — re-fetchando...');
      fetchClientSecret();
    }
  }, [activeTab, session.idPedido, clientSecret, cardInitLoading, fetchClientSecret]);

  useEffect(() => {
    if (pixState !== 'active' || pageState !== 'checkout') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setPixState('expired');
          setSession((s) => ({ ...s, pixCopiaCola: '' }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [pixState, pageState]);

  useEffect(() => {
    if (!session.idPedido || session.idPedido === 'demo-pedido' || pageState === 'confirmed') return;

    const confirmarPagamento = () => {
      // Guard: only fire Purchase event once per order
      if (!purchaseTracked.current) {
        purchaseTracked.current = true;
        trackMetaEvent('Purchase', {
          value: 47.00,
          currency: 'BRL',
          content_ids: ['music-personalizada'],
          content_type: 'product',
          num_items: 1,
        });
      }
      if (timerRef.current) clearInterval(timerRef.current);
      localStorage.removeItem('idPedido');
      localStorage.removeItem('pixQRCodeUrl');
      localStorage.removeItem('pixCopiaCola');
      localStorage.removeItem('dataEntregaGarantida');
      localStorage.removeItem('compradorNome');
      localStorage.removeItem('compradorWhatsApp');
      localStorage.removeItem('generoDestinatario');
      localStorage.removeItem('estiloMusical');
      localStorage.removeItem('vozMusical');
      setPageState('confirmed');
      setRedirectCountdown(15);
    };

    const unsub = onSnapshot(doc(db, 'pedidos', session.idPedido), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.status === 'pago') {
          confirmarPagamento();
        } else if (data.status === 'expirado') {
          if (timerRef.current) clearInterval(timerRef.current);
          setPixState('expired');
        }
      }
    });

    // Polling de backup via servidor — evita throttling do Client SDK no celular
    // O servidor responde em <1s, então pode verificar mais frequente que o getDoc
    const pollingDelay = setTimeout(() => {
      pollingRef.current = setInterval(async () => {
        try {
          const resp = await fetch(`/api/pedido/${encodeURIComponent(session.idPedido)}`);
          if (resp.ok) {
            const result = await resp.json();
            if (result.pedido?.status === 'pago') {
              confirmarPagamento();
            }
            // Nota: o servidor não retorna status 'expirado' — a expiração do PIX
            // é detectada pelo timer do front (30min). Não consultar o servidor para isso.
          }
        } catch { /* falha silenciosa — onSnapshot continua como primario */ }
      }, 10000); // 10s (servidor é rápido, não precisa esperar 15s)
    }, 10000); // inicia em 10s (não precisa esperar 30s, servidor não tem throttling)

    return () => {
      unsub();
      clearTimeout(pollingDelay);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [session.idPedido, pageState, onCompleted, activeTab, session.pixCopiaCola]);

  useEffect(() => {
    if (redirectCountdown === null) return;
    
    if (redirectCountdown === 15) {
      import('canvas-confetti').then(({ default: confetti }) => {
        const duration = 3000;
        const end = Date.now() + duration;
        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors: ['#25D366', '#128C7E', '#ffffff', '#ffd700']
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors: ['#25D366', '#128C7E', '#ffffff', '#ffd700']
          });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      });
    }

    if (redirectCountdown <= 0) {
      window.location.href = getWhatsAppUrl(session);
      return;
    }
    
    const timer = setTimeout(() => {
      setRedirectCountdown(prev => prev! - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [redirectCountdown, session]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
      if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  const handleCopyPix = async () => {
    const textToCopy = session.pixCopiaCola || '00020126420014br.gov.bcb.pix0120exemplo@virahit.com.br520400005303986540547.005802BR5908Vira Hit6009Sao Paulo62070503***6304ABCD';
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch {
      const el = document.createElement('textarea');
      el.value = textToCopy;
      document.body.appendChild(el); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
    }
    setCopied(true);
    // Para efeito de demonstração na interface se a api nao estiver ali
    if (!session.pixCopiaCola) {
        setTimeout(() => {
            if (!purchaseTracked.current) {
              purchaseTracked.current = true;
              trackMetaEvent('Purchase', {
                value: 47.00,
                currency: 'BRL',
                content_ids: ['music-personalizada'],
                content_type: 'product',
                num_items: 1,
              });
            }
            if (timerRef.current) clearInterval(timerRef.current);
            setPageState('confirmed');
            setRedirectCountdown(15);
        }, 3000);
    }
    copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = async () => {
    const codigoCurto = localStorage.getItem('codigoPedido') || ('VH-' + session.idPedido.slice(0, 6));
    const url = `${window.location.origin}/quiz/?pedido=${codigoCurto}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleRegeneratePix = async () => {
    if (!session.idPedido || session.idPedido === 'demo-pedido') return;
    // Guard: só bloqueia se está gerando OU se tem PIX ativo válido (não expirado)
    if (pixGenerating) return;
    if (session.pixCopiaCola && pixState === 'active') return;

    setPixGenerating(true);
    setPixError(null);
    try {
      const res = await fetch('/api/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId: session.idPedido,
          nome: session.compradorNome || session.nome,
          compradorNome: session.compradorNome || session.nome,
          compradorWhatsApp: session.compradorWhatsApp,
          compradorEmail: session.compradorEmail || '',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.error || (res.status === 429 ? 'Muitas tentativas, aguarde.' : 'Erro ao gerar PIX.');
        setPixError(errorMsg);
        setPixGenerating(false);
        return;
      }

      const data = await res.json();
      if (data.charge && data.charge.brCode) {
        const pixQRCodeUrl = data.charge.qrCodeImage || data.charge.paymentLinkUrl;
        const pixCopiaCola = data.charge.brCode;
        localStorage.setItem('pixQRCodeUrl', pixQRCodeUrl);
        localStorage.setItem('pixCopiaCola', pixCopiaCola);
        setSession((prev) => ({ ...prev, pixQRCodeUrl, pixCopiaCola }));
        setPixState('active');
        setTimeLeft(30 * 60);
      } else {
        setPixError('Não foi possível gerar o PIX. Tente novamente.');
      }
    } catch (e: any) {
      setPixError('Erro de conexao. Verifique sua internet e tente novamente.');
    } finally {
      setPixGenerating(false);
    }
  };

  const timerIsWarning = timeLeft <= 180;
  
  // Dois objetos de options separados — um por provider de Elements
  // Regra Stripe: ExpressCheckoutElement e PaymentElement NUNCA no mesmo provider
  // (causa validacao cruzada — erro de um dispara validacao do outro)
  // CRITICO: SÓ criar options quando clientSecret existe. Stripe Elements NÃO permite
  // mudar clientSecret depois de montado ("Unsupported prop change: options.clientSecret is not a mutable property")
  // Se montar sem clientSecret e depois tentar passar, confirmPayment() falha com
  // "You must pass in a clientSecret when calling stripe.confirmPayment()"
  const stripeOptionsExpress: StripeElementsOptions | undefined = clientSecret
    ? { clientSecret, appearance: stripeAppearance, locale: 'pt-BR' }
    : undefined;

  const stripeOptionsCard: StripeElementsOptions | undefined = clientSecret
    ? { clientSecret, appearance: stripeAppearance, locale: 'pt-BR' }
    : undefined;

  // Loading: nao renderizar checkout nem confirmed ate verificar status no Firestore
  if (checkingPaidStatus) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F4EEDC] px-6">
        <img src="/nova-logo-virahit.svg" alt="ViraHit" className="h-8 w-auto mb-8" />
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-[var(--teal)]/20 border-t-[var(--teal)] rounded-full animate-spin" />
          <p className="text-[var(--teal)]/60 text-[15px]" style={{ fontFamily: 'Merriweather, serif' }}>
            Verificando seu pedido...
          </p>
        </div>
      </div>
    );
  }

  if (pageState === 'confirmed') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F4EEDC] px-6">
        <style>{`
          @keyframes scale-in { 0%{transform:scale(0);opacity:0} 70%{transform:scale(1.1);opacity:1} 100%{transform:scale(1);opacity:1} }
          @keyframes fade-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
          .animate-scale-in{animation:scale-in 0.5s ease-out forwards}
          .animate-fade-in{animation:fade-in 0.4s ease-out forwards}
        `}</style>
        {/* Logo ViraHit no topo */}
        <div className="absolute top-6 left-0 right-0 flex justify-center">
          <img src="/nova-logo-virahit.svg" alt="ViraHit" className="h-8 w-auto" />
        </div>
        <div className="animate-fade-in flex flex-col items-center gap-6 text-center max-w-sm w-full">
          <div className="animate-scale-in flex items-center justify-center w-24 h-24 rounded-full bg-[#128C7E]">
            <CheckCircle className="w-14 h-14 text-white" strokeWidth={2} />
          </div>
          <h1 style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 800 }} className="text-2xl uppercase text-[#128C7E] leading-tight">
            Pagamento confirmado!
            <span className="block normal-case text-[18px] mt-2 text-[#2C5D63]" style={{ fontFamily: 'Merriweather, serif', fontWeight: 700 }}>
              Em até 24h você recebe no WhatsApp.
            </span>
          </h1>
          
          <div className="flex flex-col gap-3 w-full mt-2 items-center">
            <a href={getWhatsAppUrl(session)}
              className="flex items-center justify-center gap-3 px-6 w-full max-w-[340px] h-[54px] rounded-[10px] bg-[#25D366] text-white uppercase tracking-wide text-[14px] sm:text-[15px] transition-all hover:bg-[#20bd5a] active:scale-[0.98] shadow-[0_8px_20px_rgba(37,211,102,0.3)]"
              style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 800, textDecoration: 'none' }}
            >
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.659-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Acompanhar no WhatsApp
            </a>
            <div className="flex flex-col items-center mt-1">
              <p className="text-[#2C5D63] text-[14px] font-bold text-center leading-tight">
                Toque no botão acima e me envie um "Oi" para acompanhar a criação.
              </p>
              {redirectCountdown !== null && (
                <p className="text-[#2C5D63]/60 text-[12px] font-medium mt-1">
                  Aviso: Redirecionando automaticamente em {redirectCountdown}s...
                </p>
              )}
            </div>
            {/* Botão voltar para página inicial */}
            <a 
              href="/"
              className="flex items-center justify-center gap-2 px-6 w-full max-w-[340px] h-[48px] rounded-[10px] bg-white border border-[#2C5D63]/20 text-[#2C5D63] uppercase tracking-wide text-[13px] transition-all hover:bg-[#2C5D63]/5 active:scale-[0.98]"
              style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 800, textDecoration: 'none' }}
            >
              Voltar para página inicial
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EEDC]" style={{ fontFamily: 'Merriweather, serif' }}>
      <header className="sticky top-0 z-40 bg-[#F4EEDC]">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-center">
          <img src="/nova-logo-virahit.svg" alt="ViraHit" className="h-8 w-auto" />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8 flex flex-col gap-6">

        {/* BLOCK 1 — Order Summary */}
        <section className="bg-white/50 border border-[#2C5D63]/10 rounded-xl p-3 flex items-center justify-between shadow-sm mt-[-8px]">
          <div className="flex flex-col min-w-0 flex-1 pr-3">
            <h1 className="font-bold text-[#2C5D63] text-[14.5px] truncate" style={{ fontFamily: 'Merriweather, serif' }}>
              {session.nome ? resolverGenero('Música [DA_DO] [NOME]', session.generoDestinatario, session.nome) : resolverGenero('Música [DA_DO] [NOME]', session.generoDestinatario, '...')}
            </h1>
            <p className="text-[#2C5D63]/60 text-[12px] mt-1 leading-none font-medium truncate" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              {session.estiloMusical || 'Sertanejo'} &bull; {session.vozMusical ? `Voz ${session.vozMusical}` : 'Voz Masculina'}
            </p>
          </div>
          <div className="text-right pl-3 border-l border-[#2C5D63]/10 shrink-0">
            <p className="text-[#2C5D63]/50 text-[10px] font-bold uppercase tracking-widest leading-none mb-1 text-right">Total</p>
            <p className="font-extrabold text-[#128C7E] text-[18px] tracking-tight leading-none" style={{ fontFamily: 'Open Sans, sans-serif' }}>R$ 1,00</p>
          </div>
        </section>

        {/* BLOCK 2 — Payment */}
        <section className="flex flex-col gap-5 bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <h2 className="font-extrabold text-[#2C5D63] text-base uppercase tracking-widest text-center" style={{ fontFamily: 'Open Sans, sans-serif' }}>Finalize seu pedido</h2>

          {/* Tab selector */}
          <div className="flex rounded-xl overflow-hidden border-[1.5px] border-[#2C5D63]/20 bg-[#F4EEDC]/30 p-1 gap-1">
            {(['pix', 'card'] as PaymentTab[]).map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                className={`flex-1 h-12 flex items-center justify-center gap-2 font-bold text-[14px] uppercase tracking-wide transition-all duration-200 rounded-lg ${
                  activeTab === tab ? 'bg-white text-[#2C5D63] shadow-sm border border-gray-100' : 'bg-transparent text-[#2C5D63]/60 hover:text-[#2C5D63]'
                }`}
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              >
                {tab === 'pix' ? <><QrCode className="w-[18px] h-[18px]" />PIX</> : <><CreditCard className="w-[18px] h-[18px]" />Cartão</>}
              </button>
            ))}
          </div>

          {activeTab === 'pix' && (
            <div className="flex flex-col items-center gap-5 pt-3 w-full">
              {/* ESTADO INICIAL: botao para gerar PIX */}
              {!session.pixCopiaCola && (
                <div className="w-full flex flex-col items-center gap-5 bg-[#F4EEDC]/50 border border-[#2C5D63]/10 rounded-[20px] p-6 text-center">
                  {pixGenerating ? (
                    <>
                      <Loader2 className="w-16 h-16 text-[#33A854] animate-spin" strokeWidth={1.5} />
                      <div>
                        <p className="text-[#2C5D63] text-[17px] font-bold font-['Open_Sans']">Criando seu PIX...</p>
                        <p className="text-[#2C5D63]/60 text-[13px] font-['Merriweather'] mt-2">Só um momento, estamos gerando o código de pagamento.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-12 h-12 text-[#2C5D63]/40" strokeWidth={1.5} />
                      <p className="text-[#2C5D63]/80 text-[15px] leading-relaxed">
                        Pague com PIX e receba sua música em até <span className="font-bold text-[#128C7E]">24h no WhatsApp</span>.
                      </p>
                      <p className="text-[#2C5D63]/60 text-[13px] font-medium">
                        O código PIX é gerado na hora — rápido e seguro.
                      </p>
                    </>
                  )}
                  {pixError && (
                    <div className="w-full bg-red-50 border border-red-300 rounded-xl px-4 py-3 mt-1">
                      <p className="text-red-700 text-[13px] font-['Merriweather']">{pixError}</p>
                    </div>
                  )}
                  {!pixGenerating && (
                    <button
                      type="button"
                      onClick={async () => {
                        await handleRegeneratePix();
                      }}
                      className="flex items-center justify-center gap-2 w-full h-[56px] rounded-full bg-[#33A854] text-white font-bold text-[15px] uppercase tracking-wide hover:bg-[#2d954b] active:scale-[0.98] transition-all duration-200 mt-2 shadow-[0_8px_20px_rgba(51,168,84,0.3)]"
                      style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 800 }}
                    >
                      <QrCode className="w-[20px] h-[20px]" />Gerar PIX
                    </button>
                  )}
                </div>
              )}

              {/* PIX GERADO — fluxo normal de pagamento */}
              {session.pixCopiaCola && pixState === 'active' && !pixGenerating && (
                <>
                  <div className="w-full flex flex-col gap-4">
                    {/* The input field representing Copia e Cola */}
                    <div 
                      onClick={handleCopyPix}
                      className="border border-[#2C5D63]/20 rounded-xl p-4 flex items-center justify-between bg-white shadow-sm cursor-pointer hover:border-[#128C7E]/50 transition-colors"
                    >
                      <span className="text-[#2C5D63]/70 font-mono text-[13px] truncate flex-1 leading-none mr-2">
                        {session.pixCopiaCola || '00020126580014br.gov.bcb.pix...'}
                      </span>
                      <div className="bg-[#F4EEDC]/50 p-1.5 rounded-lg shrink-0">
                        <Copy className="w-5 h-5 text-[#2C5D63]/70" />
                      </div>
                    </div>

                    <p className="text-[#2C5D63]/80 text-[14px] text-center px-4 leading-relaxed font-medium">
                      Copie o código do QR Code, abra o app do seu banco e pague via Pix Copia e Cola
                    </p>

                    <button type="button" onClick={handleCopyPix}
                      className={`relative overflow-hidden flex items-center justify-center gap-2 w-full h-[56px] rounded-[10px] font-bold text-[14.5px] tracking-wide transition-all duration-300 ${copied ? 'bg-[#128C7E] text-white shadow-[0_8px_20px_rgba(18,140,126,0.2)]' : 'bg-[#128C7E] text-white hover:bg-[#0f7669] shadow-sm active:scale-[0.98]'}`}
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    >
                      {!copied && <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity"></div>}
                      <div className="relative z-10 flex items-center gap-2 uppercase">
                        {copied ? <><Check className="w-[20px] h-[20px]" strokeWidth={2.5} />COPIADO!</> : <><Copy className="w-[18px] h-[18px]" strokeWidth={2.5} />COPIAR CÓDIGO QR CODE</>}
                      </div>
                    </button>
                    
                    <div className="flex flex-col items-center justify-center w-full mt-1 gap-0.5">
                      <button type="button" onClick={() => setShowQR(!showQR)}
                         className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg font-bold text-[12.5px] uppercase tracking-wide text-[#6B7280] hover:text-[#128C7E] active:bg-gray-50 transition-colors"
                         style={{ fontFamily: 'Open Sans, sans-serif' }}
                      >
                         <QrCode className="w-[16px] h-[16px]" strokeWidth={2.5} /> {showQR ? 'ESCONDER' : 'MOSTRAR'} CÓDIGO QR
                      </button>

                      <button type="button" onClick={handleCopyLink}
                         className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg font-bold text-[12.5px] uppercase tracking-wide text-[#6B7280] hover:text-[#128C7E] active:bg-gray-50 transition-colors"
                         style={{ fontFamily: 'Open Sans, sans-serif' }}
                      >
                         {linkCopied ? <><Check className="w-[16px] h-[16px]" strokeWidth={2.5} /> LINK COPIADO</> : <><Share2 className="w-[16px] h-[16px]" strokeWidth={2.5} /> COMPARTILHAR P/ OUTRO PAGAR</>}
                      </button>
                    </div>
                  </div>

                  {showQR && (
                    <div className="bg-white p-4 rounded-xl border border-[#2C5D63]/10 flex flex-col items-center shadow-sm w-full animate-in fade-in zoom-in-95 duration-200">
                      <p className="text-[13px] font-bold text-[#2C5D63] mb-3 uppercase tracking-wider">Escaneie o QR Code</p>
                      {session.pixQRCodeUrl
                        ? <img src={session.pixQRCodeUrl} alt="QR Code PIX" width={180} height={180} className="rounded-lg mix-blend-multiply border border-gray-100 p-2" />
                        : <div className="w-[180px] h-[180px] bg-gray-50 rounded-lg flex items-center justify-center shadow-inner"><QrCode className="w-12 h-12 text-gray-300" /></div>
                      }
                    </div>
                  )}

                <div className="flex flex-col items-center gap-2 w-full border-t border-[#2C5D63]/10 pt-5 mt-1">
                  <span className="text-[#2C5D63]/80 text-[13px] font-bold uppercase tracking-wider">Este código expira em</span>
                  <span className={`inline-flex items-center justify-center px-5 py-1.5 rounded-full font-mono font-bold text-white text-[17px] transition-colors duration-500 shadow-sm ${timerIsWarning ? 'bg-red-500 animate-pulse' : 'bg-[#128C7E]'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                
                <div className="flex flex-col items-center w-full mt-1 gap-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[#2C5D63]/70 text-[13px] font-medium">Destinatário:</span>
                    <span className="text-[#2C5D63] text-[13px] font-bold">ViraHit.ai</span>
                  </div>
                  <span className="text-[#2C5D63]/50 text-[11px]">CNPJ: 54.218.428/0001-44</span>
                </div>
                </>
              )}

              {/* PIX EXPIRADO — gerar novo */}
              {pixState === 'expired' && (
                <div className="w-full flex flex-col items-center gap-4 bg-[#F4EEDC]/50 border border-[#2C5D63]/10 rounded-[20px] p-6 text-center">
                  {pixGenerating ? (
                    <>
                      <Loader2 className="w-16 h-16 text-[#33A854] animate-spin" strokeWidth={1.5} />
                      <div>
                        <p className="text-[#2C5D63] text-[17px] font-bold font-['Open_Sans']">Gerando novo PIX...</p>
                        <p className="text-[#2C5D63]/60 text-[13px] font-['Merriweather'] mt-2">Só um momento.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Clock className="w-12 h-12 text-[#2C5D63]/50" strokeWidth={1.5} />
                      <p className="text-[#2C5D63]/80 text-[15px] leading-relaxed">O código expirou, mas seu pedido está guardado. Gere um novo em segundos:</p>
                      {pixError && (
                        <div className="w-full bg-red-50 border border-red-300 rounded-xl px-4 py-3">
                          <p className="text-red-700 text-[13px] font-['Merriweather']">{pixError}</p>
                        </div>
                      )}
                      <button type="button" onClick={handleRegeneratePix}
                        className="flex items-center justify-center gap-2 w-full h-[56px] rounded-full bg-[#33A854] text-white font-bold text-[15px] uppercase tracking-wide hover:bg-[#2d954b] active:scale-[0.98] transition-all duration-200 mt-2 shadow-[0_8px_20px_rgba(51,168,84,0.3)]"
                        style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 800 }}
                      >
                        <QrCode className="w-[20px] h-[20px]" />Gerar novo PIX
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'card' && (
            <div className="flex flex-col gap-4 mt-2">
              {/* Erro de inicializacao do Stripe */}
              {cardInitError && (
                <div className="flex flex-col gap-3 bg-red-50 border border-red-300 rounded-xl px-5 py-4">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5 text-lg">⚠️</span>
                    <div>
                      <p className="text-red-900 text-[14px] font-bold font-['Open_Sans']">Erro ao preparar pagamento</p>
                      <p className="text-red-700 text-[13px] mt-1 font-['Merriweather']">{cardInitError}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCardInitError(null);
                      fetchClientSecret();
                    }}
                    className="w-full py-2.5 bg-[#2C5D63] text-white rounded-lg text-[13px] font-bold font-['Open_Sans'] hover:bg-[#1a3d42] transition-colors"
                  >
                    Tentar novamente
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('pix')}
                    className="w-full py-2.5 bg-white border border-[#2C5D63] text-[#2C5D63] rounded-lg text-[13px] font-bold font-['Open_Sans'] hover:bg-gray-50 transition-colors"
                  >
                    Pagar com PIX
                  </button>
                </div>
              )}

              {/* Loading */}
              {cardInitLoading && !cardInitError && (
                <div className="flex flex-col items-center justify-center gap-3 py-8">
                  <Loader2 className="w-8 h-8 text-[#2C5D63] animate-spin" />
                  <p className="text-[#2C5D63]/60 text-[14px]">Preparando formulário...</p>
                </div>
              )}

              {/* Formulario pronto */}
              {!cardInitLoading && !cardInitError && stripePromise && stripeOptionsExpress && stripeOptionsCard && (
                <>
                  {/* Elements SEPARADO para ExpressCheckoutElement (Apple Pay / Google Pay) */}
                  <Elements stripe={stripePromise} options={stripeOptionsExpress}>
                    <ExpressOnlyForm
                      pedidoId={session.idPedido}
                      onPaymentConfirmed={() => {
                        // Purchase event is tracked in confirmarPagamento with guard
                        if (!purchaseTracked.current) {
                          purchaseTracked.current = true;
                          trackMetaEvent('Purchase', {
                            value: 47.00,
                            currency: 'BRL',
                            content_ids: ['music-personalizada'],
                            content_type: 'product',
                            num_items: 1,
                          });
                        }
                        if (timerRef.current) clearInterval(timerRef.current);
                        ['idPedido','pixQRCodeUrl','pixCopiaCola','dataEntregaGarantida',
                         'compradorNome','compradorWhatsApp','generoDestinatario','estiloMusical','vozMusical'
                        ].forEach(k => localStorage.removeItem(k));
                        setPageState('confirmed');
                        setRedirectCountdown(15);
                      }}
                    />
                  </Elements>

                  {/* Elements SEPARADO para PaymentElement (cartao de credito) */}
                  <Elements stripe={stripePromise} options={stripeOptionsCard}>
                    <CardForm
                      pedidoId={session.idPedido}
                      onPaymentConfirmed={() => {
                        // Purchase event is tracked in confirmarPagamento with guard
                        if (!purchaseTracked.current) {
                          purchaseTracked.current = true;
                          trackMetaEvent('Purchase', {
                            value: 47.00,
                            currency: 'BRL',
                            content_ids: ['music-personalizada'],
                            content_type: 'product',
                            num_items: 1,
                          });
                        }
                        if (timerRef.current) clearInterval(timerRef.current);
                        setPageState('confirmed');
                        setRedirectCountdown(15);
                      }}
                      onSwitchToPix={() => setActiveTab('pix')}
                    />
                  </Elements>
                </>
              )}

              {/* Sem pedido valido */}
              {!cardInitLoading && !cardInitError && session.idPedido === 'demo-pedido' && (
                <div className="flex flex-col items-center justify-center gap-3 py-8 bg-amber-50 border border-amber-300 rounded-xl px-4">
                  <p className="text-amber-900 text-[14px] font-bold text-center">Nenhum pedido encontrado</p>
                  <p className="text-amber-700 text-[13px] text-center">Você precisa preencher o quiz primeiro para gerar um pedido.</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-2 py-2.5 px-5 bg-[#2C5D63] text-white rounded-lg text-[13px] font-bold font-['Open_Sans'] hover:bg-[#1a3d42] transition-colors"
                  >
                    Voltar ao início
                  </button>
                </div>
              )}

              {/* Fallback: ainda carregando dados do pedido */}
              {!cardInitLoading && !cardInitError && !stripeOptionsCard && session.idPedido !== 'demo-pedido' && (
                <div className="flex flex-col items-center justify-center gap-3 py-8">
                  <Loader2 className="w-8 h-8 text-[#2C5D63] animate-spin" />
                  <p className="text-[#2C5D63]/60 text-[14px]">Carregando dados do pedido...</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* BLOCK 3 — Guarantee (Moved below Payment) */}
        <section className="bg-gradient-to-r from-[#2C5D63] to-[#204448] rounded-2xl p-5 flex gap-4 items-center shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-[0.08]">
            <ShieldCheck className="w-32 h-32 text-white" />
          </div>
          <div className="bg-white/10 p-3 rounded-full backdrop-blur-md relative z-10">
            <ShieldCheck className="w-8 h-8 text-[#A5D6A7]" strokeWidth={2} />
          </div>
          <div className="flex flex-col gap-1 relative z-10 pt-1">
            <p className="font-extrabold text-white text-[16px] uppercase tracking-wide" style={{ fontFamily: 'Open Sans, sans-serif' }}>Risco Zero Garantido</p>
            <p className="text-white/90 text-[14px] leading-snug">Se não emocionar, nós devolvemos <span className="font-bold underline decoration-[#A5D6A7]/50 underline-offset-2">cada centavo</span>.</p>
          </div>
        </section>

        {/* BLOCK 4 — Scarcity & Herd Effect */}
        <section className="flex flex-col gap-4">
          {/* Infrastructure Scarcity */}
          <div className="bg-gradient-to-r from-[#EAA115] to-[#D9900B] rounded-2xl p-5 flex gap-4 items-center shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-[0.15]">
              <Clock className="w-32 h-32 text-white" />
            </div>
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-md relative z-10 flex-shrink-0">
              <Clock className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <div className="flex flex-col gap-1 relative z-10 pt-1">
              <p className="font-extrabold text-white text-[16px] uppercase tracking-wide" style={{ fontFamily: 'Open Sans, sans-serif' }}>Estúdios Lotados</p>
              <p className="text-white/90 text-[14px] leading-snug">Sua vaga está reservada. Entrega da música em <span className="font-bold underline decoration-white/50 underline-offset-2">até 24h</span> após o pagamento.</p>
            </div>
          </div>

          {/* Herd Effect */}
          <div className="flex items-center gap-4 bg-white border border-[#2C5D63]/10 rounded-2xl p-5 w-full shadow-sm">
            <div className="flex -space-x-2 flex-shrink-0">
               <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=1" alt="Avatar" />
               <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=5" alt="Avatar" />
               <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=9" alt="Avatar" />
               <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-[#2C5D63]">+1k</div>
            </div>
            <p className="text-[#2C5D63]/80 text-[13.5px] leading-relaxed">
              Junte-se a <span className="font-bold text-[#2C5D63]">mais de 1.000 pessoas</span> que já emocionaram quem amam.
            </p>
          </div>
        </section>

        {/* BLOCK 5 — Support */}
        <section className="flex flex-col items-center pb-8 mt-2">
          <div className="flex items-center gap-2 text-[#2C5D63]/70">
            <svg className="w-[18px] h-[18px] text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.659-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            <span className="text-[13px] font-bold leading-none">Mônica está no WhatsApp se precisar de algo</span>
          </div>
        </section>

      </main>
    </div>
  );
}
