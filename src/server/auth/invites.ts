import 'server-only';
import crypto from 'crypto';
import type { AdminAccount } from './directory';
import { requireAuthStore } from './kv';
import { seal, unseal } from './sealed';
import { decodeBase32, encodeBase32, newTotpSecret } from './totp';

// Invite links: how an admin added from the dashboard (or one whose sign-in was reset) sets their
// own password, adds their phone and gets their backup codes. A link works once, for 48 hours, and
// only the newest link for a person works. The authenticator secret is made when the link is made
// and kept sealed with it, so opening the link twice shows the same QR code.

export const INVITE_HOURS = 48;
const INVITE_SECONDS = INVITE_HOURS * 60 * 60;

interface StoredInvite {
  accountId: string;
  /** base32 */
  secret: string;
  createdBy: string;
}

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');
const inviteKey = (hash: string) => `qc_auth:invite:${hash}`;
/** "<token hash>|<expires at, ISO>" of the newest invite for this person */
const latestKey = (accountId: string) => `qc_auth:invite-for:${accountId}`;

export async function createInvite(account: AdminAccount, createdBy: string): Promise<string> {
  await revokeInvites(account.id);
  const token = crypto.randomBytes(32).toString('base64url');
  const hash = hashToken(token);
  const invite: StoredInvite = { accountId: account.id, secret: encodeBase32(newTotpSecret()), createdBy };
  const store = requireAuthStore();
  await store.set(inviteKey(hash), seal(invite, inviteKey(hash)), { ttlSeconds: INVITE_SECONDS });
  await store.set(latestKey(account.id), `${hash}|${new Date(Date.now() + INVITE_SECONDS * 1000).toISOString()}`, {
    ttlSeconds: INVITE_SECONDS,
  });
  return token;
}

export interface OpenInvite {
  account: AdminAccount;
  secret: Buffer;
  createdBy: string;
}

/** The invite behind a link, if the link is still valid and the person still waiting for it. */
export async function readInvite(token: string, accounts: AdminAccount[]): Promise<OpenInvite | null> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const hash = hashToken(token);
  const store = requireAuthStore();
  const invite = unseal<StoredInvite>(await store.get(inviteKey(hash)), inviteKey(hash));
  if (!invite) return null;
  const latest = (await store.get(latestKey(invite.accountId)))?.split('|')[0];
  const account = accounts.find((a) => a.id === invite.accountId);
  const secret = decodeBase32(invite.secret);
  if (latest !== hash || !account || account.source !== 'db' || account.status !== 'invited' || !secret) return null;
  return { account, secret, createdBy: invite.createdBy };
}

/** When the person's newest invite link stops working, or null if there is none. */
export async function inviteExpiresAt(accountId: string): Promise<string | null> {
  return (await requireAuthStore().get(latestKey(accountId)))?.split('|')[1] ?? null;
}

export async function revokeInvites(accountId: string): Promise<void> {
  const store = requireAuthStore();
  const latest = (await store.get(latestKey(accountId)))?.split('|')[0];
  await store.del(...(latest ? [inviteKey(latest)] : []), latestKey(accountId));
}
