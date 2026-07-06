import { describe, expect, it } from 'vitest';
import { essayCaseSeed, essayOriginalSeed, examInfoSeed, questionSeed } from '@/lib/db/seed-data';

describe('seed data integrity', () => {
  it('has non-empty seed sets', () => {
    expect(examInfoSeed.length).toBeGreaterThan(0);
    expect(questionSeed.length).toBeGreaterThan(0);
    expect(essayCaseSeed.length).toBeGreaterThan(0);
    expect(essayOriginalSeed.length).toBeGreaterThan(0);
  });

  it('exam infos always carry a source_url (red line)', () => {
    for (const item of examInfoSeed) {
      expect(item.sourceUrl, item.id).toMatch(/^https?:\/\//);
    }
  });

  it('essay cases and originals always carry a source_url (red line)', () => {
    for (const item of [...essayCaseSeed, ...essayOriginalSeed]) {
      expect(item.sourceUrl, item.id).toMatch(/^https?:\/\//);
    }
  });

  it('questions have a valid answer key present in options', () => {
    for (const q of questionSeed) {
      const keys = q.options.map((o) => o.key);
      expect(keys, q.id).toContain(q.answer);
    }
  });
});
