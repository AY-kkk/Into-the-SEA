import { env } from '@/lib/env';

/**
 * 轻量 Sentry 上报（无 SDK 依赖）：解析 DSN，按 Sentry Envelope 协议 POST 事件。
 * 适用于 Node/Edge 运行时（仅用 fetch）。缺 DSN 时不启用。
 *
 * DSN 形如：https://<publicKey>@<host>/<projectId>
 * 上报地址：https://<host>/api/<projectId>/envelope/?sentry_key=<publicKey>&sentry_version=7
 */
export interface ParsedDsn {
  publicKey: string;
  host: string;
  projectId: string;
  protocol: string;
  envelopeUrl: string;
}

export function parseDsn(dsn: string): ParsedDsn | null {
  try {
    const u = new URL(dsn);
    const publicKey = u.username;
    const projectId = u.pathname.replace(/^\//, '');
    if (!publicKey || !projectId) return null;
    const host = u.host;
    const protocol = u.protocol.replace(':', '');
    const envelopeUrl = `${protocol}://${host}/api/${projectId}/envelope/?sentry_key=${publicKey}&sentry_version=7`;
    return { publicKey, host, projectId, protocol, envelopeUrl };
  } catch {
    return null;
  }
}

interface SentryEvent {
  message: string;
  level: 'error' | 'warning' | 'info';
  stack?: string;
  extra?: Record<string, unknown>;
  timestamp: number;
  platform: 'node';
  environment: string;
}

/** 构建 Sentry envelope 正文（NDJSON：header\n item-header\n item-payload）。 */
export function buildEnvelope(event: SentryEvent, eventId: string): string {
  const header = JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString() });
  const itemHeader = JSON.stringify({ type: 'event' });
  const payload = JSON.stringify({
    event_id: eventId,
    timestamp: event.timestamp,
    platform: event.platform,
    level: event.level,
    environment: event.environment,
    message: { formatted: event.message },
    ...(event.stack
      ? {
          exception: {
            values: [{ type: 'Error', value: event.message, stacktrace: { frames: [] } }],
          },
        }
      : {}),
    extra: { ...(event.extra ?? {}), stack: event.stack },
  });
  return `${header}\n${itemHeader}\n${payload}`;
}

function randomHex(len: number): string {
  let out = '';
  for (let i = 0; i < len; i++) out += Math.floor(Math.random() * 16).toString(16);
  return out;
}

/** 上报错误到 Sentry（fire-and-forget）。缺 DSN 或解析失败返回 false。 */
export async function sendToSentry(
  message: string,
  opts?: { stack?: string; extra?: Record<string, unknown>; level?: 'error' | 'warning' | 'info' },
): Promise<boolean> {
  const dsn = env.SENTRY_DSN;
  if (!dsn) return false;
  const parsed = parseDsn(dsn);
  if (!parsed) return false;

  const eventId = randomHex(32);
  const envelope = buildEnvelope(
    {
      message,
      level: opts?.level ?? 'error',
      stack: opts?.stack,
      extra: opts?.extra,
      timestamp: Date.now() / 1000,
      platform: 'node',
      environment: env.NODE_ENV,
    },
    eventId,
  );

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(parsed.envelopeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-sentry-envelope' },
      body: envelope,
      signal: controller.signal,
    });
    clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}
