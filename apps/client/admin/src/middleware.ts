import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 获取token
  const token = request.cookies.get('auth-storage')?.value;

  // 如果是登录页面且已登录，重定向到首页
  if (request.nextUrl.pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 如果不是登录页面且未登录，重定向到登录页
  if (request.nextUrl.pathname !== '/login' && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
