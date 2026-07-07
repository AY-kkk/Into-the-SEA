import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { guard } from '@/lib/security/guard';
import { changePlan } from '@/services/billing.service';
import { captureError } from '@/lib/observability/capture';
import { logger } from '@/lib/observability/logger';

const schema = z.object({ plan: z.enum(['free', 'pro']) });

/**
 * POST /api/billing/subscribe — 变更套餐（需登录）。
 * MVP 无真实支付，直接切换；TODO(real): 支付网关回调后落库。
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const g = await guard(request, { requireAuth: true, rate: { max: 10, windowMs: 60_000 } });
  if (!g.ok) return g.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求体必须为 JSON' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: '参数校验失败' }, { status: 400 });
  }
  try {
    const user = await changePlan(g.user!.id, parsed.data.plan);
    logger.info('plan_changed', { userId: user.id, plan: user.plan });
    return NextResponse.json({ user });
  } catch (error) {
    captureError(error, { route: 'billing/subscribe' });
    return NextResponse.json({ error: '套餐变更失败' }, { status: 500 });
  }
}
