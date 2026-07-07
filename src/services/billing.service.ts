import { getAuthStore } from '@/lib/auth/store';
import { DEFAULT_PLAN, PLANS, getPlan, isPlanId, type PlanId } from '@/lib/billing/plans';
import { estimateUserCost } from '@/lib/billing/cost-model';
import type { User } from '@/types/user';

/** 列出全部套餐及其成本模型（供定价页 / 运营）。 */
export function listPlansWithCost() {
  return (Object.keys(PLANS) as PlanId[]).map((id) => ({
    plan: PLANS[id],
    cost: estimateUserCost(id),
  }));
}

/**
 * 变更套餐（MVP：无真实支付网关，直接切换）。
 * TODO(real): 接入微信/支付宝/Stripe，支付成功回调后再落库变更，并记录订单。
 */
export async function changePlan(userId: string, planId: string): Promise<User> {
  const target: PlanId = isPlanId(planId) ? planId : DEFAULT_PLAN;
  const user = await getAuthStore().updatePlan(userId, target);
  if (!user) throw new Error('用户不存在');
  return user;
}

export function planSummary(planId: PlanId) {
  return { plan: getPlan(planId), cost: estimateUserCost(planId) };
}
