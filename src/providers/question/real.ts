import { getSearchProvider } from '../search';
import { createId } from '@/lib/utils';
import type { QuestionSearchResult } from '@/types/job';
import type { QuestionSearchProvider, SearchOptions } from '../types';

/**
 * 真实题库搜索 provider 骨架：复用通用 SearchProvider 联网检索，
 * 再归一化为 QuestionSearchResult（保留 sourceUrl）。
 */
export class RealQuestionSearchProvider implements QuestionSearchProvider {
  readonly name = 'real-question-search';

  async searchQuestions(query: string, options?: SearchOptions): Promise<QuestionSearchResult[]> {
    // TODO(real): 可加入题库站点定向检索与结构化解析。
    const search = getSearchProvider();
    const results = await search.search(`${query} 笔试 面试 真题`, options);
    return results.map((r) => ({
      id: createId('qs'),
      title: r.title,
      snippet: r.snippet,
      sourceUrl: r.url,
      publishedAt: r.publishedAt,
    }));
  }
}
