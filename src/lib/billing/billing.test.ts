import { describe, expect, it } from 'vitest';
import { PLANS, getPlan, isPlanId } from './plans';
import { estimateUserCost } from './cost-model';

describe('billing plans', () => {
  it('free plan has lower daily LLM cap than pro', () => {
    expect(PLANS.free.limits.dailyLlmCalls).toBeLessThan(PLANS.pro.limits.dailyLlmCalls);
  });

  it('free is priced 0, pro is paid', () => {
    expect(PLANS.free.priceMonthly).toBe(0);
    expect(PLANS.pro.priceMonthly).toBeGreaterThan(0);
  });

  it('isPlanId validates', () => {
    expect(isPlanId('free')).toBe(true);
    expect(isPlanId('pro')).toBe(true);
    expect(isPlanId('enterprise')).toBe(false);
  });

  it('getPlan falls back to free for unknown', () => {
    // @ts-expect-error testing runtime fallback
    expect(getPlan('nope').id).toBe('free');
  });
});

describe('cost model', () => {
  it('pro worst-case cost scales with higher cap', () => {
    const free = estimateUserCost('free');
    const pro = estimateUserCost('pro');
    expect(pro.worstMonthlyCost).toBeGreaterThan(free.worstMonthlyCost);
    expect(pro.maxDailyLlmCalls).toBe(PLANS.pro.limits.dailyLlmCalls);
  });

  it('typical cost is a fraction of worst-case', () => {
    const pro = estimateUserCost('pro', 0.25);
    expect(pro.typicalMonthlyCost).toBeLessThanOrEqual(pro.worstMonthlyCost);
    expect(pro.typicalMonthlyCost).toBeGreaterThan(0);
  });

  it('pro plan is gross-margin positive at typical utilization', () => {
    const pro = estimateUserCost('pro', 0.25);
    expect(pro.typicalGrossMargin).toBeGreaterThan(0);
  });
});
