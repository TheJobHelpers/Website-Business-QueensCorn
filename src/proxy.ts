import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only handle admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = token ? Boolean(verifySessionToken(token)) : false;

  // If visiting /admin/login while already authenticated, go straight to dashboard
  if (pathname === '/admin/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // If visiting protected admin route without authentication, redirect to login
  if (!isAuthenticated) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
