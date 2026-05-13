import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./src/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Stripe from 'stripe';
import { log, generateRequestId, sanitize, errorPayload } from './src/lib/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

log('INFO', 'SERVER', `Iniciando servidor ViraHit na porta ${PORT}`, {
  meta: { nodeEnv: process.env.NODE_ENV, pid: process.pid }
});

// ==========================================
// Middleware: rewrite /quiz/api/* → /api/* (proxy compatibility)
// ==========================================
app.use((req: any, _res: any, next: any) => {
  if (req.path.startsWith('/quiz/api/')) {
    req.url = req.url.replace(/^\/quiz\/api/, '/api');
  }
  next();
});

// ==========================================
// Stripe client (lazy init)
// ==========================================
let stripeClient: Stripe | null = null;
export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is required');
    stripeClient = new Stripe(key, { apiVersion: '2026-04-22.dahlia' as any });
  }
  return stripeClient;
}

// ==========================================
// Middleware: requestId + log de entrada/saída
// ==========================================
app.use('/api', (req: any, res: any, next: any) => {
  const requestId = generateRequestId();
  const startMs = Date.now();
  req._requestId = requestId;
  req._startMs = startMs;

  log('INFO', 'REQUEST', `${req.method} ${req.path}`, {
    requestId,
    method: req.method,
    path: req.path,
    payload: sanitize({ body: req.body, query: req.query, headers: { 'user-agent': req.headers['user-agent'], 'content-type': req.headers['content-type'] } }),
  });

  // Interceptar o res.json original para logar a saída
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    const duration = Date.now() - startMs;
    const level = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    log(level, 'RESPONSE', `${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`, {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration,
      payload: sanitize(body),
    });
    return originalJson(body);
  };

  next();
});

// Stripe webhook requires raw body for signature verification
app.use('/api/webhook/stripe', express.raw({ type: 'application/json' }));
// Body parser com limite generoso para payload grandes (session com audio base64)
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ type: '*/*', limit: '10mb' }));

// Rate limiting simples em memória para endpoints de pagamento (preparação escala)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string, maxRequests: number = 30, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

const WOOVI_APP_ID = process.env.WOOVI_APP_ID || "";

// ==========================================
// POST /api/pix — Criar cobrança PIX via Woovi
// ==========================================
app.post("/api/pix", async (req: any, res: any) => {
  const requestId = req._requestId ?? generateRequestId();
  const startMs = req._startMs ?? Date.now();

  // Rate limit por IP: 20 requests/minuto por endpoint PIX
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp, 20, 60000)) {
    log('WARN', 'RATE_LIMIT', `PIX rate limit exceeded for IP ${clientIp}`, { requestId });
    return res.status(429).json({ error: "Muitas requisições. Aguarde um momento." });
  }

  try {
    const { pedidoId, session, nome, compradorWhatsApp } = req.body;

    if (!pedidoId) {
      log('WARN', 'VALIDATION', 'PIX: pedidoId ausente no body', { requestId, payload: sanitize(req.body) });
      return res.status(400).json({ error: "pedidoId é obrigatório" });
    }

    if (!WOOVI_APP_ID) {
      log('ERROR', 'PIX', 'WOOVI_APP_ID não configurado', { requestId });
      return res.status(500).json({ error: "WOOVI_APP_ID não configurado." });
    }

    // Extrair dados do cliente — aceita tanto session (backward compat) quanto campos diretos
    const clienteNome = nome || session?.nome || 'Cliente ViraHit';
    const clienteWhatsApp = compradorWhatsApp || session?.compradorWhatsApp || session?.whatsapp || "5511999999999";

    log('INFO', 'PIX', `Criando cobrança PIX para pedido ${pedidoId}`, {
      requestId,
      meta: { pedidoId, nome: clienteNome }
    });

    const response = await fetch("https://api.woovi.com/api/v1/charge", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": WOOVI_APP_ID },
      body: JSON.stringify({
        correlationID: pedidoId,
        value: 100,
        comment: `ViraHit - Música ${clienteNome}`,
        customer: {
          name: clienteNome,
          email: `${pedidoId}@virahit.com`,
          phone: clienteWhatsApp
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      log('ERROR', 'PIX', `Woovi retornou status ${response.status}`, {
        requestId,
        statusCode: response.status,
        payload: sanitize(data),
        meta: { pedidoId }
      });
      return res.status(response.status).json({ error: "Erro ao gerar PIX" });
    }

    const charge = data.charge;

    // Salvar no Firestore
    try {
      await setDoc(doc(db, "pedidos", pedidoId), {
        pixCopiaCola: charge.brCode,
        pixQRCodeUrl: charge.qrCodeImage || charge.paymentLinkUrl,
      }, { merge: true });
      log('INFO', 'FIREBASE', `Pedido ${pedidoId} atualizado com dados PIX`, { requestId, meta: { pedidoId } });
    } catch (fbErr: any) {
      log('ERROR', 'FIREBASE', `Falha ao salvar dados PIX no Firestore para ${pedidoId}`, {
        requestId,
        error: errorPayload(fbErr),
        meta: { pedidoId }
      });
      // Não falha o request — dados já estão no response
    }

    log('INFO', 'PIX', `Cobrança PIX criada com sucesso para ${pedidoId}`, {
      requestId,
      durationMs: Date.now() - startMs,
      meta: { pedidoId, correlationID: charge.correlationID, status: charge.status, value: charge.value }
    });

    res.json({ success: true, charge });

  } catch (err: any) {
    log('FATAL', 'PIX', `Erro não tratado em POST /api/pix`, {
      requestId,
      durationMs: Date.now() - startMs,
      error: errorPayload(err),
      payload: sanitize(req.body),
    });
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// POST /api/webhook/pix — Webhook Woovi
// ==========================================
app.post("/api/webhook/pix", async (req: any, res: any) => {
  const requestId = req._requestId ?? generateRequestId();

  try {
    let payload = req.body;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch {}
    }
    if (payload && typeof payload === 'object' && Object.keys(payload).length === 1
        && typeof Object.keys(payload)[0] === 'string'
        && Object.keys(payload)[0].includes('teste_webhook')) {
      try { payload = JSON.parse(Object.keys(payload)[0]); } catch {}
    }

    log('INFO', 'WEBHOOK', 'Webhook PIX recebido', {
      requestId,
      payload: sanitize(payload),
    });

    if (payload?.evento === "teste_webhook" || payload?.event === "teste_webhook") {
      log('INFO', 'WEBHOOK', 'Teste de webhook PIX — OK', { requestId });
      return res.status(200).json({ status: "OK", message: "Webhook integrado com sucesso!" });
    }

    const charge = payload?.charge;
    if ((charge && charge.status === "COMPLETED") || payload?.event === "OPENPIX:CHARGE_COMPLETED") {
      const pedidoId = charge?.correlationID;

      if (pedidoId) {
        await setDoc(doc(db, "pedidos", pedidoId), {
          status: "pago",
          pagoEm: new Date().toISOString()
        }, { merge: true });
        log('INFO', 'WEBHOOK', `✔ Pedido ${pedidoId} marcado PAGO via PIX`, { requestId, meta: { pedidoId } });
      } else {
        log('WARN', 'WEBHOOK', 'Webhook PIX COMPLETED sem correlationID', { requestId, payload: sanitize(payload) });
      }
    }

    res.status(200).send("OK");

  } catch (err: any) {
    log('ERROR', 'WEBHOOK', 'Erro ao processar webhook PIX', {
      requestId,
      error: errorPayload(err),
      payload: sanitize(req.body),
    });
    res.status(200).send("Erro Interno Tratado");
  }
});

// ==========================================
// POST /api/pagamento/criar-intencao — Stripe PaymentIntent
// ==========================================
app.post("/api/pagamento/criar-intencao", async (req: any, res: any) => {
  const requestId = req._requestId ?? generateRequestId();
  const startMs = req._startMs ?? Date.now();

  // Rate limit por IP: 30 requests/minuto por endpoint de criar intenção
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp, 30, 60000)) {
    log('WARN', 'RATE_LIMIT', `Stripe criar-intencao rate limit exceeded for IP ${clientIp}`, { requestId });
    return res.status(429).json({ error: "Muitas requisições. Aguarde um momento." });
  }

  try {
    const { pedidoId } = req.body;

    if (!pedidoId) {
      log('WARN', 'VALIDATION', 'Stripe: pedidoId ausente', { requestId, payload: sanitize(req.body) });
      return res.status(400).json({ error: "pedidoId é obrigatório" });
    }

    let stripe: Stripe;
    try {
      stripe = getStripe();
    } catch (e: any) {
      log('FATAL', 'STRIPE', 'STRIPE_SECRET_KEY não configurada — servidor sem credencial', {
        requestId,
        error: errorPayload(e),
      });
      return res.status(500).json({ error: "Stripe não configurado. Adicione STRIPE_SECRET_KEY." });
    }

    log('INFO', 'STRIPE', `Criando PaymentIntent para pedido ${pedidoId}`, { requestId, meta: { pedidoId } });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100,
      currency: "brl",
      metadata: { pedidoId },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // Remove metodos redirect (iDEAL etc) — Apple Pay e Google Pay funcionam sem redirect
      },
    });

    log('INFO', 'STRIPE', `PaymentIntent criado: ${paymentIntent.id} para ${pedidoId}`, {
      requestId,
      durationMs: Date.now() - startMs,
      meta: { pedidoId, intentId: paymentIntent.id, amount: paymentIntent.amount, currency: paymentIntent.currency }
    });

    res.json({ clientSecret: paymentIntent.client_secret });

  } catch (err: any) {
    log('FATAL', 'STRIPE', `Erro ao criar PaymentIntent`, {
      requestId,
      durationMs: Date.now() - startMs,
      error: errorPayload(err),
      payload: sanitize(req.body),
    });
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// POST /api/webhook/stripe — Webhook Stripe
// ==========================================
app.post("/api/webhook/stripe", async (req: any, res: any) => {
  const requestId = req._requestId ?? generateRequestId();
  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } else {
      event = JSON.parse(req.body.toString());
    }

    log('INFO', 'WEBHOOK', `Webhook Stripe recebido: ${event.type}`, {
      requestId,
      meta: { eventType: event.type, eventId: event.id }
    });

  } catch (err: any) {
    log('ERROR', 'WEBHOOK', `Stripe Webhook falhou na autenticação`, {
      requestId,
      error: errorPayload(err),
    });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const pedidoId = paymentIntent.metadata?.pedidoId;

      log('INFO', 'STRIPE', `PaymentIntent succeeded: ${paymentIntent.id}, pedido: ${pedidoId}`, {
        requestId,
        meta: { intentId: paymentIntent.id, pedidoId, amount: paymentIntent.amount }
      });

      if (pedidoId) {
        await setDoc(doc(db, "pedidos", pedidoId), {
          status: "pago",
          pagoEm: new Date().toISOString(),
          gateway: "stripe"
        }, { merge: true });
        log('INFO', 'FIREBASE', `✔ Pedido ${pedidoId} marcado PAGO via Stripe`, { requestId, meta: { pedidoId } });
      } else {
        log('WARN', 'WEBHOOK', 'Stripe PaymentIntent succeeded sem pedidoId no metadata', {
          requestId,
          meta: { intentId: paymentIntent.id }
        });
      }
    }

    res.status(200).send("OK");

  } catch (err: any) {
    log('ERROR', 'WEBHOOK', `Erro ao processar evento Stripe ${event.type}`, {
      requestId,
      error: errorPayload(err),
      meta: { eventType: event.type, eventId: event.id }
    });
    res.status(500).send("Erro Interno");
  }
});

// ==========================================
// POST /api/payment-event — Observability: gravar evento de pagamento
// ==========================================
app.post("/api/payment-event", async (req: any, res: any) => {
  const requestId = req._requestId ?? generateRequestId();
  try {
    const { pedidoId, etapa, gateway, erro, meta } = req.body;
    if (!pedidoId || !etapa) {
      return res.status(400).json({ error: "pedidoId e etapa são obrigatórios" });
    }
    const evento = {
      pedidoId,
      etapa,           // intent_criado | card_mounted | card_submitted | express_confirmed | pagamento_aprovado | pagamento_falhou | redirect_3ds
      gateway: gateway || 'stripe',
      erro: erro || null,
      meta: meta || {},
      ts: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || '',
    };
    const ref = doc(db, "payment_events", `${pedidoId}_${etapa}_${Date.now()}`);
    await setDoc(ref, evento);
    log('INFO', 'OBSERVABILITY', `Evento registrado: [${etapa}] pedido=${pedidoId}${erro ? ` ERRO=${erro}` : ''}`, { requestId, meta: evento });
    res.json({ ok: true });
  } catch (err: any) {
    log('ERROR', 'OBSERVABILITY', `Falha ao gravar payment_event`, { requestId, error: errorPayload(err) });
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// GET /api/payment-events/:pedidoId — Consultar eventos de um pedido
// ==========================================
app.get("/api/payment-events/:pedidoId", async (req: any, res: any) => {
  const requestId = req._requestId ?? generateRequestId();
  try {
    const { pedidoId } = req.params;
    const { getDocs, collection, query, where, orderBy } = await import('firebase/firestore');
    const q = query(
      collection(db, "payment_events"),
      where("pedidoId", "==", pedidoId),
      orderBy("ts", "asc")
    );
    const snap = await getDocs(q);
    const eventos = snap.docs.map(d => d.data());
    res.json({ pedidoId, eventos });
  } catch (err: any) {
    log('ERROR', 'OBSERVABILITY', `Falha ao buscar payment_events`, { requestId, error: errorPayload(err) });
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// POST /api/log-erro — Frontend error logging → Baserow
// ==========================================
app.post("/api/log-erro", async (req: any, res: any) => {
  const requestId = req._requestId ?? generateRequestId();
  try {
    const {
      pagina,         // conversion | checkout | quiz
      etapa,          // criar_pedido | submit_form | confirm_payment | etc
      erro_tipo,      // FirebaseError | NetworkError | StripeError | etc
      erro_mensagem,  // Mensagem legível do erro
      erro_stack,     // Stack trace (opcional)
      user_agent,     // Browser/dispositivo do cliente
      pedido_id,      // idPedido se houver
      comprador_nome,
      comprador_whatsapp,
      comprador_email,
    } = req.body || {};

    // 1. Log local imediato (sempre funciona)
    log('ERROR', 'FRONTEND_ERROR', `[${pagina}/${etapa}] ${erro_tipo}: ${erro_mensagem}`, {
      requestId,
      meta: { pagina, etapa, erro_tipo, pedido_id, comprador_nome },
      error: { name: erro_tipo || 'UnknownError', message: erro_mensagem, stack: erro_stack },
    });

    // 2. Enviar para Baserow (async, fire-and-forget — nunca bloqueia)
    const BASEROW_TOKEN = "cWMKvF1vPQUFlKZsFV3F1raIQ8s1bWrj";
    const BASEROW_TABLE = process.env.BASEROW_ERROS_TABLE_ID || "";
    const BASEROW_URL = BASEROW_TABLE
      ? `https://api.baserow.io/api/database/rows/table/${BASEROW_TABLE}/?user_field_names=true`
      : "";

    if (BASEROW_URL) {
      (async () => {
        try {
          const baserowPayload: Record<string, any> = {
            timestamp: new Date().toISOString(),
            pagina: pagina || '',
            etapa: etapa || '',
            erro_tipo: erro_tipo || '',
            erro_mensagem: erro_mensagem || '',
            erro_stack: erro_stack || '',
            user_agent: user_agent || '',
            pedido_id: pedido_id || '',
            comprador_nome: comprador_nome || '',
            comprador_whatsapp: comprador_whatsapp || '',
            comprador_email: comprador_email || '',
          };
          await fetch(BASEROW_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Token ${BASEROW_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(baserowPayload),
          });
          log('INFO', 'FRONTEND_ERROR_LOG', `Erro enviado para Baserow table ${BASEROW_TABLE}`, { requestId, meta: { pedido_id, pagina } });
        } catch (bErr: any) {
          log('WARN', 'FRONTEND_ERROR_LOG', `Falha ao enviar erro para Baserow: ${bErr.message}`, { requestId });
        }
      })();
    }

    res.json({ ok: true });
  } catch (err: any) {
    log('FATAL', 'FRONTEND_ERROR_LOG', `Falha no handler /api/log-erro`, {
      requestId,
      error: errorPayload(err),
    });
    res.status(200).json({ ok: true });  // Sempre 200 — log não pode gerar mais erro
  }
});

// ==========================================
// Health check
// ==========================================
app.get("/api/health", (_req: any, res: any) => {
  res.json({
    status: "ok",
    ts: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV,
    stripe: !!process.env.STRIPE_SECRET_KEY,
    woovi: !!process.env.WOOVI_APP_ID,
  });
});

// ==========================================
// Vite Middleware & Static Serving
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use("/quiz", express.static(distPath));
    app.get(["/quiz", "/quiz/*"], (_req: any, res: any) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    log('INFO', 'SERVER', `✅ Servidor rodando na porta ${PORT}`, {
      meta: { port: PORT, env: process.env.NODE_ENV, pid: process.pid }
    });
  });
}

startServer();
