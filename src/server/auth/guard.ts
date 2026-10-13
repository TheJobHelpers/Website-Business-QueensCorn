import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminConfig } from './config';
import { ADMIN_COOKIE_NAME, SESSION_TTL_SECONDS, createSessionToken, readSessionToken, type AdminSession } from './session';

// The one place that decides "is this request from the signed-in admin?".
// src/proxy.ts only redirects browsers; it is NOT the security boundary. Every admin page calls
// requireAdminPage() and every admin server action calls requireAdmin().

export class UnauthorizedError extends Error {
  constructor() {
    super('Not signed in');
    this.name = 'UnauthorizedError';
  }
}

export async function getAdmin(): Promise<AdminSession | null> {
  const result = getAdminConfig();
  if (!result.ok) return null;
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  const session = readSessionToken(token, result.config.sessionSecret);
  // a session for an address that is no longer the admin is not valid
  return session && session.email === result.config.email ? session : null;
}

/** For server actions: throws unless the caller is the signed-in admin. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdmin();
  if (!session) throw new UnauthorizedError();
  return session;
}

/** For admin pages and layouts: sends everyone else to the sign-in page. */
export async function requireAdminPage(): Promise<AdminSession> {
  const session = await getAdmin();
  if (!session) redirect('/admin/login');
  return session;
}

export async function startAdminSession(email: string, sessionSecret: string): Promise<void> {
  (await cookies()).set(ADMIN_COOKIE_NAME, createSessionToken(email, sessionSecret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    // only sent to the admin area, never with requests for the public pages
    path: '/admin',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endAdminSession(): Promise<void> {
  (await cookies()).set(ADMIN_COOKIE_NAME, '', { httpOnly: true, path: '/admin', maxAge: 0 });
}
