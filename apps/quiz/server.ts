import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./src/lib/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
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
app.use('/audios', express.static(path.join(process.cwd(), 'uploads', 'audios')));
app.use('/audios', express.static(path.join(process.cwd(), 'uploads', 'rascunhos')));

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

const RASCUNHOS_DIR = path.join(process.cwd(), 'uploads', 'rascunhos');
if (!fs.existsSync(RASCUNHOS_DIR)) {
  fs.mkdirSync(RASCUNHOS_DIR, { recursive: true });
}

// ==========================================
// POST /api/salvar-rascunho — Salva dados do quiz em arquivo no VPS
// ==========================================
app.post("/api/salvar-rascunho", async (req: any, res: any) => {
  const requestId = req._requestId ?? generateRequestId();
  const startMs = req._startMs ?? Date.now();

  try {
    const { rascunhoId: idRecebido, step, data } = req.body || {};

    // Rate limit por IP
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp, 30, 60000)) {
      return res.status(429).json({ error: "Muitas requisições. Aguarde um momento." });
    }

    const rascunhoId = idRecebido || 'rasc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    const agora = new Date().toISOString();

    const arquivoPath = path.join(RASCUNHOS_DIR, `${rascunhoId}.json`);
    let existente: any = {};
    if (fs.existsSync(arquivoPath)) {
      existente = JSON.parse(fs.readFileSync(arquivoPath, 'utf-8'));
    }

    const payload = {
      ...existente,
      ...(data || {}),
      step: step || existente.step || 1,
      atualizadoEm: agora,
      ip: clientIp,
      userAgent: req.headers['user-agent'] || '',
      criadoEm: existente.criadoEm || agora,
    };

    fs.writeFileSync(arquivoPath, JSON.stringify(payload, null, 2));

    log('INFO', 'SERVER', `Rascunho ${rascunhoId} salvo em arquivo (step ${step})`, {
      requestId,
      durationMs: Date.now() - startMs,
      meta: { rascunhoId, step, isNovo: !idRecebido }
    });

    res.json({ success: true, rascunhoId });

  } catch (err: any) {
    log('ERROR', 'SERVER', `Erro ao salvar rascunho: ${err.message}`, {
      requestId,
      durationMs: Date.now() - startMs,
      error: errorPayload(err),
    });
    res.status(500).json({ error: "Erro ao salvar rascunho. Tente novamente." });
  }
});

// ==========================================
// POST /api/upload-audio — Recebe base64, salva no VPS, retorna audioId
// ==========================================
app.post("/api/upload-audio", async (req: any, res: any) => {
  const requestId = req._requestId ?? generateRequestId();
  const startMs = req._startMs ?? Date.now();

  try {
    const { base64, campo, rascunhoId } = req.body || {};

    if (!base64 || typeof base64 !== 'string') {
      return res.status(400).json({ error: "base64 é obrigatório" });
    }

    // Rate limit por IP
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp, 20, 60000)) {
      return res.status(429).json({ error: "Muitas requisições. Aguarde um momento." });
    }

    const buffer = Buffer.from(base64.replace(/^data:audio\/\w+;base64,/, ''), 'base64');

    if (buffer.length > MAX_AUDIO_SIZE_BYTES) {
      return res.status(413).json({ error: "Áudio muito grande. Máximo 5MB." });
    }

    // Usa rascunhoId para organizar os áudios, ou gera um ID temporário
    const pastaId = rascunhoId || 'temp-' + Date.now();
    const dir = path.join(UPLOADS_DIR, pastaId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const audioId = `${campo || 'audio'}-${Date.now()}`;
    const safeId = audioId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${safeId}.webm`;
    const filePath = path.join(dir, fileName);

    fs.writeFileSync(filePath, buffer);

    log('INFO', 'AUDIO', `Áudio ${safeId} salvo para ${pastaId} (${buffer.length} bytes)`, {
      requestId,
      durationMs: Date.now() - startMs,
      meta: { rascunhoId: pastaId, campo, size: buffer.length }
    });

    res.json({
      success: true,
      audioId: safeId,
      url: `/audios/${pastaId}/${fileName}`,
      size: buffer.length,
    });

  } catch (err: any) {
    log('ERROR', 'AUDIO', `Erro ao salvar áudio: ${err.message}`, {
      requestId,
      durationMs: Date.now() - startMs,
      error: errorPayload(err),
    });
    res.status(500).json({ error: "Erro ao salvar áudio. Tente novamente." });
  }
});

// ==========================================
// GET /api/rascunho/:id — Busca dados do rascunho em arquivo no VPS
// ==========================================
app.get("/api/rascunho/:id", async (req: any, res: any) => {
  const requestId = req._requestId ?? generateRequestId();
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID do rascunho é obrigatório" });

    const arquivoPath = path.join(RASCUNHOS_DIR, `${id}.json`);
    if (!fs.existsSync(arquivoPath)) {
      return res.status(404).json({ error: "Rascunho não encontrado" });
    }

    const data = JSON.parse(fs.readFileSync(arquivoPath, 'utf-8'));
    res.json({ success: true, data });

  } catch (err: any) {
    log('ERROR', 'SERVER', `Erro ao buscar rascunho: ${err.message}`, { requestId, error: errorPayload(err) });
    res.status(500).json({ error: "Erro ao buscar rascunho" });
  }
});

// ==========================================
// GET /api/pedido/:codigoCurto — Busca pedido por código curto (servidor → Firestore)
// Resolve lentidão do Client SDK no browser (20s → <1s)
// ==========================================
app.get("/api/pedido/:codigoCurto", async (req: any, res: any) => {
  const requestId = req._requestId ?? generateRequestId();
  try {
    const { codigoCurto } = req.params;
    if (!codigoCurto) return res.status(400).json({ error: "Código do pedido obrigatório" });

    let data: any = null;
    let docId = '';

    // 1. Tentar buscar pelo código curto (mais comum)
    if (codigoCurto.startsWith('VH-')) {
      const q = query(
        collection(db, "pedidos"),
        where("codigoCurto", "==", codigoCurto),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        docId = snap.docs[0].id;
        data = snap.docs[0].data();
      }
    }

    // 2. Se não achou (ou não é código curto), tentar por ID direto
    if (!data) {
      const snap = await getDoc(doc(db, "pedidos", codigoCurto));
      if (snap.exists()) {
        docId = snap.id;
        data = snap.data();
      }
    }

    if (!data) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    log('INFO', 'SERVER', `Pedido ${codigoCurto} encontrado via API (${docId})`, { requestId });
    res.json({ success: true, pedido: { idPedido: docId, ...data } });

  } catch (err: any) {
    log('ERROR', 'SERVER', `Erro ao buscar pedido ${req.params.codigoCurto}: ${err.message}`, { requestId, error: errorPayload(err) });
    res.status(500).json({ error: "Erro ao buscar pedido" });
  }
});

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
          // Verificar se PIX ainda está válido (não expirou)
          const pixIdadeMs = Date.now() - new Date(pedidoData.pixCriadoEm).getTime();
          const PIX_EXPIRATION_MS = 30 * 60 * 1000; // 30 minutos (match com expiresIn Woovi e timer do front)

          if (pixIdadeMs > PIX_EXPIRATION_MS) {
            log('INFO', 'PIX', `PIX expirado para ${pedidoId} (idade: ${Math.round(pixIdadeMs / 60000)}min) — criando novo`, { requestId });
            // NÃO retornar — continuar execução para criar novo PIX
          } else {
            log('INFO', 'PIX', `Pedido ${pedidoId} já tem PIX válido no Firestore — retornando dados existentes`, { requestId });
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
          // Verificar se a cobrança não está expirada
          if (existingCharge.status === 'EXPIRED') {
            log('INFO', 'PIX', `Cobrança PIX expirada na Woovi para ${pedidoId} — criando nova`, {
              requestId, meta: { pedidoId, status: existingCharge.status }
            });
            // NÃO retornar — continuar para criar nova cobrança
          } else {
            log('INFO', 'PIX', `Cobrança PIX já existe para ${pedidoId} — reutilizando`, {
              requestId, meta: { pedidoId, correlationID: existingCharge.correlationID, status: existingCharge.status }
            });
            return res.json({ success: true, charge: existingCharge });
          }
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

    // Fire-and-forget Baserow sync for PIX generation
    const isRegenerated = correlationIDUsado.includes('-') && correlationIDUsado !== pedidoId;
    const evento = isRegenerated ? 'pix_regenerado' : 'pix_gerado';
    sincronizarProducao({ codigoCurto: pedidoId }, evento, requestId);

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
// Função: salvar áudios no VPS (base64 → arquivo)
// ==========================================
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'audios');
const MAX_AUDIOS_PER_PEDIDO = 10;
const MAX_AUDIO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_TOTAL_AUDIO_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

// ==========================================
// Baserow sync — fire-and-forget
// ==========================================
const BASEROW_TOKEN = 'cWMKvF1vPQUFlKZsFV3F1raIQ8s1bWrj';
const BASEROW_TABLE_ID = '901528';

async function sincronizarProducao(pedido: any, evento: string, requestId?: string, audioFiles?: Array<{ campo: string; path: string }>) {
  try {
    const rId = requestId || generateRequestId();
    const codigoCurto = pedido.codigoCurto || pedido.idPedido;
    if (!codigoCurto || codigoCurto === 'demo-pedido') return;

    // Build payload based on event
    let statusPagamento = 'Pendente';
    let tentativasIncrement = 0;
    if (evento === 'pix_gerado') { statusPagamento = 'PIX_Gerado'; tentativasIncrement = 1; }
    else if (evento === 'pix_regenerado') { statusPagamento = 'PIX_Regenerado'; tentativasIncrement = 1; }
    else if (evento === 'pago') { statusPagamento = 'Pago'; }
    else if (evento === 'falhou_cartao') { statusPagamento = 'Falhou_Cartao'; }

    // Check if row exists by ID Pedido
    const searchRes = await fetch(
      `https://api.baserow.io/api/database/rows/table/${BASEROW_TABLE_ID}/?user_field_names=true&filter__ID+Pedido__equal=${encodeURIComponent(codigoCurto)}`,
      { headers: { 'Authorization': `Token ${BASEROW_TOKEN}` } }
    );

    const searchData = await searchRes.json().catch(() => ({ results: [] }));
    const existingRow = searchData.results?.[0];

    const nowIso = new Date().toISOString();

    if (existingRow) {
      // UPDATE existing row
      const currentTentativas = existingRow['Tentativas_PIX'] || 0;
      const updatePayload: any = {
        'Status_Pagamento': statusPagamento,
        'Ultima_Acao': nowIso,
      };
      if (tentativasIncrement > 0) {
        updatePayload['Tentativas_PIX'] = currentTentativas + tentativasIncrement;
      }
      const patchRes = await fetch(
        `https://api.baserow.io/api/database/rows/table/${BASEROW_TABLE_ID}/${existingRow.id}/?user_field_names=true`,
        {
          method: 'PATCH',
          headers: { 'Authorization': `Token ${BASEROW_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        }
      );
      if (!patchRes.ok) {
        log('WARN', 'BASEROW', `Failed to update row ${existingRow.id} for ${codigoCurto}`, { requestId: rId, meta: { status: patchRes.status } });
      } else {
        log('INFO', 'BASEROW', `Updated row ${existingRow.id} for ${codigoCurto} → ${statusPagamento}`, { requestId: rId });
      }
    } else if (evento === 'criado' || evento === 'pix_gerado' || evento === 'pix_regenerado') {
      // CREATE new row (criado, pix_gerado, pix_regenerado — todos criam se não existir)
      const historia = [pedido.campoA, pedido.campoB, pedido.campoC].filter(Boolean).join('\n\n');

      // Mapeia audioFiles → campos Baserow
      // Cada campo do quiz tem sua própria coluna de áudio (A, B e C separados)
      const audioUrls: Record<string, string> = {};
      if (audioFiles && audioFiles.length > 0) {
        for (const af of audioFiles) {
          const url = `https://virahit.ai/${af.path}`;
          const c = af.campo.toLowerCase();
          if (c.includes('campoa') || c.includes('campo_a') || c.includes('audioCampoA')) {
            audioUrls['Audio_Campo_A'] = url;
          } else if (c.includes('campob') || c.includes('campo_b') || c.includes('audioCampoB')) {
            audioUrls['Audio_Campo_B'] = url;
          } else if (c.includes('campoc') || c.includes('campo_c') || c.includes('campocoutro') || c.includes('audioCampoCOutro')) {
            audioUrls['Audio_Campo_C'] = url;
          } else {
            log('WARN', 'BASEROW', `Campo de áudio não mapeado: ${af.campo}`, { requestId: rId });
          }
        }
      }

      const createPayload: any = {
        'Nome_Comprador': pedido.compradorNome || '',
        'whatsapp': pedido.compradorWhatsApp || '',
        'Nome_Homenageado': pedido.nome || '',
        'Estilo Musical': pedido.estilo || '',
        'Historia Base': historia.substring(0, 4000),
        'Vinculo Relacionamento': pedido.vinculo || '',
        'Genero Vocal': pedido.voz || '',
        'ID Pedido': codigoCurto,
        'registro_obra': codigoCurto,
        'data_criacao': pedido.criadoEm || nowIso,
        'Ticket_Gasto': pedido.valor || 47.00,
        'Status_Pagamento': statusPagamento,
        'Tentativas_PIX': tentativasIncrement,
        'Ultima_Acao': nowIso,
        ...audioUrls,
      };
      const postRes = await fetch(
        `https://api.baserow.io/api/database/rows/table/${BASEROW_TABLE_ID}/?user_field_names=true`,
        {
          method: 'POST',
          headers: { 'Authorization': `Token ${BASEROW_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(createPayload),
        }
      );
      if (!postRes.ok) {
        log('WARN', 'BASEROW', `Failed to create row for ${codigoCurto}`, { requestId: rId, meta: { status: postRes.status } });
      } else {
        const created = await postRes.json();
        log('INFO', 'BASEROW', `Created row ${created.id} for ${codigoCurto}`, { requestId: rId });
      }
    }
  } catch (err: any) {
    log('WARN', 'BASEROW', `Sync failed for ${pedido?.codigoCurto || '?'}: ${err.message}`, { requestId, error: errorPayload(err) });
  }
}

async function salvarAudiosNoVPS(
  audioBlobs: Record<string, string>,
  codigoCurto: string,
  requestId: string
): Promise<Array<{ campo: string; path: string; size: number; gravadoEm: string }>> {
  const audioFiles: Array<{ campo: string; path: string; size: number; gravadoEm: string }> = [];
  const entries = Object.entries(audioBlobs);

  if (entries.length > MAX_AUDIOS_PER_PEDIDO) {
    log('WARN', 'AUDIO', `Limite de ${MAX_AUDIOS_PER_PEDIDO} áudios excedido para ${codigoCurto}: ${entries.length} recebidos`, { requestId });
  }

  const dir = path.join(UPLOADS_DIR, codigoCurto);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let totalSize = 0;
  const agora = new Date().toISOString();

  for (const [campo, base64Data] of entries.slice(0, MAX_AUDIOS_PER_PEDIDO)) {
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > MAX_AUDIO_SIZE_BYTES) {
      log('WARN', 'AUDIO', `Áudio ${campo} de ${codigoCurto} excede 5MB (${buffer.length} bytes) — descartado`, { requestId });
      continue;
    }

    if (totalSize + buffer.length > MAX_TOTAL_AUDIO_SIZE_BYTES) {
      log('WARN', 'AUDIO', `Tamanho total de áudios de ${codigoCurto} excede 20MB — ${campo} descartado`, { requestId });
      continue;
    }

    const safeCampo = campo.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${safeCampo}.webm`;
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, buffer);
    totalSize += buffer.length;

    audioFiles.push({
      campo: safeCampo,
      path: `audios/${codigoCurto}/${fileName}`,
      size: buffer.length,
      gravadoEm: agora,
    });

    log('INFO', 'AUDIO', `Áudio ${campo} salvo para ${codigoCurto} (${buffer.length} bytes)`, { requestId });
  }

  return audioFiles;
}

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
      rascunhoId,
      nome, estilo, voz, genero,
      compradorNome, compradorWhatsApp, compradorEmail,
      campoA, campoB, campoC, campoCOutro, vinculo,
      audioBlobs, audioNome, audioCampoA, audioCampoB, audioCampoCOutro
    } = req.body;

    // Sanitizar undefined → string vazia (Firestore rejeita undefined como valor de campo)
    const safeNome = nome || '';
    const safeEstilo = estilo || '';
    const safeVoz = voz || '';
    const safeGenero = genero || '';

    // === NOVO: se receber rascunhoId, busca dados do Firestore ===
    let pedidoData: any = {
      nome: safeNome, estilo: safeEstilo, voz: safeVoz, genero: safeGenero,
      compradorNome, compradorWhatsApp, compradorEmail,
      campoA, campoB, campoC, campoCOutro, vinculo,
      audioBlobs, audioNome, audioCampoA, audioCampoB, audioCampoCOutro
    };

    if (rascunhoId) {
      try {
        const arquivoPath = path.join(RASCUNHOS_DIR, `${rascunhoId}.json`);
        if (fs.existsSync(arquivoPath)) {
          const rascunho = JSON.parse(fs.readFileSync(arquivoPath, 'utf-8'));
          // Mescla dados do rascunho com dados do body (body tem prioridade para contato)
          pedidoData = {
            nome: rascunho.nome || safeNome,
            estilo: rascunho.estilo || safeEstilo,
            voz: rascunho.voz || safeVoz,
            genero: rascunho.genero || safeGenero,
            compradorNome: compradorNome || rascunho.compradorNome,
            compradorWhatsApp: compradorWhatsApp || rascunho.compradorWhatsApp,
            compradorEmail: compradorEmail || rascunho.compradorEmail,
            campoA: rascunho.campoA || campoA || '',
            campoB: rascunho.campoB || campoB || '',
            campoC: rascunho.campoC || campoC || '',
            campoCOutro: rascunho.campoCOutro || campoCOutro || '',
            vinculo: rascunho.vinculo || vinculo || '',
            audioNome: rascunho.audioNome || audioNome,
            audioCampoA: rascunho.audioCampoA || audioCampoA,
            audioCampoB: rascunho.audioCampoB || audioCampoB,
            audioCampoCOutro: rascunho.audioCampoCOutro || audioCampoCOutro,
            audioBlobs: rascunho.audioBlobs || audioBlobs,
          };
          log('INFO', 'SERVER', `Rascunho ${rascunhoId} carregado de arquivo para criar pedido`, { requestId, meta: { rascunhoId } });
        } else {
          log('WARN', 'SERVER', `Rascunho ${rascunhoId} não encontrado em arquivo — usando dados do body`, { requestId });
        }
      } catch (rascunhoErr: any) {
        log('WARN', 'SERVER', `Erro ao buscar rascunho ${rascunhoId}: ${rascunhoErr.message} — usando dados do body`, { requestId });
      }
    }

    if (!pedidoData.nome || !pedidoData.compradorNome || !pedidoData.compradorWhatsApp) {
      log('WARN', 'VALIDATION', 'criar-pedido-com-pix: dados obrigatórios ausentes', { requestId });
      return res.status(400).json({ error: "Dados obrigatórios ausentes" });
    }

    // 1. Gera ID do pedido e código curto
    const pedidoRef = doc(collection(db, "pedidos"));
    const pedidoId = pedidoRef.id;
    const codigoCurto = 'VH-' + pedidoId.slice(0, 6);
    const agora = new Date().toISOString();

    // 2. Salvar áudios no VPS (se houver)
    let audioFiles: Array<{ campo: string; path: string; size: number; gravadoEm: string }> = [];
    if (pedidoData.audioBlobs && typeof pedidoData.audioBlobs === 'object' && Object.keys(pedidoData.audioBlobs).length > 0) {
      audioFiles = await salvarAudiosNoVPS(pedidoData.audioBlobs, codigoCurto, requestId);
    }

    // 3. Cria pedido no Firestore (sanitiza undefined → string vazia)
    await setDoc(pedidoRef, {
      nome: pedidoData.nome || '',
      estilo: pedidoData.estilo || '',
      voz: pedidoData.voz || '',
      genero: pedidoData.genero || '',
      compradorNome: pedidoData.compradorNome || '',
      compradorWhatsApp: pedidoData.compradorWhatsApp || '',
      compradorEmail: pedidoData.compradorEmail || '',
      campoA: pedidoData.campoA || '',
      campoB: pedidoData.campoB || '',
      campoC: pedidoData.campoC || '',
      campoCOutro: pedidoData.campoCOutro || '',
      vinculo: pedidoData.vinculo || '',
      codigoCurto,
      status: 'pendente',
      gateway: 'stripe',
      criadoEm: agora,
      // audioBlobs salvo em arquivo no VPS — referência abaixo
      ...(audioFiles.length > 0 ? { audioFiles } : {}),
      ...(pedidoData.audioNome ? { audioNome: pedidoData.audioNome } : {}),
      ...(pedidoData.audioCampoA ? { audioCampoA: pedidoData.audioCampoA } : {}),
      ...(pedidoData.audioCampoB ? { audioCampoB: pedidoData.audioCampoB } : {}),
      ...(pedidoData.audioCampoCOutro ? { audioCampoCOutro: pedidoData.audioCampoCOutro } : {}),
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
            comment: `ViraHit - Música ${pedidoData.nome}`,
            customer: {
              name: pedidoData.compradorNome || pedidoData.nome,
              email: pedidoData.compradorEmail || `${pedidoId}@virahit.com`,
              phone: pedidoData.compradorWhatsApp
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

    // Fire-and-forget Baserow sync — se PIX já foi gerado nesta request, usa evento 'pix_gerado'
    // para que o status no Baserow reflita corretamente (PIX_Gerado + Tentativas_PIX=1)
    const baserowEvento = pixGerado ? 'pix_gerado' : 'criado';
    const pedidoPayload = {
      nome: pedidoData.nome,
      estilo: pedidoData.estilo,
      voz: pedidoData.voz,
      genero: pedidoData.genero,
      compradorNome: pedidoData.compradorNome,
      compradorWhatsApp: pedidoData.compradorWhatsApp,
      compradorEmail: pedidoData.compradorEmail,
      campoA: pedidoData.campoA,
      campoB: pedidoData.campoB,
      campoC: pedidoData.campoC,
      vinculo: pedidoData.vinculo,
      codigoCurto,
      criadoEm: agora,
      valor: 47.00,
    };
    sincronizarProducao(pedidoPayload, baserowEvento, requestId, audioFiles);

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

        // Fire-and-forget Baserow sync
        sincronizarProducao({ codigoCurto: pedidoId }, 'pago', requestId);
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

        // Fire-and-forget Baserow sync
        sincronizarProducao({ codigoCurto: pedidoId }, 'pago', requestId);
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
          const scriptPath = '/home/hermes_general/empresa/site-virahit/apps/quiz/scripts/log-frontend-error.py';
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
