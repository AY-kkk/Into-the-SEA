import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'its_session';
const REQUEST_ID_HEADER = 'x-request-id';

/**
 * 路由守卫 + 可观测性（边缘中间件）：
 *  - 为每个请求注入 x-request-id（若上游未带），便于日志串联与错误追踪。
 *  - 仅检测会话 cookie 是否存在（Edge Runtime 不支持 node:crypto，故不在此验签）；
 *    cookie 的 HMAC 签名校验 + 会话有效性由服务端 API/页面（getCurrentUser / guard）二次把关。
 *  - 未登录访问受保护页面 → 跳转 /login?next=...；已登录访问鉴权页 → 跳转首页。
 */
const PROTECTED = ['/exam-news', '/job-prep', '/practice', '/essay', '/interview'];
const AUTH_PAGES = ['/login', '/register', '/forgot-password'];

function withRequestId(request: NextRequest, res: NextResponse): NextResponse {
  const id = request.headers.get(REQUEST_ID_HEADER) ?? crypto.randomUUID();
  res.headers.set(REQUEST_ID_HEADER, id);
  return res;
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuthPage = AUTH_PAGES.some((p) => pathname === p);

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return withRequestId(request, NextResponse.redirect(url));
  }
  if (isAuthPage && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return withRequestId(request, NextResponse.redirect(url));
  }
  return withRequestId(request, NextResponse.next());
}

export const config = {
  // 覆盖全部路由（排除静态资源），以便统一注入 request-id；重定向逻辑内部按路径判断。
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
