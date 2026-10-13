import 'server-only';
import crypto from 'crypto';

// Admin sign-in settings, read from environment variables only. There are no built-in
// defaults: if anything is missing or weak, sign-in is switched off rather than left guessable.

export interface AdminConfig {
  email: string;
  /** plain password (ADMIN_PASSWORD) or "scrypt$<salt>$<hash>" (ADMIN_PASSWORD_HASH) */
  password: { kind: 'plain'; value: string } | { kind: 'scrypt'; salt: Buffer; hash: Buffer };
  sessionSecret: string;
}

export type AdminConfigResult = { ok: true; config: AdminConfig } | { ok: false; problems: string[] };

const MIN_PASSWORD_LENGTH = 12;
const MIN_SECRET_LENGTH = 32;

// SHA-256 of the password and session secret that used to be hardcoded in this repo. They are
// public (in the git history), so they are refused even if someone sets them on purpose.
const LEAKED_VALUE_HASHES = new Set([
  'b4138e393ffedaf71645364f27f115a2a900e0f6c61615aeaeb05f8b7a976a90',
  '59c55436b01ea15b816dfe31931930581d3a897a243fd2f5a7b97a75b1ecb107',
]);

const sha256Hex = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
const isLeaked = (value: string) => LEAKED_VALUE_HASHES.has(sha256Hex(value));

function parsePasswordHash(raw: string): AdminConfig['password'] | null {
  const [scheme, salt, hash] = raw.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return null;
  const saltBuf = Buffer.from(salt, 'base64url');
  const hashBuf = Buffer.from(hash, 'base64url');
  if (saltBuf.length < 16 || hashBuf.length !== 64) return null;
  return { kind: 'scrypt', salt: saltBuf, hash: hashBuf };
}

export function getAdminConfig(): AdminConfigResult {
  const problems: string[] = [];

  const email = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
  if (!email || !email.includes('@')) problems.push('ADMIN_EMAIL is not set.');

  let password: AdminConfig['password'] | null = null;
  const passwordHash = (process.env.ADMIN_PASSWORD_HASH ?? '').trim();
  const plainPassword = process.env.ADMIN_PASSWORD ?? '';
  if (passwordHash) {
    password = parsePasswordHash(passwordHash);
    if (!password) problems.push('ADMIN_PASSWORD_HASH is not in the "scrypt$salt$hash" format.');
  } else if (!plainPassword) {
    problems.push('ADMIN_PASSWORD (or ADMIN_PASSWORD_HASH) is not set.');
  } else if (plainPassword.length < MIN_PASSWORD_LENGTH) {
    problems.push(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  } else if (isLeaked(plainPassword)) {
    problems.push('ADMIN_PASSWORD is the old default that was published in the code. Choose a new one.');
  } else {
    password = { kind: 'plain', value: plainPassword };
  }

  const sessionSecret = process.env.ADMIN_SESSION_SECRET ?? '';
  if (!sessionSecret) {
    problems.push('ADMIN_SESSION_SECRET is not set.');
  } else if (sessionSecret.length < MIN_SECRET_LENGTH) {
    problems.push(`ADMIN_SESSION_SECRET must be at least ${MIN_SECRET_LENGTH} characters.`);
  } else if (isLeaked(sessionSecret)) {
    problems.push('ADMIN_SESSION_SECRET is the old default that was published in the code. Generate a new one.');
  }

  if (problems.length > 0 || !password) return { ok: false, problems };
  return { ok: true, config: { email, password, sessionSecret } };
}
