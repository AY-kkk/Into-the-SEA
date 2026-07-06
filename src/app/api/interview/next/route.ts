import { NextResponse, type NextRequest } from 'next/server';
import { nextQuestionSchema } from '@/lib/validators/interview';
import { generateNext } from '@/services/interview.service';

/** POST /api/interview/next — 提交回答，返回下一个（追问）问题。 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求体必须为 JSON' }, { status: 400 });
  }
  const parsed = nextQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '参数校验失败', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { config, messages, userAnswer } = parsed.data;
  const history = [...messages];
  if (userAnswer && userAnswer.trim()) {
    history.push({
      id: `msg_${Date.now()}`,
      role: 'candidate',
      content: userAnswer,
      createdAt: new Date().toISOString(),
    });
  }
  try {
    const message = await generateNext(config, history);
    return NextResponse.json({ message });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ error: '面试服务不可用', message: msg }, { status: 502 });
  }
}
