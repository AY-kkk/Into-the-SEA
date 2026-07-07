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

export interface ExamInfoFreshness {
  /** 数据集中最新的发布时间（ISO），无则 null。 */
  latestPublishedAt: string | null;
  /** 距最新发布已过去的天数。 */
  ageDays: number | null;
  /** 是否被视为陈旧（默认 > 30 天）。 */
  stale: boolean;
  /** 计算时刻。 */
  checkedAt: string;
}

/**
 * 计算招录数据的新鲜度：用于页面展示「更新时间」与陈旧提示。
 * TODO(real): 接入 scripts/ingest.ts 的实际抓取时间戳（AppMeta 表记录 lastIngestAt）。
 */
export async function getExamInfoFreshness(staleDays = 30): Promise<ExamInfoFreshness> {
  const items = await listExamInfo();
  const times = items
    .map((i) => i.publishedAt)
    .filter((d): d is string => Boolean(d))
    .map((d) => new Date(d).getTime())
    .filter((t) => Number.isFinite(t));
  const now = Date.now();
  if (times.length === 0) {
    return {
      latestPublishedAt: null,
      ageDays: null,
      stale: true,
      checkedAt: new Date(now).toISOString(),
    };
  }
  const latest = Math.max(...times);
  const ageDays = Math.floor((now - latest) / 86_400_000);
  return {
    latestPublishedAt: new Date(latest).toISOString(),
    ageDays,
    stale: ageDays > staleDays,
    checkedAt: new Date(now).toISOString(),
  };
}
