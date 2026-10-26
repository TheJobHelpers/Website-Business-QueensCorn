import 'server-only';
import crypto from 'crypto';
import type { AdminConfig, EnvAccount } from './config';
import { isBackupCodeHash, isEmail } from './config';
import { requireAuthStore } from './kv';
import { parsePasswordHash, type PasswordHash } from './password';
import { seal, unseal } from './sealed';
import { decodeBase32, encodeBase32 } from './totp';

// Everyone who can sign in to the dashboard:
//   - super admins, defined in the server settings (./config.ts). They can manage the other
//     admins and can never be removed or locked out from the dashboard. Changes they make to
//     their own password, phone or backup codes are kept as a sealed override in the database.
//   - admins added from the dashboard by a super admin, kept sealed in the database. They start
//     as "invited" and can sign in once they have finished their invite link.

export type AdminRole = 'super' | 'admin';

export interface AdminAccount {
  /** "1".."9" for super admins (the number in their variable names), "a_…" for the others */
  id: string;
  email: string;
  role: AdminRole;
  source: 'env' | 'db';
  /** "invited": the invite link has not been finished yet, so they cannot sign in */
  status: 'active' | 'invited';
  password: PasswordHash | null;
  totpSecret: Buffer | null;
  backupCodeHashes: string[];
  addedBy?: string;
  addedAt?: string;
}

/** An account that can sign in. */
export type ActiveAccount = AdminAccount & { status: 'active'; password: PasswordHash; totpSecret: Buffer };

export const isActive = (account: AdminAccount): account is ActiveAccount =>
  account.status === 'active' && account.password !== null && account.totpSecret !== null;

// ---------------- what is stored ----------------

interface StoredAdmin {
  id: string;
  email: string;
  status: 'active' | 'invited';
  passwordHash?: string;
  /** base32 */
  totpSecret?: string;
  backupCodeHashes: string[];
  addedBy: string;
  addedAt: string;
}

interface StoredOverride {
  /** the server settings this override was made on top of: if they change, it no longer applies */
  basedOn: string;
  passwordHash?: string;
  totpSecret?: string;
  backupCodeHashes?: string[];
}

const INDEX_KEY = 'qc_auth:admins';
const adminKey = (id: string) => `qc_auth:admin:${id}`;
const overrideKey = (id: string) => `qc_auth:override:${id}`;
const envFingerprint = (account: EnvAccount) =>
  crypto
    .createHash('sha256')
    .update(`${account.email}|${account.password.salt.toString('base64url')}|${account.totpSecret.toString('base64url')}`)
    .digest('hex')
    .slice(0, 32);

const toSecret = (base32: string | undefined) => (base32 ? decodeBase32(base32) : null);
const toHashes = (hashes: string[] | undefined) => (hashes ?? []).filter(isBackupCodeHash);

// ---------------- reading ----------------

async function envAccountWithOverride(account: EnvAccount): Promise<AdminAccount> {
  const base: AdminAccount = {
    id: account.id,
    email: account.email,
    role: 'super',
    source: 'env',
    status: 'active',
    password: account.password,
    totpSecret: account.totpSecret,
    backupCodeHashes: account.backupCodeHashes,
  };
  const override = unseal<StoredOverride>(await requireAuthStore().get(overrideKey(account.id)), overrideKey(account.id));
  if (!override || override.basedOn !== envFingerprint(account)) return base;
  return {
    ...base,
    password: (override.passwordHash && parsePasswordHash(override.passwordHash)) || base.password,
    totpSecret: toSecret(override.totpSecret) ?? base.totpSecret,
    backupCodeHashes: override.backupCodeHashes ? toHashes(override.backupCodeHashes) : base.backupCodeHashes,
  };
}

function fromStored(stored: StoredAdmin): AdminAccount {
  const password = stored.passwordHash ? parsePasswordHash(stored.passwordHash) : null;
  const totpSecret = toSecret(stored.totpSecret);
  return {
    id: stored.id,
    email: stored.email,
    role: 'admin',
    source: 'db',
    status: stored.status === 'active' && password && totpSecret ? 'active' : 'invited',
    password,
    totpSecret,
    backupCodeHashes: toHashes(stored.backupCodeHashes),
    addedBy: stored.addedBy,
    addedAt: stored.addedAt,
  };
}

async function readStored(id: string): Promise<StoredAdmin | null> {
  const stored = unseal<StoredAdmin>(await requireAuthStore().get(adminKey(id)), adminKey(id));
  return stored && stored.id === id ? stored : null;
}

/** Every account: super admins first, then the admins added from the dashboard (oldest first). */
export async function listAccounts(config: AdminConfig): Promise<AdminAccount[]> {
  const supers = await Promise.all(config.envAccounts.map(envAccountWithOverride));
  const ids = await requireAuthStore().setMembers(INDEX_KEY);
  const others = (await Promise.all(ids.map(readStored)))
    .filter((stored): stored is StoredAdmin => stored !== null)
    // a super admin's email always wins
    .filter((stored) => !supers.some((s) => s.email === stored.email))
    .map(fromStored)
    .sort((a, b) => (a.addedAt ?? '').localeCompare(b.addedAt ?? ''));
  return [...supers, ...others];
}

/** The account that may sign in with this email, if any. */
export function findActiveAccount(accounts: AdminAccount[], email: string): ActiveAccount | undefined {
  const wanted = email.trim().toLowerCase();
  return accounts.filter(isActive).find((account) => account.email === wanted);
}

// ---------------- changing ----------------

export class AdminChangeError extends Error {}

/** A super admin adds someone: they are "invited" until they finish their invite link. */
export async function addAdmin(accounts: AdminAccount[], email: string, addedBy: string): Promise<AdminAccount> {
  const clean = email.trim().toLowerCase();
  if (!isEmail(clean)) throw new AdminChangeError('That does not look like an email address.');
  if (accounts.some((account) => account.email === clean)) throw new AdminChangeError('That email already has an account.');
  const stored: StoredAdmin = {
    id: `a_${crypto.randomBytes(9).toString('base64url')}`,
    email: clean,
    status: 'invited',
    backupCodeHashes: [],
    addedBy,
    addedAt: new Date().toISOString(),
  };
  const store = requireAuthStore();
  await store.set(adminKey(stored.id), seal(stored, adminKey(stored.id)));
  await store.addToSet(INDEX_KEY, stored.id);
  return fromStored(stored);
}

export async function removeAdmin(account: AdminAccount): Promise<void> {
  if (account.source !== 'db') throw new AdminChangeError('Super admins are set in the server settings and cannot be removed here.');
  const store = requireAuthStore();
  await store.removeFromSet(INDEX_KEY, account.id);
  await store.del(adminKey(account.id));
}

/** Back to "invited": the old password, phone and backup codes stop working at once. */
export async function resetAdmin(account: AdminAccount): Promise<void> {
  if (account.source !== 'db') throw new AdminChangeError('Super admins reset their sign-in from the server settings.');
  const stored = await readStored(account.id);
  if (!stored) throw new AdminChangeError('That admin no longer exists.');
  const reset: StoredAdmin = { ...stored, status: 'invited', passwordHash: undefined, totpSecret: undefined, backupCodeHashes: [] };
  await requireAuthStore().set(adminKey(account.id), seal(reset, adminKey(account.id)));
}

export interface CredentialChange {
  passwordHash?: string;
  totpSecret?: Buffer;
  backupCodeHashes?: string[];
  /** finishing an invite */
  activate?: boolean;
}

/** Saves a new password, phone or backup codes (an override for super admins). */
export async function changeCredentials(config: AdminConfig, account: AdminAccount, change: CredentialChange): Promise<void> {
  const store = requireAuthStore();
  if (account.source === 'env') {
    const envAccount = config.envAccounts.find((a) => a.id === account.id);
    if (!envAccount) throw new AdminChangeError('That account no longer exists.');
    const current = unseal<StoredOverride>(await store.get(overrideKey(account.id)), overrideKey(account.id));
    const basedOn = envFingerprint(envAccount);
    const next: StoredOverride = {
      ...(current && current.basedOn === basedOn ? current : {}),
      basedOn,
      ...(change.passwordHash ? { passwordHash: change.passwordHash } : {}),
      ...(change.totpSecret ? { totpSecret: encodeBase32(change.totpSecret) } : {}),
      ...(change.backupCodeHashes ? { backupCodeHashes: change.backupCodeHashes } : {}),
    };
    await store.set(overrideKey(account.id), seal(next, overrideKey(account.id)));
    return;
  }

  const stored = await readStored(account.id);
  if (!stored) throw new AdminChangeError('That account no longer exists.');
  const next: StoredAdmin = {
    ...stored,
    ...(change.passwordHash ? { passwordHash: change.passwordHash } : {}),
    ...(change.totpSecret ? { totpSecret: encodeBase32(change.totpSecret) } : {}),
    ...(change.backupCodeHashes ? { backupCodeHashes: change.backupCodeHashes } : {}),
    ...(change.activate ? { status: 'active' as const } : {}),
  };
  await store.set(adminKey(account.id), seal(next, adminKey(account.id)));
}
