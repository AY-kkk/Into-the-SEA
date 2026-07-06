import { examInfoSeed } from '@/lib/db/seed-data';
import type { ExamInfo } from '@/types/exam';
import type { ExamInfoProvider, FetchOptions } from '../types';

/**
 * Mock 招录情报 provider：从 seed JSON 读取，支持基础筛选与去重。
 * 真实源不可用时的默认实现（GOAL.md 允许 mock 顶替）。
 */
export class MockExamInfoProvider implements ExamInfoProvider {
  readonly name = 'mock-exam-info';

  async fetchLatest(options?: FetchOptions): Promise<ExamInfo[]> {
    const filter = options?.filter;
    let items = [...examInfoSeed];

    if (filter?.category) items = items.filter((i) => i.category === filter.category);
    if (filter?.status) items = items.filter((i) => i.status === filter.status);
    if (filter?.education) items = items.filter((i) => i.education === filter.education);
    if (filter?.region) items = items.filter((i) => i.region.includes(filter.region!));
    if (filter?.keyword) {
      const kw = filter.keyword.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(kw) ||
          i.organization.toLowerCase().includes(kw) ||
          i.summary.toLowerCase().includes(kw),
      );
    }

    // 去重（按 id）+ 按报名开始时间倒序
    const dedup = new Map(items.map((i) => [i.id, i]));
    const result = [...dedup.values()].sort(
      (a, b) => new Date(b.enrollStart).getTime() - new Date(a.enrollStart).getTime(),
    );
    return options?.limit ? result.slice(0, options.limit) : result;
  }
}
