import { NextResponse, type NextRequest } from 'next/server';
import { guard } from '@/lib/security/guard';
import { questionSearchSchema } from '@/lib/validators/job';
import { searchPositionQuestions } from '@/services/job-prep.service';

/** GET /api/job-prep/questions?positionName=... — 岗位题库联网检索（保留 source_url）。 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const g = await guard(request, { requireAuth: true, llm: true });
  if (!g.ok) return g.response;

  const { searchParams } = new URL(request.url);
  const parsed = questionSearchSchema.safeParse({
    positionName: searchParams.get('positionName') ?? '',
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: '参数校验失败', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  try {
    const results = await searchPositionQuestions(parsed.data.positionName);
    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ error: '搜索服务暂时不可用', message }, { status: 502 });
  }
}
