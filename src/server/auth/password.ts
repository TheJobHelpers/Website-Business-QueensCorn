import 'server-only';
import crypto from 'crypto';
import { promisify } from 'util';

// Password hashes: "scrypt.<log2 N>.<r>.<p>.<salt>.<hash>" (base64url salt and hash). The cost
// is stored with each hash, so it can be raised later without breaking existing ones. No "$" in
// the format: .env files would try to read "$salt" as a variable.
// Must match scripts/admin-account.mjs, which makes these hashes.

const scrypt = promisify(crypto.scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: crypto.ScryptOptions
) => Promise<Buffer>;

/** OWASP's recommended minimum for scrypt: N = 2^17 (128 MiB), r = 8, p = 1. */
export const SCRYPT_COST = { log2N: 17, r: 8, p: 1 };
const KEY_LENGTH = 64;

export interface PasswordHash {
  log2N: number;
  r: number;
  p: number;
  salt: Buffer;
  hash: Buffer;
}

export function parsePasswordHash(raw: string): PasswordHash | null {
  const parts = raw.trim().split('.');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return null;
  const [log2N, r, p] = parts.slice(1, 4).map(Number);
  const salt = Buffer.from(parts[4], 'base64url');
  const hash = Buffer.from(parts[5], 'base64url');
  // refuse anything weaker than the recommended cost, or absurdly expensive
  if (!(log2N >= SCRYPT_COST.log2N && log2N <= 20 && r >= 8 && r <= 16 && p >= 1 && p <= 4)) return null;
  if (salt.length < 16 || hash.length !== KEY_LENGTH) return null;
  return { log2N, r, p, salt, hash };
}

const derive = (password: string, salt: Buffer, cost: { log2N: number; r: number; p: number }) =>
  scrypt(password, salt, KEY_LENGTH, {
    N: 2 ** cost.log2N,
    r: cost.r,
    p: cost.p,
    // scrypt needs 128 * N * r bytes; Node refuses more than 32 MiB unless told otherwise
    maxmem: 256 * 2 ** cost.log2N * cost.r,
  });

/** A new hash in the stored format, for passwords chosen in the dashboard. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const hash = await derive(password, salt, SCRYPT_COST);
  return `scrypt.${SCRYPT_COST.log2N}.${SCRYPT_COST.r}.${SCRYPT_COST.p}.${salt.toString('base64url')}.${hash.toString('base64url')}`;
}

export const MIN_PASSWORD_LENGTH = 12;

/** Why a new password is not acceptable, or null. */
export function passwordProblem(password: string, confirm: string, email: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters. A few random words works well.`;
  if (password.length > 200) return 'Use at most 200 characters.';
  if (password !== confirm) return 'The two passwords are different.';
  const name = email.split('@')[0]?.toLowerCase();
  if (name && name.length >= 3 && password.toLowerCase().includes(name)) return 'Do not use your email name inside the password.';
  return null;
}

export async function verifyPassword(password: string, stored: PasswordHash): Promise<boolean> {
  const derived = await derive(password, stored.salt, stored);
  return crypto.timingSafeEqual(derived, stored.hash);
}

// Checked when the email matches no account, so a wrong email takes as long as a wrong password.
let decoy: PasswordHash | null = null;

export async function burnPasswordCheck(password: string): Promise<void> {
  decoy ??= { ...SCRYPT_COST, salt: crypto.randomBytes(16), hash: crypto.randomBytes(KEY_LENGTH) };
  await verifyPassword(password, decoy);
}
