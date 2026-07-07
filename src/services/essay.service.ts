import { essayCaseSeed, essayOriginalSeed } from '@/lib/db/seed-data';
import { shouldUseDb } from '@/lib/env';
import { dbListEssayCases, dbListEssayOriginals } from '@/lib/db/repository';
import type { EssayCase, EssayOriginal, EssayTopic } from '@/types/essay';
import type { ExamCategory } from '@/types/common';

/**
 * 申论案例 / 原题业务服务。
 * MVP：从 seed 读取；真实接入替换为 Prisma。业务逻辑集中，不入组件。
 */

export interface CaseFilter {
  topic?: EssayTopic;
  keyword?: string;
  limit?: number;
  offset?: number;
}

export interface OriginalFilter {
  topic?: EssayTopic;
  category?: ExamCategory;
  year?: number;
  keyword?: string;
  limit?: number;
  offset?: number;
}

export const DEFAULT_ESSAY_PAGE = 24;

/** 分页结果（含总数，供「加载更多」）。 */
export interface Paged<T> {
  items: T[];
  total: number;
}

export function listEssayCases(filter: CaseFilter = {}): Paged<EssayCase> {
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
  const total = items.length;
  const offset = filter.offset ?? 0;
  const limit = filter.limit ?? DEFAULT_ESSAY_PAGE;
  return { items: items.slice(offset, offset + limit), total };
}

export function listEssayOriginals(filter: OriginalFilter = {}): Paged<EssayOriginal> {
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
  items.sort((a, b) => b.year - a.year);
  const total = items.length;
  const offset = filter.offset ?? 0;
  const limit = filter.limit ?? DEFAULT_ESSAY_PAGE;
  return { items: items.slice(offset, offset + limit), total };
}

/** 原题库可选年份（供筛选）。 */
export function getOriginalYears(): number[] {
  return [...new Set(essayOriginalSeed.map((o) => o.year))].sort((a, b) => b - a);
}

/** Dashboard 推荐：随机/最新若干案例。 */
export function getRecommendedCases(limit = 3): EssayCase[] {
  return essayCaseSeed.slice(0, limit);
}

/**
 * 异步案例列表：DATA_SOURCE=db 时走数据库分页查询，否则回退 seed。
 * 供 API route / SSR 页面使用。
 */
export async function listEssayCasesAsync(filter: CaseFilter = {}): Promise<Paged<EssayCase>> {
  if (shouldUseDb()) return dbListEssayCases(filter);
  return listEssayCases(filter);
}

export async function listEssayOriginalsAsync(
  filter: OriginalFilter = {},
): Promise<Paged<EssayOriginal>> {
  if (shouldUseDb()) return dbListEssayOriginals(filter);
  return listEssayOriginals(filter);
}
