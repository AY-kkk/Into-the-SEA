import { NextResponse, type NextRequest } from 'next/server';
import { caseFilterSchema, originalFilterSchema } from '@/lib/validators/essay';
import { listEssayCasesAsync, listEssayOriginalsAsync } from '@/services/essay.service';

/**
 * GET /api/essay?kind=case|original — 申论案例 / 原题列表。
 * 参数经 zod 校验，错误分别返回 400 / 502。
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get('kind') ?? 'case';
  const raw = Object.fromEntries(searchParams.entries());
  delete (raw as Record<string, string>).kind;

  try {
    if (kind === 'original') {
      const parsed = originalFilterSchema.safeParse(raw);
      if (!parsed.success) {
        return NextResponse.json(
          { error: '参数校验失败', details: parsed.error.flatten().fieldErrors },
          { status: 400 },
        );
      }
      const page = await listEssayOriginalsAsync(parsed.data);
      return NextResponse.json(page);
    }

    const parsed = caseFilterSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const page = await listEssayCasesAsync(parsed.data);
    return NextResponse.json(page);
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ error: '数据源暂时不可用', message }, { status: 502 });
  }
}
