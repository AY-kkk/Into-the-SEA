import { beforeEach, describe, expect, it } from 'vitest';
import { __resetLlmQuota, __resetRateLimit, consumeLlmQuota, rateLimit } from './rate-limit';

describe('rateLimit', () => {
  beforeEach(() => {
    __resetRateLimit();
    __resetLlmQuota();
  });

  it('allows up to max then blocks within window', () => {
    const key = 'test:key';
    const opts = { max: 3, windowMs: 60_000 };
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(true);
    const blocked = rateLimit(key, opts);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('tracks separate keys independently', () => {
    const opts = { max: 1, windowMs: 60_000 };
    expect(rateLimit('a', opts).ok).toBe(true);
    expect(rateLimit('b', opts).ok).toBe(true);
    expect(rateLimit('a', opts).ok).toBe(false);
  });
});

describe('consumeLlmQuota', () => {
  beforeEach(() => __resetLlmQuota());

  it('enforces daily cap per user', () => {
    expect(consumeLlmQuota('u:1', 2)).toBe(true);
    expect(consumeLlmQuota('u:1', 2)).toBe(true);
    expect(consumeLlmQuota('u:1', 2)).toBe(false);
    // 另一个用户不受影响
    expect(consumeLlmQuota('u:2', 2)).toBe(true);
  });
});
