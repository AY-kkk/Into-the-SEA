/**
 * 数据库读取仓储层（Prisma）。
 * 仅在 DATA_SOURCE=db 且配置 DATABASE_URL 时使用；否则服务层读 seed JSON。
 * 将 Prisma 行映射为前端 TS 类型（日期→ISO 字符串，枚举保持字符串联合）。
 * 业务筛选/分页尽量下推到数据库（where/skip/take），避免全表加载。
 */
import { prisma } from './prisma';
import type { ExamInfo, ExamInfoFilter } from '@/types/exam';
import type { Question, QuestionType } from '@/types/question';
import type { EssayCase, EssayOriginal } from '@/types/essay';
import type { CaseFilter, OriginalFilter } from '@/services/essay.service';
import type { EducationLevel, EnrollStatus, ExamCategory } from '@/types/common';
import type { QuestionOption, Difficulty } from '@/types/question';
import type { EssayTopic, EssayQuestionType } from '@/types/essay';

const iso = (d: Date | null | undefined): string | undefined => (d ? d.toISOString() : undefined);

// ── 招录情报 ──
export async function dbListExamInfo(
  filter: ExamInfoFilter = {},
  limit?: number,
): Promise<ExamInfo[]> {
  const rows = await prisma.examInfo.findMany({
    where: {
      ...(filter.category ? { category: filter.category } : {}),
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.education ? { education: filter.education } : {}),
      ...(filter.region ? { region: { contains: filter.region } } : {}),
      ...(filter.keyword
        ? {
            OR: [
              { title: { contains: filter.keyword, mode: 'insensitive' } },
              { organization: { contains: filter.keyword, mode: 'insensitive' } },
              { summary: { contains: filter.keyword, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { enrollStart: 'desc' },
    ...(limit ? { take: limit } : {}),
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category as ExamCategory,
    region: r.region,
    organization: r.organization,
    enrollStart: r.enrollStart.toISOString(),
    enrollEnd: r.enrollEnd.toISOString(),
    examDate: iso(r.examDate),
    status: r.status as EnrollStatus,
    headcount: r.headcount,
    education: r.education as EducationLevel,
    majors: r.majors,
    summary: r.summary,
    tags: r.tags,
    sourceUrl: r.sourceUrl,
    sourceName: r.sourceName ?? undefined,
    publishedAt: iso(r.publishedAt),
  }));
}

// ── 行测题目 ──
function mapQuestion(r: {
  id: string;
  type: string;
  difficulty: string;
  stem: string;
  options: unknown;
  answer: string;
  explanation: string;
  tags: string[];
  sourceUrl: string | null;
  sourceName: string | null;
}): Question {
  return {
    id: r.id,
    type: r.type as QuestionType,
    difficulty: r.difficulty as Difficulty,
    stem: r.stem,
    options: r.options as QuestionOption[],
    answer: r.answer,
    explanation: r.explanation,
    tags: r.tags,
    sourceUrl: r.sourceUrl ?? undefined,
    sourceName: r.sourceName ?? undefined,
  };
}

export async function dbGetTypeCounts(): Promise<Record<QuestionType, number>> {
  const grouped = await prisma.question.groupBy({ by: ['type'], _count: { _all: true } });
  const counts = {
    verbal: 0,
    quantitative: 0,
    judgment: 0,
    'data-analysis': 0,
    'common-sense': 0,
  } as Record<QuestionType, number>;
  for (const g of grouped) {
    if (g.type in counts) counts[g.type as QuestionType] = g._count._all;
  }
  return counts;
}

export async function dbGetQuestionsByIds(ids: string[]): Promise<Question[]> {
  if (ids.length === 0) return [];
  const rows = await prisma.question.findMany({ where: { id: { in: ids } } });
  const map = new Map(rows.map((r) => [r.id, mapQuestion(r)]));
  return ids.map((id) => map.get(id)).filter((q): q is Question => Boolean(q));
}

/** 随机抽样（数据库层）。PostgreSQL 用 ORDER BY random()。 */
export async function dbSampleQuestions(
  type: QuestionType | undefined,
  take: number,
): Promise<Question[]> {
  const where = type ? `WHERE "type" = $1` : '';
  const params = type ? [type, take] : [take];
  const sql = `SELECT id, type, difficulty, stem, options, answer, explanation, tags, "sourceUrl", "sourceName"
    FROM "Question" ${where} ORDER BY random() LIMIT $${type ? 2 : 1}`;
  const rows = await prisma.$queryRawUnsafe<Parameters<typeof mapQuestion>[0][]>(sql, ...params);
  return rows.map(mapQuestion);
}

export async function dbFirstQuestions(
  type: QuestionType | undefined,
  take: number,
): Promise<Question[]> {
  const rows = await prisma.question.findMany({
    where: type ? { type } : {},
    take,
    orderBy: { createdAt: 'asc' },
  });
  return rows.map(mapQuestion);
}

// ── 申论案例 ──
export async function dbListEssayCases(
  filter: CaseFilter = {},
): Promise<{ items: EssayCase[]; total: number }> {
  const where = {
    ...(filter.topic ? { topics: { has: filter.topic } } : {}),
    ...(filter.keyword
      ? {
          OR: [
            { title: { contains: filter.keyword, mode: 'insensitive' as const } },
            { summary: { contains: filter.keyword, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.essayCase.findMany({
      where,
      skip: filter.offset ?? 0,
      take: filter.limit ?? 24,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.essayCase.count({ where }),
  ]);
  return {
    items: rows.map((r) => ({
      id: r.id,
      title: r.title,
      topics: r.topics as EssayTopic[],
      applicableTopics: r.applicableTopics,
      summary: r.summary,
      transferableExpressions: r.transferableExpressions,
      usageScenarios: r.usageScenarios,
      sourceUrl: r.sourceUrl,
      sourceName: r.sourceName ?? undefined,
      publishedAt: iso(r.publishedAt),
    })),
    total,
  };
}

export async function dbListEssayOriginals(
  filter: OriginalFilter = {},
): Promise<{ items: EssayOriginal[]; total: number }> {
  const where = {
    ...(filter.topic ? { topics: { has: filter.topic } } : {}),
    ...(filter.category ? { category: filter.category } : {}),
    ...(filter.year ? { year: filter.year } : {}),
    ...(filter.keyword
      ? {
          OR: [
            { prompt: { contains: filter.keyword, mode: 'insensitive' as const } },
            { materialSummary: { contains: filter.keyword, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.essayOriginal.findMany({
      where,
      skip: filter.offset ?? 0,
      take: filter.limit ?? 24,
      orderBy: { year: 'desc' },
    }),
    prisma.essayOriginal.count({ where }),
  ]);
  return {
    items: rows.map((r) => ({
      id: r.id,
      year: r.year,
      category: r.category as ExamCategory,
      region: r.region,
      questionType: r.questionType as EssayQuestionType,
      prompt: r.prompt,
      materialSummary: r.materialSummary,
      topics: r.topics as EssayTopic[],
      sourceUrl: r.sourceUrl,
      sourceName: r.sourceName ?? undefined,
      publishedAt: iso(r.publishedAt),
    })),
    total,
  };
}
