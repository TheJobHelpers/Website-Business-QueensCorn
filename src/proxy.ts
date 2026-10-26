import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, readSessionCookie } from '@/server/auth/session';

// A convenience redirect, not the security boundary: it sends visitors without a session cookie
// this server signed straight to the sign-in page. The real checks are requireAdminPage() in
// every admin page and requireAdmin() in every admin server action (src/server/auth/guard.ts),
// which also know whether the session has been ended or has run out. The sign-in page is always
// shown (a signed cookie may belong to a session that is already over), and so is the page an
// invite link opens: the person is not signed in yet.
const OPEN_PAGES = new Set(['/admin/login', '/admin/setup']);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (OPEN_PAGES.has(pathname)) return NextResponse.next();

  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (readSessionCookie(cookie, process.env.ADMIN_SESSION_SECRET?.trim()) === null) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
