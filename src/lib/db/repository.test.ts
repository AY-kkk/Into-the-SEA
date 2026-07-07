import { beforeEach, describe, expect, it, vi } from 'vitest';

// 用内存 mock 替换 Prisma 单例，验证仓储映射与筛选下推逻辑（无需真实数据库）。
const findMany = vi.fn();
const count = vi.fn();
const groupBy = vi.fn();

vi.mock('./prisma', () => ({
  prisma: {
    examInfo: { findMany: (...a: unknown[]) => findMany('examInfo', ...a) },
    essayCase: {
      findMany: (...a: unknown[]) => findMany('essayCase', ...a),
      count: (...a: unknown[]) => count('essayCase', ...a),
    },
    question: { groupBy: (...a: unknown[]) => groupBy(...a) },
  },
}));

import { dbGetTypeCounts, dbListEssayCases, dbListExamInfo } from './repository';

beforeEach(() => {
  findMany.mockReset();
  count.mockReset();
  groupBy.mockReset();
});

describe('repository (Prisma mapping)', () => {
  it('maps ExamInfo rows to ISO strings and keeps sourceUrl', async () => {
    findMany.mockResolvedValueOnce([
      {
        id: 'e1',
        title: 't',
        category: 'national',
        region: '全国',
        organization: 'org',
        enrollStart: new Date('2025-01-01'),
        enrollEnd: new Date('2025-02-01'),
        examDate: null,
        status: 'open',
        headcount: 10,
        education: 'bachelor',
        majors: ['x'],
        summary: 's',
        tags: [],
        sourceUrl: 'https://example.gov.cn/',
        sourceName: '来源',
        publishedAt: null,
      },
    ]);
    const items = await dbListExamInfo({ category: 'national' }, 5);
    expect(items[0]!.enrollStart).toBe('2025-01-01T00:00:00.000Z');
    expect(items[0]!.sourceUrl).toMatch(/^https?:\/\//);
    // 筛选与 limit 下推到 where/take
    const [, args] = findMany.mock.calls[0]!;
    expect(args.where.category).toBe('national');
    expect(args.take).toBe(5);
  });

  it('paginates essay cases with skip/take and returns total', async () => {
    findMany.mockResolvedValueOnce([
      {
        id: 'c1',
        title: 'case',
        topics: ['economy'],
        applicableTopics: ['经济发展'],
        summary: 'sum',
        transferableExpressions: ['金句'],
        usageScenarios: ['大作文'],
        sourceUrl: 'https://gov.cn/',
        sourceName: '政府网',
        publishedAt: new Date('2024-06-01'),
      },
    ]);
    count.mockResolvedValueOnce(508);
    const page = await dbListEssayCases({ limit: 24, offset: 48 });
    expect(page.total).toBe(508);
    expect(page.items[0]!.sourceUrl).toMatch(/^https?:\/\//);
    const [, args] = findMany.mock.calls[0]!;
    expect(args.skip).toBe(48);
    expect(args.take).toBe(24);
  });

  it('aggregates type counts from groupBy', async () => {
    groupBy.mockResolvedValueOnce([
      { type: 'verbal', _count: { _all: 1200 } },
      { type: 'quantitative', _count: { _all: 2000 } },
    ]);
    const counts = await dbGetTypeCounts();
    expect(counts.verbal).toBe(1200);
    expect(counts.quantitative).toBe(2000);
    expect(counts.judgment).toBe(0);
  });
});
