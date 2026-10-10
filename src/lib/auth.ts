import crypto from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'qc_admin_session';

const DEFAULT_ADMIN_EMAIL = 'thequeenscornaz@gmail.com';
const DEFAULT_ADMIN_PASSWORD = 'queenscorn2026';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'queens-corn-artisan-kettle-corn-secret-key-2026';

export interface AdminUser {
  email: string;
  role: 'owner' | 'manager';
  name: string;
  createdAt: number;
}

/**
 * Validates login credentials against environment variables or default owner credentials.
 */
export function validateCredentials(email: string, password: string): { valid: boolean; user?: AdminUser } {
  const adminEmail = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
  const adminPassword = (process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD).trim();

  if (email.trim().toLowerCase() === adminEmail && password.trim() === adminPassword) {
    return {
      valid: true,
      user: {
        email: adminEmail,
        role: 'owner',
        name: 'Bob & Reina',
        createdAt: Date.now(),
      },
    };
  }

  return { valid: false };
}

/**
 * Creates an HMAC SHA-256 signature for a token payload.
 */
function createSignature(payload: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
}

/**
 * Generates a signed session token.
 */
export function generateSessionToken(user: AdminUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64url');
  const signature = createSignature(payload);
  return `${payload}.${signature}`;
}

/**
 * Verifies and parses a signed session token.
 */
export function verifySessionToken(token: string): AdminUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payload, signature] = parts;
    const expectedSignature = createSignature(payload);

    if (signature !== expectedSignature) {
      return null;
    }

    const json = Buffer.from(payload, 'base64url').toString('utf-8');
    const user = JSON.parse(json) as AdminUser;

    // Check expiration (7 days)
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - user.createdAt > sevenDaysMs) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

/**
 * Sets the admin session cookie on the outgoing response.
 */
export async function setAdminSession(user: AdminUser): Promise<void> {
  const token = generateSessionToken(user);
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
}

/**
 * Deletes the admin session cookie.
 */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

/**
 * Retrieves the current authenticated admin user from cookies.
 */
export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
