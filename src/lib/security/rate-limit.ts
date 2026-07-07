import { env } from '@/lib/env';

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * 进程内滑动窗口限流（无外部依赖）。
 * 生产多实例建议替换为 Redis（REDIS_URL 已预留），此实现满足单实例/开发的防滥用需求。
 */
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

export function rateLimit(
  key: string,
  opts?: { max?: number; windowMs?: number },
): RateLimitResult {
  const max = opts?.max ?? env.RATE_LIMIT_MAX;
  const windowMs = opts?.windowMs ?? env.RATE_LIMIT_WINDOW_MS;
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: max - 1, resetAt, limit: max };
  }
  bucket.count += 1;
  const remaining = Math.max(0, max - bucket.count);
  return { ok: bucket.count <= max, remaining, resetAt: bucket.resetAt, limit: max };
}

/** 测试用：清空所有计数。 */
export function __resetRateLimit(): void {
  buckets.clear();
}

// ── 每日 LLM 调用配额（成本护栏）──
interface DailyBucket {
  count: number;
  day: string;
}
const dailyLlm = new Map<string, DailyBucket>();

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** 校验并递增某用户当日 LLM 调用次数；超限返回 false。 */
export function consumeLlmQuota(userKey: string, cap = env.LLM_DAILY_CALL_CAP): boolean {
  const day = today();
  const b = dailyLlm.get(userKey);
  if (!b || b.day !== day) {
    dailyLlm.set(userKey, { count: 1, day });
    return true;
  }
  if (b.count >= cap) return false;
  b.count += 1;
  return true;
}

export function __resetLlmQuota(): void {
  dailyLlm.clear();
}
