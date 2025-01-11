import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authStorage = request.cookies.get('auth-storage')?.value;
  let isAuthenticated = false;

  console.log('当前路径:', request.nextUrl.pathname);
  console.log('Cookie 原始值:', authStorage);

  if (authStorage) {
    try {
      const authData = JSON.parse(decodeURIComponent(authStorage));
      console.log(authData);

      console.log('解析后的认证数据:', authData);
      console.log('state 数据:', authData.state);

      // 修改判断逻辑，检查 isAuthenticated 字段
      isAuthenticated = authData.state?.isAuthenticated === true;

      console.log('认证状态:', isAuthenticated);
    } catch (error) {
      console.error('解析认证信息失败:', error);
    }
  }

  // 如果是登录页面且已登录，重定向到首页
  if (request.nextUrl.pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 如果不是登录页面且未登录，重定向到登录页
  if (request.nextUrl.pathname !== '/login' && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * 1. /api 开头的路径（API 路由）
     * 2. /_next 开头的路径（Next.js 内部路由）
     * 3. /static 开头的路径（静态文件）
     * 4. /favicon.ico（网站图标）
     */
    '/((?!api|_next/static|_next/image|favicon.ico|static).*)',
  ],
};
