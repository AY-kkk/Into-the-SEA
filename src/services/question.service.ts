import { questionSeed } from '@/lib/db/seed-data';
import { shouldUseDb } from '@/lib/env';
import {
  dbFirstQuestions,
  dbGetQuestionsByIds,
  dbGetTypeCounts,
  dbSampleQuestions,
} from '@/lib/db/repository';
import type { PracticeMode, Question, QuestionType } from '@/types/question';

/**
 * 行测题库业务服务。
 * 数据来源：DATA_SOURCE=db 时走 Prisma（题库规模化后仅按需取题）；否则读 seed JSON。
 * 业务逻辑集中于此，不写进组件（GOAL.md 铁律）。
 */

/** 单次练习集默认题量 / 上限（题库规模化后避免整库下发）。 */
export const DEFAULT_SET_SIZE = 20;
export const MAX_SET_SIZE = 50;
export const MOCK_SET_SIZE = 25;

// ── seed 同步访问（mock / 测试用）──
export function getAllQuestions(): Question[] {
  return [...questionSeed];
}

export function getQuestionById(id: string): Question | undefined {
  return questionSeed.find((q) => q.id === id);
}

export function getQuestionsByIds(ids: string[]): Question[] {
  const map = new Map(questionSeed.map((q) => [q.id, q]));
  return ids.map((id) => map.get(id)).filter((q): q is Question => Boolean(q));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export interface BuildSessionParams {
  mode: PracticeMode;
  /** 专项模式的题型。 */
  type?: QuestionType;
  /** 模拟套卷题量上限。 */
  count?: number;
  /** 错题重练：错题 id 列表。 */
  wrongIds?: string[];
}

/**
 * 从 seed 构建练习序列（同步，供测试与 mock）。
 */
export function buildPracticeSet(params: BuildSessionParams): Question[] {
  const { mode, type, count, wrongIds } = params;
  const all = getAllQuestions();
  const limit = Math.min(count ?? DEFAULT_SET_SIZE, MAX_SET_SIZE);

  switch (mode) {
    case 'sequential':
      return all.slice(0, limit);
    case 'random':
      return shuffle(all).slice(0, limit);
    case 'topic': {
      const pool = type ? all.filter((q) => q.type === type) : all;
      return shuffle(pool).slice(0, limit);
    }
    case 'mock': {
      const size = Math.min(count ?? MOCK_SET_SIZE, all.length);
      return shuffle(all).slice(0, size);
    }
    case 'wrong':
      return getQuestionsByIds(wrongIds ?? []);
    default:
      return all.slice(0, limit);
  }
}

/**
 * 构建练习序列（异步，供 API route）。DATA_SOURCE=db 时按需从数据库取题，
 * 避免整库进入内存 / 客户端；否则回退 seed。
 */
export async function buildPracticeSetAsync(params: BuildSessionParams): Promise<Question[]> {
  if (!shouldUseDb()) return buildPracticeSet(params);

  const { mode, type, count, wrongIds } = params;
  const limit = Math.min(count ?? DEFAULT_SET_SIZE, MAX_SET_SIZE);

  switch (mode) {
    case 'sequential':
      return dbFirstQuestions(undefined, limit);
    case 'random':
      return dbSampleQuestions(undefined, limit);
    case 'topic':
      return dbSampleQuestions(type, limit);
    case 'mock':
      return dbSampleQuestions(undefined, Math.min(count ?? MOCK_SET_SIZE, MAX_SET_SIZE));
    case 'wrong':
      return dbGetQuestionsByIds(wrongIds ?? []);
    default:
      return dbFirstQuestions(undefined, limit);
  }
}

/** 各题型题量统计（供专项模式与 Dashboard）。 */
export async function getTypeCounts(): Promise<Record<QuestionType, number>> {
  if (shouldUseDb()) return dbGetTypeCounts();
  const counts = {
    verbal: 0,
    quantitative: 0,
    judgment: 0,
    'data-analysis': 0,
    'common-sense': 0,
  } as Record<QuestionType, number>;
  for (const q of questionSeed) counts[q.type] += 1;
  return counts;
}
