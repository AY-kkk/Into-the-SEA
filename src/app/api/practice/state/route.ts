import { NextResponse, type NextRequest } from 'next/server';
import { guard } from '@/lib/security/guard';
import { practiceStateSchema } from '@/lib/validators/practice-state';
import { getPracticeState, savePracticeState } from '@/lib/db/practice-state';
import { captureError } from '@/lib/observability/capture';
import type { AnswerRecord, WrongQuestion } from '@/types/question';

/** GET /api/practice/state — 读取当前用户服务端练习进度。 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const g = await guard(request, { requireAuth: true });
  if (!g.ok) return g.response;
  try {
    const snap = await getPracticeState(g.user!.id);
    return NextResponse.json(snap);
  } catch (error) {
    captureError(error, { route: 'practice/state:GET' });
    return NextResponse.json({ error: '读取进度失败' }, { status: 500 });
  }
}

/** PUT /api/practice/state — 覆盖保存当前用户练习进度。 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const g = await guard(request, { requireAuth: true });
  if (!g.ok) return g.response;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求体必须为 JSON' }, { status: 400 });
  }
  const parsed = practiceStateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '参数校验失败', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  try {
    const snap = await savePracticeState(g.user!.id, {
      records: parsed.data.records as AnswerRecord[],
      wrongBook: parsed.data.wrongBook as WrongQuestion[],
    });
    return NextResponse.json(snap);
  } catch (error) {
    captureError(error, { route: 'practice/state:PUT' });
    return NextResponse.json({ error: '保存进度失败' }, { status: 500 });
  }
}
