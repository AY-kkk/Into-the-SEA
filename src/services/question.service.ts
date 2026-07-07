import { questionSeed } from '@/lib/db/seed-data';
import type { PracticeMode, Question, QuestionType } from '@/types/question';

/**
 * 行测题库业务服务。
 * MVP：从 seed 读取（无数据库）；真实接入时可替换为 Prisma 查询。
 * 业务逻辑集中于此，不写进组件（GOAL.md 铁律）。
 */

/** 单次练习集默认题量 / 上限（题库规模化后避免整库下发）。 */
export const DEFAULT_SET_SIZE = 20;
export const MAX_SET_SIZE = 50;
export const MOCK_SET_SIZE = 25;

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
 * 根据模式构建练习题序列。
 * - sequential：按 seed 顺序
 * - random：随机打乱
 * - topic：按题型过滤
 * - mock：随机抽取固定题量的套卷
 * - wrong：错题重练（依据传入的错题 id）
 */
export function buildPracticeSet(params: BuildSessionParams): Question[] {
  const { mode, type, count, wrongIds } = params;
  const all = getAllQuestions();

  // 单次练习集上限，避免把整个题库（可达数千题）一次性下发到客户端。
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

/** 各题型题量统计（供专项模式与 Dashboard）。 */
export function getTypeCounts(): Record<QuestionType, number> {
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
