/**
 * Meta Pixel + Conversions API (CAPI) Tracking Helper
 * Dual-tracks events: browser pixel + server-side CAPI for deduplication
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

interface TrackingData {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_type?: string;
  lead_type?: string;
  num_items?: number;
}

interface UserData {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Track Meta event with dual firing: browser Pixel + server CAPI
 */
export async function trackMetaEvent(eventName: string, data?: TrackingData): Promise<void> {
  try {
    // Generate consistent event_id for deduplication
    const event_id = `${eventName.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const event_time = Math.floor(Date.now() / 1000);

    // 1. Fire browser pixel (if available)
    if (typeof window !== 'undefined' && window.fbq) {
      try {
        window.fbq('track', eventName, data || {}, { eventID: event_id });
      } catch (fbqErr) {
        console.warn('[Meta Pixel] Falha ao enviar evento via fbq:', fbqErr);
      }
    }

    // 2. Collect user data from localStorage
    const userData = extractUserData();

    // 3. Collect Facebook cookies (_fbp, _fbc)
    const fbp = getCookie('_fbp');
    const fbc = getCookie('_fbc');

    // 4. Build CAPI payload
    const payload: Record<string, any> = {
      event_name: eventName,
      event_id,
      event_time,
      event_source_url: typeof window !== 'undefined' ? window.location.href : 'https://virahit.ai/quiz/',
      action_source: 'website',
      user_data: {
        email: userData.email || '',
        phone: userData.phone || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
      },
    };

    if (fbp) payload.fbp = fbp;
    if (fbc) payload.fbc = fbc;

    // Add e-commerce data if present
    if (data?.value) payload.value = data.value;
    if (data?.currency) payload.currency = data.currency;
    if (data?.content_ids) payload.content_ids = data.content_ids;
    if (data?.content_type) payload.content_type = data.content_type;
    if (data?.num_items) payload.num_items = data.num_items;

    // 5. Send to server CAPI endpoint (fire-and-forget)
    fetch('/api/meta-capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.warn('[Meta CAPI] Falha ao enviar evento via servidor:', err);
    });

  } catch (err) {
    console.error('[Meta Tracking] Erro ao enviar evento:', err);
  }
}

/**
 * Extract user data from localStorage (pedidoData)
 */
function extractUserData(): UserData {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return {};

    const pedidoDataStr = localStorage.getItem('pedidoData');
    if (!pedidoDataStr) return {};

    const pedidoData = JSON.parse(pedidoDataStr);

    const userData: UserData = {};

    // Email
    if (pedidoData.compradorEmail) {
      userData.email = pedidoData.compradorEmail;
    }

    // Phone (normalize to E.164 if needed)
    if (pedidoData.compradorWhatsApp) {
      let phone = pedidoData.compradorWhatsApp.toString().replace(/\D/g, '');
      if (phone && !phone.startsWith('55') && phone.length === 11) {
        phone = '55' + phone; // Add +55 Brazil prefix
      }
      userData.phone = phone;
    }

    // Name (split into first/last)
    if (pedidoData.compradorNome) {
      const parts = pedidoData.compradorNome.trim().split(/\s+/);
      userData.first_name = parts[0] || '';
      userData.last_name = parts.slice(1).join(' ') || '';
    }

    return userData;
  } catch (err) {
    console.warn('[Meta Tracking] Erro ao extrair user data:', err);
    return {};
  }
}

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | null {
  try {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  } catch {
    return null;
  }
}
