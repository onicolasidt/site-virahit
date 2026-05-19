/**
 * GA4 Analytics Tracking Helper for ViraHit
 * 
 * Copied from metaTracking.ts architecture, adapted for GA4.
 * 
 * Key differences from Meta Pixel:
 * - GA4 uses gtag('event', ...) instead of fbq('track', ...)
 * - GA4 deduplicates automatically (no event_id needed for dedup across platforms)
 * - GA4 has send_page_view: false — we track SPA navigation manually
 * - All tracking calls use requestIdleCallback to NOT compete with LCP
 * - NEVER send PII (name, email, phone) — only business context params
 * 
 * Measurement ID: G-1450VVBCMP
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

interface GA4EventParams {
  // Business context (permitted — no PII)
  estilo_musical?: string;
  vinculo?: string;
  voz?: string;
  step_number?: number;
  step_name?: string;
  pix_method?: string;
  time_to_expire?: number;
  cta_text?: string;
  cta_location?: string;
  // Page tracking (for manual SPA page_view)
  page_path?: string;
  page_title?: string;
  // E-commerce params (GA4 recommended)
  value?: number;
  currency?: string;
  transaction_id?: string;
  items?: Array<{
    item_id: string;
    item_name?: string;
    price?: number;
    quantity?: number;
  }>;
}

/**
 * Fire GA4 event with requestIdleCallback to not compete with LCP.
 * Falls back to setTimeout(200) if requestIdleCallback not available.
 */
function fireGA4Event(eventName: string, params?: GA4EventParams): void {
  if (typeof window === 'undefined') return;

  const tryFire = () => {
    if (window.gtag) {
      try {
        window.gtag('event', eventName, params || {});
      } catch (err) {
        console.warn('[GA4] Falha ao enviar evento:', err);
      }
      return true;
    }
    return false;
  };

  // Try immediately first (in case gtag is already loaded)
  if (tryFire()) return;

  // Use requestIdleCallback to not block main thread
  const scheduleIdle = window.requestIdleCallback 
    ? () => window.requestIdleCallback!(() => { if (!tryFire()) scheduleRetry(); })
    : () => setTimeout(() => { if (!tryFire()) scheduleRetry(); }, 200);

  const scheduleRetry = () => {
    setTimeout(() => {
      if (!tryFire()) {
        console.warn('[GA4] gtag não disponível — evento não enviado:', eventName);
      }
    }, 500);
  };

  scheduleIdle();
}

/**
 * Track a GA4 page view for SPA navigation.
 * MUST be called on every screen change (quiz step, conversion, checkout).
 * This replaces the auto page_view that we disabled in the gtag config.
 */
export function trackGA4PageView(path: string): void {
  fireGA4Event('page_view', {
    page_path: path,
    page_title: getPageTitle(path),
  });
}

/**
 * Track quiz step completion.
 * step: 1 (nome/vínculo), 2 (estilo/voz), 3 (história)
 */
export function trackGA4QuizStep(step: number, stepName: string, params?: { estilo_musical?: string; vinculo?: string; voz?: string }): void {
  fireGA4Event('quiz_step', {
    step_number: step,
    step_name: stepName,
    ...params,
  });
}

/**
 * Track quiz completion (all steps done).
 */
export function trackGA4QuizComplete(params: { estilo_musical: string; voz: string; vinculo: string }): void {
  fireGA4Event('quiz_complete', params);
}

/**
 * Track lead capture (email + WhatsApp submitted).
 * Uses GA4 recommended event 'generate_lead' with value for ad optimization.
 */
export function trackGA4LeadCaptured(value: number = 97): void {
  fireGA4Event('generate_lead', {
    value: value,
    currency: 'BRL',
  });
}

/**
 * Track checkout viewed (checkout screen rendered).
 * Uses GA4 recommended event 'begin_checkout'.
 */
export function trackGA4CheckoutViewed(value: number = 97): void {
  fireGA4Event('begin_checkout', {
    value: value,
    currency: 'BRL',
    items: [{ item_id: 'musica-personalizada', item_name: 'Música Personalizada', price: value, quantity: 1 }],
  });
}

/**
 * Track PIX code copied or QR code shown.
 */
export function trackGA4PixGenerated(method: 'copy' | 'qr'): void {
  fireGA4Event('pix_generated', {
    pix_method: method,
  });
}

/**
 * Track PIX expiration (timer ran out).
 */
export function trackGA4PixExpired(secondsRemaining: number = 0): void {
  fireGA4Event('pix_expired', {
    time_to_expire: secondsRemaining,
  });
}

/**
 * Track purchase confirmed (payment received).
 * Uses GA4 recommended event 'purchase' with transaction_id for deduplication.
 * Protected by purchaseTracked guard — call without guard check, it handles internally.
 */
let purchaseTrackedGA4 = false;

export function trackGA4Purchase(value: number, transactionId: string): void {
  if (purchaseTrackedGA4) return;
  purchaseTrackedGA4 = true;

  fireGA4Event('purchase', {
    value: value,
    currency: 'BRL',
    transaction_id: transactionId,
    items: [{ item_id: 'musica-personalizada', item_name: 'Música Personalizada', price: value, quantity: 1 }],
  });
}

/**
 * Reset purchase guard (for testing or page reload scenarios).
 */
export function resetGA4PurchaseGuard(): void {
  purchaseTrackedGA4 = false;
}

/**
 * Track CTA click on landing page.
 */
export function trackGA4CTAClick(ctaText: string, ctaLocation: string): void {
  fireGA4Event('cta_click', {
    cta_text: ctaText,
    cta_location: ctaLocation,
  });
}

/**
 * Get human-readable page title from path.
 */
function getPageTitle(path: string): string {
  const titles: Record<string, string> = {
    '/': 'Landing ViraHit',
    '/quiz': 'Quiz ViraHit',
    '/quiz/step-1': 'Quiz — Vínculo',
    '/quiz/step-2': 'Quiz — Estilo Musical',
    '/quiz/step-3': 'Quiz — História',
    '/quiz/conversao': 'Conversão — Dados de Contato',
    '/quiz/checkout': 'Checkout — Pagamento PIX',
    '/quiz/obrigado': 'Obrigado — Confirmação',
  };
  return titles[path] || `ViraHit — ${path}`;
}