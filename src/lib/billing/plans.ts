/**
 * 商业化：订阅套餐与用量分层（Gate3）。
 * 免费/付费边界集中定义，供 API 护栏、前端定价页、成本模型共用，避免散落硬编码。
 */
export type PlanId = 'free' | 'pro';

export interface PlanLimits {
  /** 每日 LLM（模拟面试/岗位检索）调用上限。 */
  dailyLlmCalls: number;
  /** 每日刷题上限（0 表示不限）。 */
  dailyPractice: number;
  /** 是否可导出面试报告 / 错题本。 */
  canExport: boolean;
  /** 多端云同步（服务端持久化）。 */
  cloudSync: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  /** 月费（人民币元），0 为免费。 */
  priceMonthly: number;
  tagline: string;
  features: string[];
  limits: PlanLimits;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: '免费版',
    priceMonthly: 0,
    tagline: '零成本体验全部核心功能',
    features: [
      '招录情报 / 申论案例全量浏览',
      '每日行测刷题 50 题',
      '每日模拟面试 / 岗位检索 AI 调用 10 次',
      '练习进度云端同步',
    ],
    limits: { dailyLlmCalls: 10, dailyPractice: 50, canExport: false, cloudSync: true },
  },
  pro: {
    id: 'pro',
    name: '专业版',
    priceMonthly: 29,
    tagline: '全力冲刺上岸，AI 额度大幅提升',
    features: [
      '免费版全部功能',
      '行测刷题不限量',
      '每日模拟面试 / 岗位检索 AI 调用 200 次',
      '面试报告 / 错题本导出',
      '优先体验新功能',
    ],
    limits: { dailyLlmCalls: 200, dailyPractice: 0, canExport: true, cloudSync: true },
  },
};

export const DEFAULT_PLAN: PlanId = 'free';

export function getPlan(id: PlanId): Plan {
  return PLANS[id] ?? PLANS[DEFAULT_PLAN];
}

export function isPlanId(v: string): v is PlanId {
  return v === 'free' || v === 'pro';
}
