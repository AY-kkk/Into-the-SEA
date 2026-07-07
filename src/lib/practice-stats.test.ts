import { describe, expect, it } from 'vitest';
import { computeStats } from './practice-stats';
import type { AnswerRecord, WrongQuestion } from '@/types/question';

describe('computeStats', () => {
  it('computes accuracy, per-type buckets and active wrong count', () => {
    const records: AnswerRecord[] = [
      { questionId: 'q1', selected: 'A', correct: true, answeredAt: '2025-01-01', type: 'verbal' },
      {
        questionId: 'q2',
        selected: 'B',
        correct: false,
        answeredAt: '2025-01-02',
        type: 'quantitative',
      },
    ];
    const wrongBook: WrongQuestion[] = [
      { questionId: 'q2', wrongCount: 1, lastWrongAt: '2025-01-02', mastered: false },
    ];
    const stats = computeStats(records, wrongBook);
    expect(stats.answered).toBe(2);
    expect(stats.correct).toBe(1);
    expect(stats.accuracy).toBe(50);
    expect(stats.activeWrong).toBe(1);
    expect(stats.accuracyByType.verbal).toEqual({ total: 1, correct: 1 });
    expect(stats.accuracyByType.quantitative).toEqual({ total: 1, correct: 0 });
  });

  it('ignores mastered wrong entries in active count', () => {
    const wrongBook: WrongQuestion[] = [
      { questionId: 'q2', wrongCount: 1, lastWrongAt: '2025-01-02', mastered: true },
    ];
    expect(computeStats([], wrongBook).activeWrong).toBe(0);
  });

  it('handles empty input', () => {
    const stats = computeStats([], []);
    expect(stats.accuracy).toBe(0);
    expect(stats.answered).toBe(0);
  });
});
