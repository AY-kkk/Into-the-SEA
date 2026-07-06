import { createId } from '@/lib/utils';
import type { QuestionSearchResult } from '@/types/job';
import type { QuestionSearchProvider, SearchOptions } from '../types';

/**
 * Mock 题库联网搜索 provider：返回带 source_url 的结构化题目线索。
 * 真实实现见 real.ts（联网检索题库）。
 */
export class MockQuestionSearchProvider implements QuestionSearchProvider {
  readonly name = 'mock-question-search';

  async searchQuestions(query: string, options?: SearchOptions): Promise<QuestionSearchResult[]> {
    const limit = options?.limit ?? 4;
    const templates: Array<Omit<QuestionSearchResult, 'id'>> = [
      {
        title: `「${query}」笔试高频题型精讲`,
        snippet: `涵盖「${query}」岗位常考的行测/专业知识题型分布与命题趋势（示例）。`,
        sourceUrl: 'http://www.scs.gov.cn/',
        sourceName: '示例来源·公务员局',
      },
      {
        title: `「${query}」结构化面试真题合集`,
        snippet: `整理「${query}」方向的结构化面试真题及答题框架（示例）。`,
        sourceUrl: 'http://www.gov.cn/',
        sourceName: '示例来源·政府网',
      },
      {
        title: `「${query}」岗位能力模型解读`,
        snippet: `从胜任力维度拆解「${query}」的核心能力要求（示例）。`,
        sourceUrl: 'https://www.12371.gov.cn/',
        sourceName: '示例来源·共产党员网',
      },
      {
        title: `「${query}」备考路径与资料清单`,
        snippet: `给出「${query}」从入门到冲刺的阶段性练习计划（示例）。`,
        sourceUrl: 'http://www.mohrss.gov.cn/',
        sourceName: '示例来源·人社部',
      },
    ];
    return templates.slice(0, limit).map((t) => ({ ...t, id: createId('qs') }));
  }
}
