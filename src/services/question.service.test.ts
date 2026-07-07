import { describe, expect, it } from 'vitest';
import {
  buildPracticeSet,
  DEFAULT_SET_SIZE,
  getAllQuestions,
  getQuestionsByIds,
  getTypeCounts,
  MAX_SET_SIZE,
} from './question.service';

describe('question.service', () => {
  it('sequential caps at default set size (avoids shipping full bank)', () => {
    const set = buildPracticeSet({ mode: 'sequential' });
    expect(set.length).toBe(Math.min(DEFAULT_SET_SIZE, getAllQuestions().length));
  });

  it('respects requested count up to MAX_SET_SIZE', () => {
    expect(buildPracticeSet({ mode: 'random', count: 5 }).length).toBe(5);
    expect(buildPracticeSet({ mode: 'random', count: 999 }).length).toBe(MAX_SET_SIZE);
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

  it('type counts sum to total (seed source)', async () => {
    const counts = await getTypeCounts();
    const sum = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(sum).toBe(getAllQuestions().length);
  });
});
