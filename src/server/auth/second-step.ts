import 'server-only';
import { recordActivity } from './audit';
import type { ActiveAccount } from './directory';
import { requireAuthStore } from './kv';
import { verifyPassword } from './password';
import { recordSignInFailure, signInPauseMinutes } from './rate-limit';
import { TOTP_REPLAY_SECONDS, looksLikeBackupCode, matchBackupCode, matchTotp } from './totp';

// The second step, shared by sign-in, invite links and the "confirm it's you" checks in Settings.

/** A code from an authenticator app for `secret` that is valid now and has not been used yet. */
export async function consumeAppCode(accountId: string, secret: Buffer, rawCode: string): Promise<boolean> {
  const step = matchTotp(secret, rawCode.replace(/\s/g, ''));
  if (step === null) return false;
  return requireAuthStore().set(`qc_auth:totp-used:${accountId}:${step}`, '1', {
    ttlSeconds: TOTP_REPLAY_SECONDS,
    onlyIfNew: true,
  });
}

export const backupUsedKey = (accountId: string) => `qc_auth:backup-used:${accountId}`;

/** A code from the app, or an unused backup code. Each works once. */
export async function checkSecondStep(account: ActiveAccount, rawCode: string): Promise<'app' | 'backup' | null> {
  const code = rawCode.replace(/\s/g, '');
  if (await consumeAppCode(account.id, account.totpSecret, code)) return 'app';
  if (looksLikeBackupCode(code)) {
    const matched = matchBackupCode(code, account.backupCodeHashes);
    if (matched && (await requireAuthStore().addToSet(backupUsedKey(account.id), matched))) return 'backup';
  }
  return null;
}

export type Requester = { address: string; device: string };

/**
 * "Confirm it's you" before a change to one's own sign-in: the password and a fresh code, with
 * the same limits as signing in. Returns a message to show, or null when confirmed.
 */
export async function confirmIdentity(account: ActiveAccount, password: string, code: string, from: Requester): Promise<string | null> {
  const paused = await signInPauseMinutes(from.address, account.id);
  if (paused > 0) return `Too many tries. Wait ${paused} minutes, then try again.`;
  const passwordOk = await verifyPassword(password.slice(0, 200), account.password);
  if (passwordOk && (await checkSecondStep(account, code.slice(0, 20)))) return null;
  await recordSignInFailure(from.address, account.id);
  await recordActivity({ kind: passwordOk ? 'wrong-code' : 'failed', who: account.email, ...from });
  return 'That password or code is not right.';
}
