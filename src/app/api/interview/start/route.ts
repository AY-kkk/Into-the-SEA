import { NextResponse, type NextRequest } from 'next/server';
import { interviewConfigSchema } from '@/lib/validators/interview';
import { generateOpening } from '@/services/interview.service';

/** POST /api/interview/start — 开始面试，返回开场问题。 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求体必须为 JSON' }, { status: 400 });
  }
  const parsed = interviewConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '参数校验失败', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  try {
    const message = await generateOpening(parsed.data);
    return NextResponse.json({ message });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ error: '面试服务不可用', message: msg }, { status: 502 });
  }
}
