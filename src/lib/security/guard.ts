import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySignedValue } from '@/lib/auth/cookie';
import { getUserBySession } from '@/services/auth.service';
import { logger } from '@/lib/observability/logger';
import type { User } from '@/types/user';
import { consumeLlmQuota, rateLimit, type RateLimitResult } from './rate-limit';

/** 提取客户端标识（优先真实用户，退回 IP）。 */
export function clientKey(request: NextRequest, userId?: string): string {
  if (userId) return `u:${userId}`;
  const fwd = request.headers.get('x-forwarded-for');
  const ip = fwd?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'anon';
  return `ip:${ip}`;
}

/** 从请求 cookie 解析当前用户（Route Handler 用）。 */
export async function getRequestUser(request: NextRequest): Promise<User | null> {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  const sessionId = verifySignedValue(raw ?? undefined);
  if (!sessionId) return null;
  return getUserBySession(sessionId);
}

function tooMany(rl: RateLimitResult): NextResponse {
  const retry = Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { error: '请求过于频繁，请稍后再试', retryAfter: retry },
    { status: 429, headers: { 'Retry-After': String(retry) } },
  );
}

export interface GuardOptions {
  /** 是否要求登录（写接口默认 true）。 */
  requireAuth?: boolean;
  /** 是否消费每日 LLM 配额（LLM 接口 true）。 */
  llm?: boolean;
  /** 覆盖限流参数。 */
  rate?: { max?: number; windowMs?: number };
}

export interface GuardOk {
  ok: true;
  user: User | null;
}
export interface GuardFail {
  ok: false;
  response: NextResponse;
}

/**
 * 统一 API 守卫：限流 → （可选）鉴权 →（可选）LLM 配额。
 * 任一失败返回带标准状态码的 NextResponse。
 */
export async function guard(
  request: NextRequest,
  options: GuardOptions = {},
): Promise<GuardOk | GuardFail> {
  const user = await getRequestUser(request);

  if (options.requireAuth && !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: '请先登录' }, { status: 401 }),
    };
  }

  const key = clientKey(request, user?.id);
  const rl = rateLimit(`${new URL(request.url).pathname}:${key}`, options.rate);
  if (!rl.ok) {
    logger.warn('rate_limited', { key, path: new URL(request.url).pathname });
    return { ok: false, response: tooMany(rl) };
  }

  if (options.llm) {
    const quotaKey = user?.id ? `u:${user.id}` : key;
    if (!consumeLlmQuota(quotaKey)) {
      logger.warn('llm_quota_exceeded', { key: quotaKey });
      return {
        ok: false,
        response: NextResponse.json(
          { error: '今日 AI 使用额度已用尽，请明日再来' },
          { status: 429 },
        ),
      };
    }
  }

  return { ok: true, user };
}
