import { describe, expect, it } from 'vitest';
import {
  getOriginalYears,
  listEssayCases,
  listEssayOriginals,
} from './essay.service';

describe('essay.service', () => {
  it('lists cases and every case keeps sourceUrl (red line)', () => {
    const cases = listEssayCases();
    expect(cases.length).toBeGreaterThan(0);
    expect(cases.every((c) => /^https?:\/\//.test(c.sourceUrl))).toBe(true);
  });

  it('filters cases by topic', () => {
    const cases = listEssayCases({ topic: 'rural-revitalization' });
    expect(cases.every((c) => c.topics.includes('rural-revitalization'))).toBe(true);
  });

  it('lists originals sorted by year desc, each with sourceUrl', () => {
    const originals = listEssayOriginals();
    expect(originals.length).toBeGreaterThan(0);
    for (let i = 1; i < originals.length; i += 1) {
      expect(originals[i - 1]!.year).toBeGreaterThanOrEqual(originals[i]!.year);
    }
    expect(originals.every((o) => /^https?:\/\//.test(o.sourceUrl))).toBe(true);
  });

  it('filters originals by category and year', () => {
    const years = getOriginalYears();
    expect(years.length).toBeGreaterThan(0);
    const filtered = listEssayOriginals({ category: 'national' });
    expect(filtered.every((o) => o.category === 'national')).toBe(true);
  });
});
