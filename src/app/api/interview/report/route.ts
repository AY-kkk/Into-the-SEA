import { NextResponse, type NextRequest } from 'next/server';
import { reportSchema } from '@/lib/validators/interview';
import { generateReport } from '@/services/interview.service';

/** POST /api/interview/report — 生成多维度面试报告。 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求体必须为 JSON' }, { status: 400 });
  }
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '参数校验失败', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  try {
    const report = await generateReport(parsed.data.config, parsed.data.messages);
    return NextResponse.json({ report });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ error: '报告生成失败', message: msg }, { status: 502 });
  }
}
