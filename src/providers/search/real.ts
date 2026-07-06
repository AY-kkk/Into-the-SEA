import { env } from '@/lib/env';
import type { SearchOptions, SearchProvider, SearchResult } from '../types';

/**
 * 真实搜索 provider 骨架（Bing / SerpAPI / Tavily / Firecrawl / Exa）。
 * 通过 SEARCH_ENDPOINT + SEARCH_API_KEY 接入。结果必须保留 url（source_url）。
 */
export class RealSearchProvider implements SearchProvider {
  readonly name = 'real-search';

  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    // TODO(real): 接入真实搜索 API。示例（Tavily）：
    //   const res = await fetch(`${env.SEARCH_ENDPOINT}`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ api_key: env.SEARCH_API_KEY, query, max_results: options?.limit ?? 5 }),
    //   });
    //   const data = await res.json();
    //   return data.results.map((r) => ({ title: r.title, url: r.url, snippet: r.content }));
    if (!env.SEARCH_API_KEY || !env.SEARCH_ENDPOINT) {
      throw new Error('[RealSearchProvider] 缺少 SEARCH_API_KEY / SEARCH_ENDPOINT 配置');
    }
    void query;
    void options;
    throw new Error('[RealSearchProvider] 尚未实现真实搜索接入（TODO）');
  }
}
