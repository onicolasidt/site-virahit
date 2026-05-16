import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./src/lib/firebase";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
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
    const { pedidoId, session, nome, compradorWhatsApp, compradorEmail } = req.body;

    if (!pedidoId) {
      log('WARN', 'VALIDATION', 'PIX: pedidoId ausente no body', { requestId, payload: sanitize(req.body) });
      return res.status(400).json({ error: "pedidoId é obrigatório" });
    }

    const PEDIDOS_INVALIDOS = ['demo-pedido', 'test', 'demo', 'undefined', 'null'];
    if (PEDIDOS_INVALIDOS.includes(pedidoId)) {
      log('WARN', 'VALIDATION', `PIX: pedidoId inválido/fantasma bloqueado: ${pedidoId}`, { requestId });
      return res.status(400).json({ error: "pedidoId inválido" });
    }

    if (!WOOVI_APP_ID) {
      log('ERROR', 'PIX', 'WOOVI_APP_ID não configurado', { requestId });
      return res.status(500).json({ error: "WOOVI_APP_ID não configurada." });
    }

    // FIX: Verificar se pedido já tem PIX no Firestore antes de chamar Woovi
    // Isso evita criar PIX duplicado quando o endpoint /api/criar-pedido-com-pix já gerou um
    try {
      const pedidoDoc = await getDoc(doc(db, "pedidos", pedidoId));
      if (pedidoDoc.exists()) {
        const pedidoData = pedidoDoc.data();
        if (pedidoData.pixCopiaCola && pedidoData.pixCriadoEm) {
          log('INFO', 'PIX', `Pedido ${pedidoId} já tem PIX no Firestore — retornando dados existentes`, { requestId });
          return res.json({
            success: true,
            charge: {
              brCode: pedidoData.pixCopiaCola,
              qrCodeImage: pedidoData.pixQRCodeUrl,
              correlationID: pedidoId,
              status: 'ACTIVE',
            }
          });
        }
      }
    } catch (fbErr: any) {
      log('WARN', 'PIX', `Falha ao verificar pedido no Firestore para ${pedidoId} — seguindo com Woovi`, {
        requestId, error: errorPayload(fbErr)
      });
    }

    // Extrair dados do cliente — compradorNome tem prioridade sobre nome do homenageado
    const clienteNome = nome || session?.compradorNome || session?.nome || 'Cliente ViraHit';
    const clienteWhatsApp = compradorWhatsApp || session?.compradorWhatsApp || session?.whatsapp || "5511999999999";
    const clienteEmail = compradorEmail || session?.compradorEmail || `${pedidoId}@virahit.com`;

    log('INFO', 'PIX', `Criando cobrança PIX para pedido ${pedidoId}`, {
      requestId,
      meta: { pedidoId, nome: clienteNome }
    });

    // Verificar se já existe cobrança ativa para este pedido (evita duplicata de correlationID)
    // NOTA: Woovi retorna 404 para charges EXPIRADOS no GET, mas 400 "Já existe" no POST.
    // Por isso: se GET = 404, ainda podemos ter conflito. O fix é usar correlationID com sufixo
    // de timestamp quando a tentativa de POST retornar "Já existe" (cobrança expirada).
    let correlationIDUsado = pedidoId;

    try {
      const checkController = new AbortController();
      const checkTimeout = setTimeout(() => checkController.abort(), 10000);
      const existingRes = await fetch(`https://api.woovi.com/api/v1/charge/correlationID/${pedidoId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': WOOVI_APP_ID },
        signal: checkController.signal,
      });
      clearTimeout(checkTimeout);
      if (existingRes.ok) {
        const existingData = await existingRes.json();
        const existingCharge = existingData.charge;
        if (existingCharge && existingCharge.brCode && existingCharge.status !== 'COMPLETED') {
          log('INFO', 'PIX', `Cobrança PIX já existe para ${pedidoId} — reutilizando`, {
            requestId, meta: { pedidoId, correlationID: existingCharge.correlationID, status: existingCharge.status }
          });
          return res.json({ success: true, charge: existingCharge });
        }
      }
    } catch (checkErr: any) {
      // Se a verificação falhar (timeout, rede), seguimos para criar normalmente
      log('WARN', 'PIX', `Falha ao verificar cobrança existente para ${pedidoId} — seguindo com criação`, {
        requestId, error: errorPayload(checkErr)
      });
    }

    // Função auxiliar para criar uma cobrança PIX com o correlationID fornecido
    async function criarCobrancaWoovi(corrID: string) {
      const pixController = new AbortController();
      const pixTimeout = setTimeout(() => pixController.abort(), 10000);
      const r = await fetch("https://api.woovi.com/api/v1/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": WOOVI_APP_ID },
        body: JSON.stringify({
          correlationID: corrID,
          value: 100,
          expiresIn: 1800, // 30 minutos
          comment: `ViraHit - Música ${clienteNome}`,
          customer: {
            name: clienteNome,
            email: clienteEmail,
            phone: clienteWhatsApp
          }
        }),
        signal: pixController.signal,
      });
      clearTimeout(pixTimeout);
      return r;
    }

    let response = await criarCobrancaWoovi(correlationIDUsado);

    // Se a Woovi retornar 400 com "Já existe" (cobrança expirada — o GET retorna 404 para charges
    // expirados mas o POST bloqueia o reuso do correlationID), criar com sufixo de timestamp.
    if (!response.ok) {
      let errorBody: any = {};
      try { errorBody = await response.json(); } catch {}
      const errMsg: string = (errorBody?.error || errorBody?.message || '').toLowerCase();
      const isDuplicateError = errMsg.includes('já existe') || errMsg.includes('ja existe') ||
                               errMsg.includes('already exists') || errMsg.includes('duplicate');

      if (response.status === 400 && isDuplicateError) {
        // correlationID antigo expirou — criar novo com sufixo único
        correlationIDUsado = `${pedidoId}-${Date.now()}`;
        log('WARN', 'PIX', `correlationID ${pedidoId} expirado na Woovi — retentando com ${correlationIDUsado}`, { requestId });
        response = await criarCobrancaWoovi(correlationIDUsado);
      } else {
        log('ERROR', 'PIX', `Woovi retornou status ${response.status}`, {
          requestId,
          statusCode: response.status,
          payload: sanitize(errorBody),
          meta: { pedidoId }
        });
        return res.status(response.status).json({ error: "Erro ao gerar PIX" });
      }
    }

    const data = await response.json();

    if (!response.ok) {
      log('ERROR', 'PIX', `Woovi retornou status ${response.status} na segunda tentativa`, {
        requestId,
        statusCode: response.status,
        payload: sanitize(data),
        meta: { pedidoId, correlationIDUsado }
      });
      return res.status(response.status).json({ error: "Erro ao gerar PIX" });
    }

    const charge = data.charge;

    // Salvar no Firestore
    try {
      await setDoc(doc(db, "pedidos", pedidoId), {
        pixCopiaCola: charge.brCode,
        pixQRCodeUrl: charge.qrCodeImage || charge.paymentLinkUrl,
        pixCriadoEm: new Date().toISOString(),
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
// POST /api/criar-pedido-com-pix — Cria pedido + gera PIX no servidor
// ==========================================
app.post("/api/criar-pedido-com-pix", async (req: any, res: any) => {
  const requestId = req._requestId ?? generateRequestId();
  const startMs = req._startMs ?? Date.now();

  // Rate limit por IP
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp, 20, 60000)) {
    log('WARN', 'RATE_LIMIT', `criar-pedido-com-pix rate limit exceeded for IP ${clientIp}`, { requestId });
    return res.status(429).json({ error: "Muitas requisições. Aguarde um momento." });
  }

    try {
    const {
      nome, estilo, voz, genero,
      compradorNome, compradorWhatsApp, compradorEmail,
      campoA, campoB, campoC, campoCOutro, vinculo,
      audioBlobs, audioNome, audioCampoA, audioCampoB, audioCampoCOutro
    } = req.body;

    if (!nome || !compradorNome || !compradorWhatsApp) {
      log('WARN', 'VALIDATION', 'criar-pedido-com-pix: dados obrigatórios ausentes', { requestId });
      return res.status(400).json({ error: "Dados obrigatórios ausentes" });
    }

    // 1. Cria pedido no Firestore
    const pedidoRef = doc(collection(db, "pedidos"));
    const pedidoId = pedidoRef.id;
    const codigoCurto = 'VH-' + pedidoId.slice(0, 6);
    const agora = new Date().toISOString();

    await setDoc(pedidoRef, {
      nome,
      estilo,
      voz,
      genero,
      compradorNome,
      compradorWhatsApp,
      compradorEmail: compradorEmail || '',
      campoA: campoA || '',
      campoB: campoB || '',
      campoC: campoC || '',
      campoCOutro: campoCOutro || '',
      vinculo: vinculo || '',
      codigoCurto,
      status: 'pendente',
      gateway: 'stripe',
      criadoEm: agora,
      // Áudios gravados no quiz
      ...(audioBlobs ? { audioBlobs } : {}),
      ...(audioNome ? { audioNome } : {}),
      ...(audioCampoA ? { audioCampoA } : {}),
      ...(audioCampoB ? { audioCampoB } : {}),
      ...(audioCampoCOutro ? { audioCampoCOutro } : {}),
    });

    log('INFO', 'FIREBASE', `Pedido ${pedidoId} criado com código curto ${codigoCurto}`, { requestId });

    // 2. Tenta gerar PIX na Woovi (com timeout de 5s)
    let pixData = null;
    let pixGerado = false;

    if (WOOVI_APP_ID) {
      try {
        const pixController = new AbortController();
        const pixTimeout = setTimeout(() => pixController.abort(), 5000);

        const response = await fetch("https://api.woovi.com/api/v1/charge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": WOOVI_APP_ID
          },
          body: JSON.stringify({
            correlationID: pedidoId,
            value: 100,
            expiresIn: 1800,
            comment: `ViraHit - Música ${nome}`,
            customer: {
              name: compradorNome || nome,
              email: compradorEmail || `${pedidoId}@virahit.com`,
              phone: compradorWhatsApp
            }
          }),
          signal: pixController.signal,
        });
        clearTimeout(pixTimeout);

        if (response.ok) {
          const data = await response.json();
          pixData = data.charge;

          // Salva PIX no Firestore
          await setDoc(pedidoRef, {
            pixCopiaCola: pixData.brCode,
            pixQRCodeUrl: pixData.qrCodeImage || pixData.paymentLinkUrl,
            pixCriadoEm: agora,
          }, { merge: true });

          pixGerado = true;
          log('INFO', 'PIX', `PIX gerado no servidor para ${pedidoId}`, { requestId });
        } else {
          log('WARN', 'PIX', `Woovi retornou ${response.status} para ${pedidoId}`, { requestId });
        }
      } catch (pixErr: any) {
        log('WARN', 'PIX', `Woovi falhou ao gerar PIX para ${pedidoId}: ${pixErr.message}`, { requestId });
      }
    }

    // 3. Retorna tudo para o frontend
    const responsePayload: any = {
      success: true,
      pedidoId,
      codigoCurto,
      pixGerado,
    };

    if (pixGerado && pixData) {
      responsePayload.pix = {
        copiaCola: pixData.brCode,
        qrCodeUrl: pixData.qrCodeImage || pixData.paymentLinkUrl,
        criadoEm: agora,
      };
    }

    log('INFO', 'SERVER', `Pedido ${pedidoId} criado ${pixGerado ? 'com PIX' : 'sem PIX'} em ${Date.now() - startMs}ms`, {
      requestId,
      durationMs: Date.now() - startMs,
      meta: { pedidoId, codigoCurto, pixGerado }
    });

    res.json(responsePayload);

  } catch (err: any) {
    log('FATAL', 'SERVER', `Erro ao criar pedido: ${err.message}`, {
      requestId,
      durationMs: Date.now() - startMs,
      error: errorPayload(err),
      payload: sanitize(req.body),
    });
    res.status(500).json({ error: "Erro ao criar pedido. Tente novamente." });
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
      // FIX: Extrair pedidoId original do correlationID (remove sufixo -timestamp se existir)
      // correlationID pode ser "pedidoId" ou "pedidoId-1234567890123" quando houve retentativa
      let pedidoId = charge?.correlationID;
      if (pedidoId) {
        const match = pedidoId.match(/^(.+)-\d{13}$/);
        if (match) {
          log('INFO', 'WEBHOOK', `correlationID ${pedidoId} tem sufixo de retentativa — extraindo pedidoId original: ${match[1]}`, { requestId });
          pedidoId = match[1];
        }
      }

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

    if (!webhookSecret || !signature) {
      log('ERROR', 'WEBHOOK', 'STRIPE_WEBHOOK_SECRET nao configurado ou assinatura ausente — rejeitando webhook', { requestId });
      return res.status(400).send('Webhook Error: missing secret or signature');
    }
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);

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
// POST /api/log-erro — Frontend error logging → Firestore (Admin REST API, bypasses rules)
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

    // 2. Enviar para Firestore collection 'frontend_errors' via Python Admin SDK (bypasses rules)
    (async () => {
      try {
        const { exec } = await import('child_process');
        try {
          const scriptPath = '/home/hermes_general/empresa/funil-web/quiz-virahit-v2/scripts/log-frontend-error.py';
          const TABLE_ID = process.env.BASEROW_ERROS_TABLE_ID || '974283';
          const proc = exec(`BASEROW_ERROS_TABLE_ID=${TABLE_ID} python3 ${scriptPath}`);
          proc.stdin!.write(JSON.stringify({
            pagina, etapa, erro_tipo, erro_mensagem, erro_stack,
            user_agent, pedido_id, comprador_nome, comprador_whatsapp, comprador_email,
          }));
          proc.stdin!.end();
          proc.stdout?.on('data', (chunk: Buffer) => {
            const out = chunk.toString().trim();
            if (out.startsWith('OK:')) {
              const docId = out.split(':')[1];
              log('INFO', 'FRONTEND_ERROR_LOG', `Erro salvo em frontend_errors/${docId}`, { requestId });
            }
          });
          proc.stderr?.on('data', (chunk: Buffer) => {
            log('WARN', 'FRONTEND_ERROR_LOG', `Python stderr: ${chunk.toString().trim().slice(0, 300)}`, { requestId });
          });
        } catch {}
      } catch (fbErr: any) {
        log('WARN', 'FRONTEND_ERROR_LOG', `Falha ao salvar erro: ${fbErr.message}`, { requestId });
      }
    })();

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
