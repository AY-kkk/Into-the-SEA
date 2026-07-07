import { NextResponse, type NextRequest } from 'next/server';
import { loginSchema } from '@/lib/validators/auth';
import { AuthError, login } from '@/services/auth.service';
import { setSessionCookie } from '@/lib/auth/session';
import { guard } from '@/lib/security/guard';
import { captureError } from '@/lib/observability/capture';
import { logger } from '@/lib/observability/logger';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 登录接口更严格限流，防撞库。
  const g = await guard(request, { rate: { max: 10, windowMs: 60_000 } });
  if (!g.ok) return g.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求体必须为 JSON' }, { status: 400 });
  }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '参数校验失败', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  try {
    const { user, session } = await login(parsed.data);
    setSessionCookie(session.id);
    logger.info('user_login', { userId: user.id });
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    captureError(error, { route: 'auth/login' });
    return NextResponse.json({ error: '登录失败，请稍后再试' }, { status: 500 });
  }
}
