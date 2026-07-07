import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { guard } from '@/lib/security/guard';
import { moderate } from '@/lib/moderation';

const schema = z.object({ text: z.string().min(1).max(5000) });

/**
 * POST /api/moderation — 内容审核预检（前端提交前可调用）。
 * 返回 action(allow|mask|block) + 脱敏文本 + 命中类别。
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const g = await guard(request, { rate: { max: 60, windowMs: 60_000 } });
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
  const result = await moderate(parsed.data.text);
  return NextResponse.json(result);
}
