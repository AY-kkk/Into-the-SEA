import { essayCaseSeed, essayOriginalSeed } from '@/lib/db/seed-data';
import type { EssayCase, EssayOriginal, EssayTopic } from '@/types/essay';
import type { ExamCategory } from '@/types/common';

/**
 * 申论案例 / 原题业务服务。
 * MVP：从 seed 读取；真实接入替换为 Prisma。业务逻辑集中，不入组件。
 */

export interface CaseFilter {
  topic?: EssayTopic;
  keyword?: string;
}

export interface OriginalFilter {
  topic?: EssayTopic;
  category?: ExamCategory;
  year?: number;
  keyword?: string;
}

export function listEssayCases(filter: CaseFilter = {}): EssayCase[] {
  let items = [...essayCaseSeed];
  if (filter.topic) items = items.filter((c) => c.topics.includes(filter.topic!));
  if (filter.keyword) {
    const kw = filter.keyword.toLowerCase();
    items = items.filter(
      (c) =>
        c.title.toLowerCase().includes(kw) ||
        c.summary.toLowerCase().includes(kw) ||
        c.applicableTopics.some((t) => t.toLowerCase().includes(kw)),
    );
  }
  return items;
}

export function listEssayOriginals(filter: OriginalFilter = {}): EssayOriginal[] {
  let items = [...essayOriginalSeed];
  if (filter.topic) items = items.filter((o) => o.topics.includes(filter.topic!));
  if (filter.category) items = items.filter((o) => o.category === filter.category);
  if (filter.year) items = items.filter((o) => o.year === filter.year);
  if (filter.keyword) {
    const kw = filter.keyword.toLowerCase();
    items = items.filter(
      (o) => o.prompt.toLowerCase().includes(kw) || o.materialSummary.toLowerCase().includes(kw),
    );
  }
  return items.sort((a, b) => b.year - a.year);
}

/** 原题库可选年份（供筛选）。 */
export function getOriginalYears(): number[] {
  return [...new Set(essayOriginalSeed.map((o) => o.year))].sort((a, b) => b - a);
}

/** Dashboard 推荐：随机/最新若干案例。 */
export function getRecommendedCases(limit = 3): EssayCase[] {
  return essayCaseSeed.slice(0, limit);
}
