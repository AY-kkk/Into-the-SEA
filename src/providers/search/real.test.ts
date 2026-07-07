import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// 通过环境变量控制厂商类型与凭据，动态导入以读取最新 env。
async function load() {
  vi.resetModules();
  const mod = await import('./real');
  return new mod.RealSearchProvider();
}

const origEnv = { ...process.env };

beforeEach(() => {
  process.env.SEARCH_API_KEY = 'test-key';
});
afterEach(() => {
  process.env = { ...origEnv };
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('RealSearchProvider', () => {
  it('throws without API key', async () => {
    delete process.env.SEARCH_API_KEY;
    const p = await load();
    await expect(p.search('公务员')).rejects.toThrow(/SEARCH_API_KEY/);
  });

  it('parses Tavily response and preserves url (source_url)', async () => {
    process.env.SEARCH_PROVIDER_KIND = 'tavily';
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              results: [
                {
                  title: 'T1',
                  url: 'https://a.gov.cn/1',
                  content: 'snip1',
                  published_date: '2025-01-01',
                },
                { title: 'T2', url: 'https://b.gov.cn/2', content: 'snip2' },
                { title: 'NoUrl', content: 'ignored' },
              ],
            }),
            { status: 200 },
          ),
      ),
    );
    const p = await load();
    const results = await p.search('省考', { limit: 5 });
    expect(results).toHaveLength(2); // 无 url 的被过滤
    expect(results[0]).toMatchObject({ title: 'T1', url: 'https://a.gov.cn/1', snippet: 'snip1' });
    expect(results.every((r) => r.url.startsWith('http'))).toBe(true);
  });

  it('parses Bing response', async () => {
    process.env.SEARCH_PROVIDER_KIND = 'bing';
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              webPages: { value: [{ name: 'B1', url: 'https://x.gov.cn', snippet: 's' }] },
            }),
            { status: 200 },
          ),
      ),
    );
    const p = await load();
    const results = await p.search('国考');
    expect(results[0]).toMatchObject({ title: 'B1', url: 'https://x.gov.cn' });
  });

  it('throws on non-2xx (fail-safe for upstream degrade)', async () => {
    process.env.SEARCH_PROVIDER_KIND = 'tavily';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('err', { status: 500 })),
    );
    const p = await load();
    await expect(p.search('x')).rejects.toThrow();
  });

  it('generic mode requires endpoint', async () => {
    process.env.SEARCH_PROVIDER_KIND = 'generic';
    delete process.env.SEARCH_ENDPOINT;
    const p = await load();
    await expect(p.search('x')).rejects.toThrow(/SEARCH_ENDPOINT/);
  });
});
