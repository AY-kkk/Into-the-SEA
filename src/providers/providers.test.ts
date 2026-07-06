import { describe, expect, it } from 'vitest';
import { MockExamInfoProvider } from './exam-info';
import { MockQuestionSearchProvider } from './question';
import { MockSearchProvider } from './search';
import { MockLLMProvider } from './llm';

describe('MockExamInfoProvider', () => {
  const provider = new MockExamInfoProvider();

  it('returns all seed items sorted by enrollStart desc', async () => {
    const items = await provider.fetchLatest();
    expect(items.length).toBeGreaterThan(0);
    for (let i = 1; i < items.length; i += 1) {
      expect(new Date(items[i - 1]!.enrollStart).getTime()).toBeGreaterThanOrEqual(
        new Date(items[i]!.enrollStart).getTime(),
      );
    }
  });

  it('filters by category', async () => {
    const items = await provider.fetchLatest({ filter: { category: 'soe' } });
    expect(items.every((i) => i.category === 'soe')).toBe(true);
  });

  it('every item keeps sourceUrl', async () => {
    const items = await provider.fetchLatest();
    expect(items.every((i) => /^https?:\/\//.test(i.sourceUrl))).toBe(true);
  });
});

describe('MockQuestionSearchProvider', () => {
  it('returns results with sourceUrl', async () => {
    const results = await new MockQuestionSearchProvider().searchQuestions('管培生', { limit: 3 });
    expect(results).toHaveLength(3);
    expect(results.every((r) => Boolean(r.sourceUrl))).toBe(true);
  });
});

describe('MockSearchProvider', () => {
  it('respects limit', async () => {
    const results = await new MockSearchProvider().search('国考', { limit: 2 });
    expect(results).toHaveLength(2);
  });
});

describe('MockLLMProvider', () => {
  it('returns interviewer question for interview system prompt', async () => {
    const res = await new MockLLMProvider().generate([
      { role: 'system', content: '你是一名严谨的面试官' },
      { role: 'user', content: '' },
    ]);
    expect(res.content).toContain('自我介绍');
  });

  it('returns valid JSON report when json option set', async () => {
    const res = await new MockLLMProvider().generate(
      [{ role: 'system', content: '生成面试报告' }],
      { json: true },
    );
    const parsed = JSON.parse(res.content) as { overallScore: number };
    expect(typeof parsed.overallScore).toBe('number');
  });
});
