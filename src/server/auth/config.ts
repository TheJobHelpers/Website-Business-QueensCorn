import 'server-only';
import crypto from 'crypto';
import { parsePasswordHash, type PasswordHash } from './password';
import { decodeBase32 } from './totp';

// Sign-in settings read from environment variables only. There are no built-in defaults: if
// anything is missing or weak, that account (or all sign-in) is switched off rather than left
// guessable.
//
// The super admins are defined here, so they can never be removed or locked out from the
// dashboard. Each has a numbered set, made with scripts/admin-account.mjs:
//
//   ADMIN_1_EMAIL          their email
//   ADMIN_1_PASSWORD_HASH  scrypt hash of their password (never the password itself)
//   ADMIN_1_TOTP_SECRET    the authenticator app secret: the second step is required
//   ADMIN_1_BACKUP_CODES   SHA-256 of their one-time backup codes, comma separated (optional)
//
// ... up to ADMIN_9_*. ADMIN_SESSION_SECRET signs the session cookie for everyone, and
// ADMIN_DATA_KEY seals the admins added from the dashboard (./sealed.ts, ./directory.ts).

export interface EnvAccount {
  /** "1".."9": the number in the variable names */
  id: string;
  email: string;
  password: PasswordHash;
  totpSecret: Buffer;
  backupCodeHashes: string[];
}

export interface AdminConfig {
  /** the super admins */
  envAccounts: EnvAccount[];
  sessionSecret: string;
}

export type AdminConfigResult = { ok: true; config: AdminConfig; problems: string[] } | { ok: false; problems: string[] };

const MAX_ACCOUNTS = 9;
const MIN_SECRET_LENGTH = 32;
/** 160 bits, as RFC 4226 recommends */
const MIN_TOTP_SECRET_BYTES = 20;

// SHA-256 of the session secret that used to be hardcoded in this repo. It is public (in the git
// history), so it is refused even if someone sets it on purpose.
const LEAKED_VALUE_HASHES = new Set([
  'b4138e393ffedaf71645364f27f115a2a900e0f6c61615aeaeb05f8b7a976a90',
  '59c55436b01ea15b816dfe31931930581d3a897a243fd2f5a7b97a75b1ecb107',
]);
const isLeaked = (value: string) => LEAKED_VALUE_HASHES.has(crypto.createHash('sha256').update(value).digest('hex'));

const setting = (name: string) => (process.env[name] ?? '').trim();

export const isEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isBackupCodeHash = (hash: string) => /^[0-9a-f]{64}$/.test(hash);

function readAccount(id: string, problems: string[]): EnvAccount | null {
  const name = (field: string) => `ADMIN_${id}_${field}`;
  const email = setting(name('EMAIL')).toLowerCase();
  if (!email) return null;

  const before = problems.length;
  if (!isEmail(email)) problems.push(`${name('EMAIL')} is not an email address.`);

  const password = parsePasswordHash(setting(name('PASSWORD_HASH')));
  if (!password) {
    problems.push(`${name('PASSWORD_HASH')} is missing or not a hash from scripts/admin-account.mjs.`);
  }

  const totpSecret = decodeBase32(setting(name('TOTP_SECRET')));
  if (!totpSecret || totpSecret.length < MIN_TOTP_SECRET_BYTES) {
    problems.push(`${name('TOTP_SECRET')} is missing or too short: every account needs the authenticator step.`);
  }

  const backupCodeHashes = setting(name('BACKUP_CODES'))
    .split(',')
    .map((code) => code.trim().toLowerCase())
    .filter(Boolean);
  if (!backupCodeHashes.every(isBackupCodeHash)) {
    problems.push(`${name('BACKUP_CODES')} must be the hashes printed by scripts/admin-account.mjs.`);
  }

  if (problems.length > before || !password || !totpSecret) {
    problems.push(`Super admin ${id} (${email}) cannot sign in until this is fixed.`);
    return null;
  }
  return { id, email, password, totpSecret, backupCodeHashes };
}

export function getAdminConfig(): AdminConfigResult {
  const problems: string[] = [];

  const envAccounts: EnvAccount[] = [];
  for (let n = 1; n <= MAX_ACCOUNTS; n += 1) {
    const account = readAccount(String(n), problems);
    if (!account) continue;
    if (envAccounts.some((other) => other.email === account.email)) {
      problems.push(`ADMIN_${n}_EMAIL repeats another account's email; account ${n} is switched off.`);
      continue;
    }
    envAccounts.push(account);
  }
  if (envAccounts.length === 0) problems.push('No super admin is set up (ADMIN_1_EMAIL and the rest).');

  // the single-account settings of the first version: no second step, possibly a plain password
  const legacy = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_PASSWORD_HASH'].filter((key) => setting(key));
  if (legacy.length > 0) problems.push(`${legacy.join(', ')} are no longer used and can be deleted.`);

  const sessionSecret = setting('ADMIN_SESSION_SECRET');
  let secretOk = false;
  if (!sessionSecret) {
    problems.push('ADMIN_SESSION_SECRET is not set.');
  } else if (sessionSecret.length < MIN_SECRET_LENGTH) {
    problems.push(`ADMIN_SESSION_SECRET must be at least ${MIN_SECRET_LENGTH} characters.`);
  } else if (isLeaked(sessionSecret)) {
    problems.push('ADMIN_SESSION_SECRET is the old default that was published in the code. Generate a new one.');
  } else {
    secretOk = true;
  }

  if (envAccounts.length === 0 || !secretOk) return { ok: false, problems };
  return { ok: true, config: { envAccounts, sessionSecret }, problems };
}
