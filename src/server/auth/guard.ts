import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ValidationError } from '../validation';
import { getAdminConfig } from './config';
import { findActiveAccount, listAccounts, type ActiveAccount, type AdminAccount, type AdminRole } from './directory';
import { ADMIN_COOKIE_NAME, SESSION_MAX_SECONDS, readSessionCookie, sessionCookieValue } from './session';
import { createSession, endSession, loadSession, type AdminSession } from './sessions';

// The one place that decides "is this request from a signed-in admin?".
// src/proxy.ts only redirects browsers; it is NOT the security boundary. Every admin page calls
// requireAdminPage() and every admin server action calls requireAdmin() (or requireSuperAdmin()).

export interface SignedInAdmin extends AdminSession {
  accountId: string;
  role: AdminRole;
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Not signed in');
    this.name = 'UnauthorizedError';
  }
}

/** Everyone who can sign in, read once per request. Null when sign-in is switched off. */
export const getAccounts = cache(async (): Promise<AdminAccount[] | null> => {
  const config = getAdminConfig();
  return config.ok ? listAccounts(config.config) : null;
});

async function sessionIdFromCookie(): Promise<string | null> {
  const config = getAdminConfig();
  if (!config.ok) return null;
  return readSessionCookie((await cookies()).get(ADMIN_COOKIE_NAME)?.value, config.config.sessionSecret);
}

/** Once per request (the layout and the page both ask). Fails closed: any doubt means "no". */
export const getAdmin = cache(async (): Promise<SignedInAdmin | null> => {
  const id = await sessionIdFromCookie();
  if (!id) return null;
  try {
    const session = await loadSession(id);
    if (!session) return null;
    // removed, reset or still invited: their sessions stop working at once
    const account = findActiveAccount((await getAccounts()) ?? [], session.email);
    return account ? { ...session, accountId: account.id, role: account.role } : null;
  } catch (err) {
    console.error('Could not check the admin session:', err);
    return null;
  }
});

/** The signed-in person's own account, with their current credentials. */
export async function currentAccount(): Promise<ActiveAccount | null> {
  const session = await getAdmin();
  if (!session) return null;
  return findActiveAccount((await getAccounts()) ?? [], session.email) ?? null;
}

/** For server actions: throws unless the caller is a signed-in admin. */
export async function requireAdmin(): Promise<SignedInAdmin> {
  const session = await getAdmin();
  if (!session) throw new UnauthorizedError();
  return session;
}

/** For server actions that manage other admins. */
export async function requireSuperAdmin(): Promise<SignedInAdmin> {
  const session = await requireAdmin();
  if (session.role !== 'super') throw new ValidationError({ form: 'Only a super admin can do this.' });
  return session;
}

/** For admin pages and layouts: sends everyone else to the sign-in page. */
export async function requireAdminPage(): Promise<SignedInAdmin> {
  const session = await getAdmin();
  if (!session) redirect('/admin/login');
  return session;
}

/** A brand-new session id at every sign-in, so an old or planted cookie is never reused. */
export async function startAdminSession(email: string, sessionSecret: string): Promise<void> {
  const id = await createSession(email);
  (await cookies()).set(ADMIN_COOKIE_NAME, sessionCookieValue(id, sessionSecret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    // only sent to the admin area, never with requests for the public pages
    path: '/admin',
    maxAge: SESSION_MAX_SECONDS,
  });
}

/** Ends this browser's session on the server, then removes the cookie. */
export async function endAdminSession(email?: string): Promise<void> {
  const id = await sessionIdFromCookie();
  if (id) {
    try {
      await endSession(id, email);
    } catch (err) {
      console.error('Could not end the admin session on the server:', err);
    }
  }
  await clearAdminCookie();
}

export async function clearAdminCookie(): Promise<void> {
  (await cookies()).set(ADMIN_COOKIE_NAME, '', { httpOnly: true, path: '/admin', maxAge: 0 });
}
