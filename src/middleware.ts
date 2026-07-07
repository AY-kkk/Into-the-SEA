import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'its_session';

/**
 * 路由守卫（边缘中间件）：
 *  - 仅检测会话 cookie 是否存在（Edge Runtime 不支持 node:crypto，故不在此验签）。
 *    cookie 的 HMAC 签名校验 + 会话有效性由服务端 API/页面（getCurrentUser / guard）二次把关。
 *  - 未登录访问受保护页面 → 跳转 /login?next=...
 *  - 已登录访问鉴权页 → 跳转首页。
 */
const PROTECTED = ['/exam-news', '/job-prep', '/practice', '/essay', '/interview'];
const AUTH_PAGES = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuthPage = AUTH_PAGES.some((p) => pathname === p);

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  if (isAuthPage && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/exam-news/:path*',
    '/job-prep/:path*',
    '/practice/:path*',
    '/essay/:path*',
    '/interview/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
};
