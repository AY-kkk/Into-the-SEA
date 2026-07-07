import { NextResponse, type NextRequest } from 'next/server';
import { guard } from '@/lib/security/guard';
import { nextQuestionSchema } from '@/lib/validators/interview';
import { generateNext } from '@/services/interview.service';
import { moderate } from '@/lib/moderation';

/** POST /api/interview/next — 提交回答，返回下一个（追问）问题。 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const g = await guard(request, { requireAuth: true, llm: true });
  if (!g.ok) return g.response;

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
    // 输入审核：违规拦截，PII 自动脱敏后再入模型上下文。
    const safe = await moderate(userAnswer);
    if (safe.action === 'block') {
      return NextResponse.json(
        { error: '你的回答包含不适当内容，请修改后重试', categories: safe.categories },
        { status: 422 },
      );
    }
    history.push({
      id: `msg_${Date.now()}`,
      role: 'candidate',
      content: safe.text,
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
