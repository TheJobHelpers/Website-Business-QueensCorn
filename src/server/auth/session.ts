import crypto from 'crypto';

// Signed session token: "<payload>.<signature>". The payload is not secret (it only names the
// admin and an expiry); the HMAC signature is what proves the server issued it.
// No `server-only` import here: src/proxy.ts uses this module too.

export const ADMIN_COOKIE_NAME = 'qc_admin';
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export interface AdminSession {
  email: string;
  /** seconds since epoch */
  issuedAt: number;
  expiresAt: number;
}

function sign(payload: string, secret: string): Buffer {
  return crypto.createHmac('sha256', secret).update(payload).digest();
}

export function createSessionToken(email: string, secret: string, now: number = Date.now()): string {
  const issuedAt = Math.floor(now / 1000);
  const session: AdminSession = { email, issuedAt, expiresAt: issuedAt + SESSION_TTL_SECONDS };
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${sign(payload, secret).toString('base64url')}`;
}

export function readSessionToken(
  token: string | undefined,
  secret: string | undefined,
  now: number = Date.now()
): AdminSession | null {
  if (!token || !secret) return null;

  const dot = token.indexOf('.');
  if (dot < 1 || dot !== token.lastIndexOf('.')) return null;
  const payload = token.slice(0, dot);
  const given = Buffer.from(token.slice(dot + 1), 'base64url');
  const expected = sign(payload, secret);

  // timingSafeEqual needs equal lengths, and must not short-circuit on content
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Partial<AdminSession>;
    if (typeof session.email !== 'string' || typeof session.expiresAt !== 'number') return null;
    if (typeof session.issuedAt !== 'number' || session.expiresAt * 1000 <= now) return null;
    return { email: session.email, issuedAt: session.issuedAt, expiresAt: session.expiresAt };
  } catch {
    return null;
  }
}
