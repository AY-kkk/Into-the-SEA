import type { SearchOptions, SearchProvider, SearchResult } from '../types';

/**
 * Mock 搜索 provider：返回可预测的结构化结果，携带 source url。
 * 用于无外部搜索 Key 时演示与开发。
 */
export class MockSearchProvider implements SearchProvider {
  readonly name = 'mock-search';

  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    const limit = options?.limit ?? 5;
    const base: SearchResult[] = [
      {
        title: `「${query}」备考资料与真题解析`,
        url: 'http://www.scs.gov.cn/',
        snippet: `围绕「${query}」整理的高频考点、命题趋势与练习建议（示例数据）。`,
        publishedAt: '2025-01-10',
      },
      {
        title: `「${query}」历年真题汇编`,
        url: 'http://www.gov.cn/',
        snippet: `收录近年与「${query}」相关的真题及参考答案（示例数据）。`,
        publishedAt: '2024-11-02',
      },
      {
        title: `「${query}」能力模型与面试问题`,
        url: 'https://www.12371.gov.cn/',
        snippet: `从岗位胜任力角度拆解「${query}」，附常见面试追问（示例数据）。`,
        publishedAt: '2024-09-20',
      },
    ];
    return base.slice(0, limit);
  }
}
