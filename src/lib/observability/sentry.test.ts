import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildEnvelope, parseDsn } from './sentry';

const origEnv = { ...process.env };
afterEach(() => {
  process.env = { ...origEnv };
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('parseDsn', () => {
  it('parses a valid DSN into envelope url', () => {
    const p = parseDsn('https://abc123@o1.ingest.sentry.io/456');
    expect(p).not.toBeNull();
    expect(p!.publicKey).toBe('abc123');
    expect(p!.projectId).toBe('456');
    expect(p!.envelopeUrl).toContain('/api/456/envelope/');
    expect(p!.envelopeUrl).toContain('sentry_key=abc123');
  });

  it('returns null for malformed DSN', () => {
    expect(parseDsn('not-a-url')).toBeNull();
    expect(parseDsn('https://host/only')).toBeNull(); // 无 public key
  });
});

describe('buildEnvelope', () => {
  it('produces 3-line NDJSON envelope with event id', () => {
    const env = buildEnvelope(
      {
        message: 'boom',
        level: 'error',
        stack: 'at x',
        timestamp: 1700000000,
        platform: 'node',
        environment: 'test',
      },
      'deadbeef',
    );
    const lines = env.split('\n');
    expect(lines).toHaveLength(3);
    expect(JSON.parse(lines[0]!).event_id).toBe('deadbeef');
    expect(JSON.parse(lines[1]!).type).toBe('event');
    const payload = JSON.parse(lines[2]!);
    expect(payload.message.formatted).toBe('boom');
    expect(payload.level).toBe('error');
    expect(payload.exception).toBeTruthy();
  });
});

describe('sendToSentry', () => {
  it('returns false when DSN not configured', async () => {
    delete process.env.SENTRY_DSN;
    vi.resetModules();
    const { sendToSentry } = await import('./sentry');
    expect(await sendToSentry('msg')).toBe(false);
  });

  it('POSTs envelope when DSN configured', async () => {
    process.env.SENTRY_DSN = 'https://key@example.ingest.sentry.io/9';
    vi.resetModules();
    const fetchMock = vi.fn(async () => new Response('', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const { sendToSentry } = await import('./sentry');
    const ok = await sendToSentry('boom', { stack: 'at y', extra: { a: 1 } });
    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
    const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(String(call[0])).toContain('/api/9/envelope/');
    expect(call[1].method).toBe('POST');
  });

  it('returns false when transport throws', async () => {
    process.env.SENTRY_DSN = 'https://key@example.ingest.sentry.io/9';
    vi.resetModules();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network');
      }),
    );
    const { sendToSentry } = await import('./sentry');
    expect(await sendToSentry('boom')).toBe(false);
  });
});
