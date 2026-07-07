import { env } from '@/lib/env';
import { PLANS, type PlanId } from './plans';

/**
 * 单用户成本模型（估算，用于定价与容量规划）。
 * 假设：每次面试/检索 LLM 调用平均消耗约 avgTokensPerCall（提示+补全），
 * 单价按 pricePer1kTokens（元/千 tokens）。可通过 env 覆盖以贴合真实计费。
 */
export interface CostAssumptions {
  avgTokensPerCall: number;
  pricePer1kTokens: number;
}

export function getCostAssumptions(): CostAssumptions {
  return {
    avgTokensPerCall: Number(process.env.COST_AVG_TOKENS_PER_CALL ?? 1400),
    pricePer1kTokens: Number(process.env.COST_PRICE_PER_1K_TOKENS ?? 0.004),
    // 默认贴近国内大模型轻量档：约 0.004 元/千 tokens。
  };
}

export interface UserCostEstimate {
  planId: PlanId;
  maxDailyLlmCalls: number;
  /** 假设活跃用户用满配额的最坏月成本（元）。 */
  worstMonthlyCost: number;
  /** 按典型使用率（默认 25%）估算的月成本（元）。 */
  typicalMonthlyCost: number;
  priceMonthly: number;
  /** 典型使用率下的毛利（元）。 */
  typicalGrossMargin: number;
  assumptions: CostAssumptions & { typicalUtilization: number; capTokens: number };
}

export function estimateUserCost(planId: PlanId, utilization = 0.25): UserCostEstimate {
  const plan = PLANS[planId];
  const a = getCostAssumptions();
  const capTokens = Math.min(a.avgTokensPerCall, env.LLM_MAX_TOKENS_CAP);
  const perCall = (capTokens / 1000) * a.pricePer1kTokens;
  const maxDailyLlmCalls = plan.limits.dailyLlmCalls;
  const worstMonthlyCost = round(perCall * maxDailyLlmCalls * 30);
  const typicalMonthlyCost = round(worstMonthlyCost * utilization);
  return {
    planId,
    maxDailyLlmCalls,
    worstMonthlyCost,
    typicalMonthlyCost,
    priceMonthly: plan.priceMonthly,
    typicalGrossMargin: round(plan.priceMonthly - typicalMonthlyCost),
    assumptions: { ...a, typicalUtilization: utilization, capTokens },
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
