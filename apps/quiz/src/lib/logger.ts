/**
 * ViraHit — Logger Estruturado
 * Grava cada evento em:
 *   1. logs/structured.log  — JSONL, uma linha por evento, consultável com grep/jq
 *   2. logs/errors-structured.log — apenas erros com stack trace completo
 *   3. console              — PM2 captura para out.log e error.log
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

const LOG_DIR = path.resolve(process.cwd(), 'logs');
const STRUCTURED_LOG = path.join(LOG_DIR, 'structured.log');
const ERROR_STRUCTURED_LOG = path.join(LOG_DIR, 'errors-structured.log');
const MAX_LOG_BYTES = 10 * 1024 * 1024; // 10MB

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
export type LogCategory =
  | 'REQUEST'
  | 'RESPONSE'
  | 'PIX'
  | 'STRIPE'
  | 'FIREBASE'
  | 'WEBHOOK'
  | 'SERVER'
  | 'VALIDATION'
  | 'OBSERVABILITY'
  | 'FRONTEND_ERROR'
  | 'FRONTEND_ERROR_LOG'
  | 'RATE_LIMIT'
  | 'UNKNOWN';

export interface LogEntry {
  ts: string;
  requestId: string;
  level: LogLevel;
  category: LogCategory;
  method?: string;
  path?: string;
  statusCode?: number;
  durationMs?: number;
  message: string;
  payload?: Record<string, any>;
  error?: { name: string; message: string; stack?: string };
  meta?: Record<string, any>;
}

const SENSITIVE_KEYS = ['secret', 'key', 'password', 'token', 'authorization', 'whsec', 'apikey', 'appid', 'brcode', 'pixcopiaCola'];

export function sanitize(obj: any, depth = 0): any {
  if (depth > 4 || obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  const result: any = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    const lower = key.toLowerCase();
    if (SENSITIVE_KEYS.some(s => lower.includes(s))) {
      result[key] = '[REDACTED]';
    } else if (typeof obj[key] === 'string' && obj[key].length > 400) {
      result[key] = obj[key].substring(0, 200) + `…[+${obj[key].length - 200}]`;
    } else if (typeof obj[key] === 'object') {
      result[key] = sanitize(obj[key], depth + 1);
    } else {
      result[key] = obj[key];
    }
  }
  return result;
}

function rotateLogs(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) return;
    if (fs.statSync(filePath).size < MAX_LOG_BYTES) return;
    const rotated = filePath.replace('.log', `.${Date.now()}.log`);
    fs.renameSync(filePath, rotated);
    // Manter só os 3 arquivos rotacionados mais recentes
    const dir = path.dirname(filePath);
    const base = path.basename(filePath, '.log');
    const old = fs.readdirSync(dir)
      .filter(f => f.startsWith(base + '.') && f.endsWith('.log'))
      .sort()
      .reverse()
      .slice(3);
    old.forEach(f => { try { fs.unlinkSync(path.join(dir, f)); } catch {} });
  } catch {}
}

function writeEntry(entry: LogEntry) {
  const line = JSON.stringify(entry) + '\n';
  const label = `[${entry.level}][${entry.category}][${entry.requestId}]`;

  if (entry.level === 'ERROR' || entry.level === 'FATAL') {
    console.error(`${label} ${entry.message}${entry.error ? `\n  ${entry.error.name}: ${entry.error.message}\n${entry.error.stack ?? ''}` : ''}`);
  } else {
    console.log(`${label} ${entry.message}`);
  }

  try { rotateLogs(STRUCTURED_LOG); fs.appendFileSync(STRUCTURED_LOG, line); } catch {}
  if (entry.level === 'ERROR' || entry.level === 'FATAL') {
    try { rotateLogs(ERROR_STRUCTURED_LOG); fs.appendFileSync(ERROR_STRUCTURED_LOG, line); } catch {}
  }
}

export function generateRequestId(): string {
  return crypto.randomBytes(4).toString('hex');
}

export function errorPayload(err: any): { name: string; message: string; stack?: string } {
  return {
    name: err?.name ?? 'UnknownError',
    message: err?.message ?? String(err),
    stack: err?.stack,
  };
}

export function log(
  level: LogLevel,
  category: LogCategory,
  message: string,
  opts: Partial<Omit<LogEntry, 'ts' | 'level' | 'category' | 'message'>> = {}
) {
  writeEntry({
    ts: new Date().toISOString(),
    requestId: opts.requestId ?? crypto.randomBytes(4).toString('hex'),
    level,
    category,
    message,
    ...opts,
  });
}
