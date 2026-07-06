import { describe, expect, it } from 'vitest';
import { computeStats } from './practice-stats';
import { getAllQuestions } from '@/services/question.service';
import type { AnswerRecord, WrongQuestion } from '@/types/question';

describe('computeStats', () => {
  it('computes accuracy and active wrong count', () => {
    const [q1, q2] = getAllQuestions();
    const records: AnswerRecord[] = [
      { questionId: q1!.id, selected: 'A', correct: true, answeredAt: '2025-01-01' },
      { questionId: q2!.id, selected: 'B', correct: false, answeredAt: '2025-01-02' },
    ];
    const wrongBook: WrongQuestion[] = [
      { questionId: q2!.id, wrongCount: 1, lastWrongAt: '2025-01-02', mastered: false },
    ];
    const stats = computeStats(records, wrongBook);
    expect(stats.answered).toBe(2);
    expect(stats.correct).toBe(1);
    expect(stats.accuracy).toBe(50);
    expect(stats.activeWrong).toBe(1);
  });

  it('handles empty input', () => {
    const stats = computeStats([], []);
    expect(stats.accuracy).toBe(0);
    expect(stats.answered).toBe(0);
  });
});
