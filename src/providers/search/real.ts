import { env } from '@/lib/env';
import { logger } from '@/lib/observability/logger';
import type { SearchOptions, SearchProvider, SearchResult } from '../types';

/**
 * 真实搜索 provider：支持 Tavily / Bing / 通用 JSON 三类厂商。
 * 通过 SEARCH_ENDPOINT + SEARCH_API_KEY + SEARCH_PROVIDER_KIND 配置。
 * 结果统一归一化为 SearchResult（保留 url = source_url，红线）。
 *
 * 容错：请求超时（8s）与非 2xx 抛出可读错误，供上层降级；解析对缺字段做兜底。
 */
export class RealSearchProvider implements SearchProvider {
  readonly name = 'real-search';

  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    if (!env.SEARCH_API_KEY) {
      throw new Error('[RealSearchProvider] 缺少 SEARCH_API_KEY 配置');
    }
    const limit = options?.limit ?? 5;
    const kind = env.SEARCH_PROVIDER_KIND;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      switch (kind) {
        case 'tavily':
          return await this.tavily(query, limit, controller.signal);
        case 'bing':
          return await this.bing(query, limit, controller.signal);
        default:
          return await this.generic(query, limit, controller.signal);
      }
    } catch (error) {
      logger.error('search_provider_failed', {
        kind,
        message: error instanceof Error ? error.message : String(error),
      });
      throw error instanceof Error ? error : new Error('搜索请求失败');
    } finally {
      clearTimeout(timeout);
    }
  }

  /** Tavily：POST，body 带 api_key + query。 */
  private async tavily(query: string, limit: number, signal: AbortSignal): Promise<SearchResult[]> {
    const endpoint = env.SEARCH_ENDPOINT || 'https://api.tavily.com/search';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: env.SEARCH_API_KEY,
        query,
        max_results: limit,
        search_depth: 'basic',
      }),
      signal,
    });
    if (!res.ok) throw new Error(`[Tavily] ${res.status} ${res.statusText}`);
    const data = (await res.json()) as {
      results?: Array<{ title?: string; url?: string; content?: string; published_date?: string }>;
    };
    return (data.results ?? [])
      .filter((r) => r.url)
      .slice(0, limit)
      .map((r) => ({
        title: r.title ?? r.url ?? '(无标题)',
        url: r.url as string,
        snippet: r.content ?? '',
        publishedAt: r.published_date,
      }));
  }

  /** Bing Web Search：GET，Ocp-Apim-Subscription-Key 头。 */
  private async bing(query: string, limit: number, signal: AbortSignal): Promise<SearchResult[]> {
    const base = env.SEARCH_ENDPOINT || 'https://api.bing.microsoft.com/v7.0/search';
    const url = `${base}?q=${encodeURIComponent(query)}&count=${limit}`;
    const res = await fetch(url, {
      headers: { 'Ocp-Apim-Subscription-Key': env.SEARCH_API_KEY as string },
      signal,
    });
    if (!res.ok) throw new Error(`[Bing] ${res.status} ${res.statusText}`);
    const data = (await res.json()) as {
      webPages?: {
        value?: Array<{ name?: string; url?: string; snippet?: string; datePublished?: string }>;
      };
    };
    return (data.webPages?.value ?? [])
      .filter((r) => r.url)
      .slice(0, limit)
      .map((r) => ({
        title: r.name ?? r.url ?? '(无标题)',
        url: r.url as string,
        snippet: r.snippet ?? '',
        publishedAt: r.datePublished,
      }));
  }

  /** 通用 JSON：GET endpoint?q=...，期望 { results:[{title,url,snippet,publishedAt}] }。 */
  private async generic(
    query: string,
    limit: number,
    signal: AbortSignal,
  ): Promise<SearchResult[]> {
    if (!env.SEARCH_ENDPOINT)
      throw new Error('[RealSearchProvider] generic 模式需 SEARCH_ENDPOINT');
    const sep = env.SEARCH_ENDPOINT.includes('?') ? '&' : '?';
    const url = `${env.SEARCH_ENDPOINT}${sep}q=${encodeURIComponent(query)}&limit=${limit}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${env.SEARCH_API_KEY}` },
      signal,
    });
    if (!res.ok) throw new Error(`[Search] ${res.status} ${res.statusText}`);
    const data = (await res.json()) as {
      results?: Array<{ title?: string; url?: string; snippet?: string; publishedAt?: string }>;
    };
    return (data.results ?? [])
      .filter((r) => r.url)
      .slice(0, limit)
      .map((r) => ({
        title: r.title ?? r.url ?? '(无标题)',
        url: r.url as string,
        snippet: r.snippet ?? '',
        publishedAt: r.publishedAt,
      }));
  }
}
