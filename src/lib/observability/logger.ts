import { env } from '@/lib/env';

type Level = 'debug' | 'info' | 'warn' | 'error';
const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function enabled(level: Level): boolean {
  return ORDER[level] >= ORDER[env.LOG_LEVEL];
}

/** 结构化 JSON 日志（便于生产采集/检索）。 */
function emit(level: Level, msg: string, meta?: Record<string, unknown>): void {
  if (!enabled(level)) return;
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    msg,
    ...(meta ?? {}),
  });
  // eslint-disable-next-line no-console
  (level === 'error' ? console.error : level === 'warn' ? console.warn : console.log)(line);
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => emit('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => emit('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => emit('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => emit('error', msg, meta),
};
