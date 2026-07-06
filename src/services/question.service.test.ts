import { describe, expect, it } from 'vitest';
import {
  buildPracticeSet,
  getAllQuestions,
  getQuestionsByIds,
  getTypeCounts,
} from './question.service';

describe('question.service', () => {
  it('sequential returns all questions', () => {
    const set = buildPracticeSet({ mode: 'sequential' });
    expect(set.length).toBe(getAllQuestions().length);
  });

  it('topic filters by type', () => {
    const set = buildPracticeSet({ mode: 'topic', type: 'verbal' });
    expect(set.length).toBeGreaterThan(0);
    expect(set.every((q) => q.type === 'verbal')).toBe(true);
  });

  it('mock caps at requested count', () => {
    const set = buildPracticeSet({ mode: 'mock', count: 3 });
    expect(set.length).toBe(3);
  });

  it('wrong mode returns only requested ids', () => {
    const all = getAllQuestions();
    const ids = [all[0]!.id, all[1]!.id];
    const set = buildPracticeSet({ mode: 'wrong', wrongIds: ids });
    expect(set.map((q) => q.id).sort()).toEqual([...ids].sort());
  });

  it('getQuestionsByIds ignores unknown ids', () => {
    const set = getQuestionsByIds(['nope', getAllQuestions()[0]!.id]);
    expect(set.length).toBe(1);
  });

  it('type counts sum to total', () => {
    const counts = getTypeCounts();
    const sum = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(sum).toBe(getAllQuestions().length);
  });
});
