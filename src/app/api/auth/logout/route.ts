import { NextResponse, type NextRequest } from 'next/server';
import { clearSessionCookie, getSessionId } from '@/lib/auth/session';
import { logout } from '@/services/auth.service';

export async function POST(_request: NextRequest): Promise<NextResponse> {
  const sessionId = getSessionId();
  if (sessionId) await logout(sessionId);
  clearSessionCookie();
  return NextResponse.json({ ok: true });
}
