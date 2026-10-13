import 'server-only';
import crypto from 'crypto';
import type { AdminConfig } from './config';

const digest = (value: string) => crypto.createHash('sha256').update(value).digest();

/**
 * Checks an email and password against the configured admin.
 * Both parts are always compared, in constant time, so the response time does not reveal
 * which part was wrong.
 */
export function verifyCredentials(email: string, password: string, config: AdminConfig): boolean {
  const emailOk = crypto.timingSafeEqual(digest(email.trim().toLowerCase()), digest(config.email));

  let passwordOk: boolean;
  if (config.password.kind === 'scrypt') {
    const derived = crypto.scryptSync(password, config.password.salt, config.password.hash.length);
    passwordOk = crypto.timingSafeEqual(derived, config.password.hash);
  } else {
    passwordOk = crypto.timingSafeEqual(digest(password), digest(config.password.value));
  }

  return emailOk && passwordOk;
}
