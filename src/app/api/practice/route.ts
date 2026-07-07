import { NextResponse, type NextRequest } from 'next/server';
import { practiceSetSchema } from '@/lib/validators/practice';
import { buildPracticeSetAsync } from '@/services/question.service';

/**
 * POST /api/practice — 服务端构建练习题集。
 * 题库规模化（可达数千题）后，题目在服务端筛选/抽样，仅下发单次练习所需题目，
 * 避免整库进入客户端 bundle。错题重练传 wrongIds。
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求体需为 JSON' }, { status: 400 });
  }

  const parsed = practiceSetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '参数校验失败', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const questions = await buildPracticeSetAsync(parsed.data);
    return NextResponse.json({ questions, total: questions.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ error: '题库暂时不可用', message }, { status: 502 });
  }
}
