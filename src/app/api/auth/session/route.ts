import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';

/** GET /api/auth/session — 返回当前登录用户（未登录返回 user:null）。 */
export async function GET(): Promise<NextResponse> {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}
