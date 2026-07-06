import { describe, expect, it } from 'vitest';
import { deriveStatus, listExamInfo } from './exam-info.service';
import type { ExamInfo } from '@/types/exam';

const base: ExamInfo = {
  id: 't1',
  title: 't',
  category: 'national',
  region: '全国',
  organization: 'o',
  enrollStart: '2025-01-10',
  enrollEnd: '2025-01-20',
  status: 'open',
  headcount: 1,
  education: 'bachelor',
  majors: [],
  summary: '',
  tags: [],
  sourceUrl: 'http://example.com',
};

describe('deriveStatus', () => {
  it('upcoming before start', () => {
    expect(deriveStatus(base, new Date('2025-01-01'))).toBe('upcoming');
  });
  it('open during window', () => {
    expect(deriveStatus(base, new Date('2025-01-15'))).toBe('open');
  });
  it('closed after end', () => {
    expect(deriveStatus(base, new Date('2025-02-01'))).toBe('closed');
  });
});

describe('listExamInfo', () => {
  it('applies limit', async () => {
    const items = await listExamInfo({ limit: 2 });
    expect(items.length).toBeLessThanOrEqual(2);
  });
  it('filters by keyword', async () => {
    const items = await listExamInfo({ keyword: '电网' });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => (i.title + i.organization + i.summary).includes('电网'))).toBe(true);
  });
});
