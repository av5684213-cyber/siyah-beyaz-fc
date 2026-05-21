/**
 * Merkezi Loglama Sistemi
 * Konsola + Supabase error_logs tablosuna yazar
 */

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  source: string;
  level: LogLevel;
  message: string;
  stackTrace?: string;
  context?: Record<string, unknown>;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

const MIN_CONSOLE_LEVEL: LogLevel = 'debug';
const MIN_DB_LEVEL: LogLevel = 'error';

function shouldLog(level: LogLevel, minLevel: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[minLevel];
}

/**
 * Supabase error_logs tablosuna log yaz
 */
async function logToDatabase(entry: LogEntry): Promise<void> {
  if (!shouldLog(entry.level, MIN_DB_LEVEL)) return;
  if (!isSupabaseConfigured()) return;

  try {
    const supabase = getSupabase();
    if (!supabase) return;

    await supabase.from('error_logs').insert({
      source: entry.source,
      level: entry.level,
      message: entry.message,
      stack_trace: entry.stackTrace || null,
      context: entry.context || {},
    });
  } catch {
    // DB loglama başarısız olursa sessizce devam et
  }
}

/**
 * Konsola log yaz
 */
function logToConsole(entry: LogEntry): void {
  if (!shouldLog(entry.level, MIN_CONSOLE_LEVEL)) return;

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.source}]`;

  switch (entry.level) {
    case 'debug':
      console.debug(prefix, entry.message, entry.context || '');
      break;
    case 'info':
      console.info(prefix, entry.message, entry.context || '');
      break;
    case 'warn':
      console.warn(prefix, entry.message, entry.context || '');
      break;
    case 'error':
    case 'fatal':
      console.error(prefix, entry.message, entry.context || '', entry.stackTrace || '');
      break;
  }
}

/**
 * Ana log fonksiyonu
 */
function log(entry: LogEntry): void {
  logToConsole(entry);
  logToDatabase(entry); // fire-and-forget
}

/**
 * Logger factory - her modül için özel logger oluştur
 */
export function createLogger(source: string) {
  return {
    debug: (message: string, context?: Record<string, unknown>) =>
      log({ source, level: 'debug', message, context }),

    info: (message: string, context?: Record<string, unknown>) =>
      log({ source, level: 'info', message, context }),

    warn: (message: string, context?: Record<string, unknown>) =>
      log({ source, level: 'warn', message, context }),

    error: (message: string, error?: unknown, context?: Record<string, unknown>) =>
      log({
        source,
        level: 'error',
        message,
        stackTrace: error instanceof Error ? error.stack : error ? String(error) : undefined,
        context,
      }),

    fatal: (message: string, error?: unknown, context?: Record<string, unknown>) =>
      log({
        source,
        level: 'fatal',
        message,
        stackTrace: error instanceof Error ? error.stack : error ? String(error) : undefined,
        context,
      }),
  };
}

export type Logger = ReturnType<typeof createLogger>;
