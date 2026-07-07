import { NextResponse, type NextRequest } from 'next/server';
import { guard } from '@/lib/security/guard';
import { listPlansWithCost } from '@/services/billing.service';

/** GET /api/billing — 套餐列表 + 成本模型 + 当前用户套餐。 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const g = await guard(request);
  if (!g.ok) return g.response;
  return NextResponse.json({
    plans: listPlansWithCost(),
    currentPlan: g.user?.plan ?? null,
  });
}
