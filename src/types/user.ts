import type { QuestionType } from './question';

/** 用户学习进度（MVP：单用户本地态，后续可接入账号体系）。 */
export interface UserProgress {
  /** 累计答题数。 */
  answered: number;
  /** 累计正确数。 */
  correct: number;
  /** 错题数量。 */
  wrongCount: number;
  /** 按题型正确率。 */
  accuracyByType: Partial<Record<QuestionType, number>>;
  /** 连续打卡天数。 */
  streakDays: number;
  updatedAt: string;
}
