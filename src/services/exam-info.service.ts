import { getExamInfoProvider } from '@/providers/exam-info';
import type { ExamInfo, ExamInfoFilter } from '@/types/exam';
import type { FetchOptions } from '@/providers/types';

/**
 * 招录情报业务服务。
 * 组合 provider 结果，统一去重/排序/派生状态，供 API route 与 dashboard 调用。
 * 业务逻辑集中于此，不写进组件（GOAL.md 铁律）。
 */
export interface ListExamInfoParams extends ExamInfoFilter {
  limit?: number;
}

/** 根据当前时间派生报名状态（若数据源状态缺失时兜底）。 */
export function deriveStatus(item: ExamInfo, now: Date = new Date()): ExamInfo['status'] {
  const start = new Date(item.enrollStart).getTime();
  const end = new Date(item.enrollEnd).getTime();
  const t = now.getTime();
  if (t < start) return 'upcoming';
  if (t > end) return 'closed';
  return 'open';
}

export async function listExamInfo(params: ListExamInfoParams = {}): Promise<ExamInfo[]> {
  const { limit, ...filter } = params;
  const provider = getExamInfoProvider();
  const options: FetchOptions = { filter, limit };
  const items = await provider.fetchLatest(options);
  return items;
}

/** Dashboard 用：今日/最新动态若干条。 */
export async function getLatestExamInfo(limit = 3): Promise<ExamInfo[]> {
  return listExamInfo({ limit });
}

/** 可选地区列表（供筛选器）。 */
export async function getRegionOptions(): Promise<string[]> {
  const items = await listExamInfo();
  return [...new Set(items.map((i) => i.region))];
}
