import { NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE } from './lib/auth';

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/admin/login';
  const isLoginApi = pathname === '/api/admin/login';
  if (isLoginPage || isLoginApi) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = verifySessionToken(token, process.env.ADMIN_SESSION_SECRET);

  if (pathname.startsWith('/api/admin')) {
    if (!valid) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    return NextResponse.next();
  }

  if (!valid) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
