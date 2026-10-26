import crypto from 'crypto';

// The session cookie: "<session id>.<signature>". The id is random and means nothing by itself;
// the session it names lives on the server (./sessions.ts), so signing out really ends it. The
// HMAC signature lets src/proxy.ts turn away made-up cookies without asking the database.
// No `server-only` import here: src/proxy.ts uses this module too.

export const ADMIN_COOKIE_NAME = 'qc_admin';
/** NIST SP 800-63B (AAL2): sign in again after 12 hours, whatever happens */
export const SESSION_MAX_SECONDS = 12 * 60 * 60;
/** ... and after 30 minutes without any activity */
export const SESSION_IDLE_SECONDS = 30 * 60;

const sign = (id: string, secret: string) => crypto.createHmac('sha256', secret).update(id).digest();

export function newSessionId(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function sessionCookieValue(id: string, secret: string): string {
  return `${id}.${sign(id, secret).toString('base64url')}`;
}

/** The session id in a cookie this server signed, or null for anything else. */
export function readSessionCookie(value: string | undefined, secret: string | undefined): string | null {
  if (!value || !secret) return null;
  const dot = value.indexOf('.');
  if (dot < 1 || dot !== value.lastIndexOf('.')) return null;
  const id = value.slice(0, dot);
  if (!/^[A-Za-z0-9_-]{43}$/.test(id)) return null;
  const given = Buffer.from(value.slice(dot + 1), 'base64url');
  const expected = sign(id, secret);
  // timingSafeEqual needs equal lengths, and must not short-circuit on content
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  return id;
}
