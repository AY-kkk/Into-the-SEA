import { NextResponse, type NextRequest } from 'next/server';
import { guard, getRequestUser } from '@/lib/security/guard';
import { analyticsBatchSchema } from '@/lib/validators/analytics';
import { logger } from '@/lib/observability/logger';

/**
 * POST /api/analytics — 关键漏斗埋点收集。
 * MVP：结构化日志落地（便于采集到日志平台/数仓）；可平滑替换为 PostHog/GA4/自建。
 * 无需登录（匿名漏斗），但限流防刷。
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const g = await guard(request, { rate: { max: 120, windowMs: 60_000 } });
  if (!g.ok) return g.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求体必须为 JSON' }, { status: 400 });
  }
  const parsed = analyticsBatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: '参数校验失败' }, { status: 400 });
  }
  const user = await getRequestUser(request);
  const anonId = request.headers.get('x-anon-id') ?? undefined;
  for (const e of parsed.data.events) {
    logger.info('funnel', {
      event: e.event,
      userId: user?.id ?? null,
      anonId,
      props: e.props,
      ts: e.ts ?? new Date().toISOString(),
    });
  }
  return NextResponse.json({ ok: true, accepted: parsed.data.events.length });
}
