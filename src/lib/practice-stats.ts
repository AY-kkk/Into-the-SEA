import type { AnswerRecord, QuestionType, WrongQuestion } from '@/types/question';

export interface PracticeStats {
  answered: number;
  correct: number;
  accuracy: number;
  activeWrong: number;
  accuracyByType: Partial<Record<QuestionType, { total: number; correct: number }>>;
}

/** 从作答记录与错题本派生统计（供 Dashboard 与练习页复用）。 */
export function computeStats(records: AnswerRecord[], wrongBook: WrongQuestion[]): PracticeStats {
  const answered = records.length;
  const correct = records.filter((r) => r.correct).length;
  const accuracyByType: PracticeStats['accuracyByType'] = {};

  for (const r of records) {
    if (!r.type) continue;
    const bucket = accuracyByType[r.type] ?? { total: 0, correct: 0 };
    bucket.total += 1;
    if (r.correct) bucket.correct += 1;
    accuracyByType[r.type] = bucket;
  }

  return {
    answered,
    correct,
    accuracy: answered ? Math.round((correct / answered) * 100) : 0,
    activeWrong: wrongBook.filter((w) => !w.mastered).length,
    accuracyByType,
  };
}
