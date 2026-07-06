import { describe, expect, it } from 'vitest';
import { cn, formatDate } from '@/lib/utils';

describe('cn', () => {
  it('merges and dedupes tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-sm', false && 'hidden', 'font-medium')).toBe('text-sm font-medium');
  });
});

describe('formatDate', () => {
  it('formats a valid ISO date', () => {
    expect(formatDate('2026-03-15')).toContain('2026');
  });
  it('returns em-dash for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });
});
