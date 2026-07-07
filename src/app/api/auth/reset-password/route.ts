import { NextResponse, type NextRequest } from 'next/server';
import { resetPasswordSchema } from '@/lib/validators/auth';
import { resetPassword } from '@/services/auth.service';
import { guard } from '@/lib/security/guard';
import { captureError } from '@/lib/observability/capture';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const g = await guard(request, { rate: { max: 5, windowMs: 60_000 } });
  if (!g.ok) return g.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求体必须为 JSON' }, { status: 400 });
  }
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '参数校验失败', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  try {
    await resetPassword(parsed.data);
    // 不暴露邮箱是否存在，统一返回成功。
    return NextResponse.json({ ok: true });
  } catch (error) {
    captureError(error, { route: 'auth/reset-password' });
    return NextResponse.json({ error: '操作失败，请稍后再试' }, { status: 500 });
  }
}
