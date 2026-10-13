import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, readSessionToken } from '@/server/auth/session';

// A convenience redirect, not the security boundary: it keeps signed-out visitors off the admin
// pages and signed-in ones off the login page. The real checks are requireAdminPage() in every
// admin page and requireAdmin() in every admin server action (src/server/auth/guard.ts).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const signedIn = readSessionToken(token, process.env.ADMIN_SESSION_SECRET) !== null;

  if (pathname === '/admin/login') {
    return signedIn ? NextResponse.redirect(new URL('/admin', request.url)) : NextResponse.next();
  }
  if (!signedIn) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
