import { cookies } from 'next/headers';
import { SESSION_COOKIE, signValue, verifySignedValue } from './cookie';
import { SESSION_TTL_DAYS } from './store';
import { getUserBySession } from '@/services/auth.service';
import type { User } from '@/types/user';

/** 在 Server Component / Route Handler 中读取当前登录用户。 */
export async function getCurrentUser(): Promise<User | null> {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  const sessionId = verifySignedValue(raw ?? undefined);
  if (!sessionId) return null;
  return getUserBySession(sessionId);
}

/** 读取（已验签的）sessionId。 */
export function getSessionId(): string | null {
  return verifySignedValue(cookies().get(SESSION_COOKIE)?.value ?? undefined);
}

/** 设置会话 cookie（HttpOnly + 签名 + SameSite=Lax）。 */
export function setSessionCookie(sessionId: string): void {
  cookies().set(SESSION_COOKIE, signValue(sessionId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_DAYS * 86_400,
  });
}

/** 清除会话 cookie。 */
export function clearSessionCookie(): void {
  cookies().set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
}
