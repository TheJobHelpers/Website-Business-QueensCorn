'use server';

import type { ActionResult } from '@/lib/action-result';
import { adminAction } from '@/server/admin-action';
import { recordActivity, requester } from '@/server/auth/audit';
import { getAdminConfig } from '@/server/auth/config';
import { changeCredentials, type ActiveAccount } from '@/server/auth/directory';
import {
  endPhoneReplacement,
  markPhoneSetUp,
  pendingPhoneReplacement,
  phoneSetupDetails,
  startPhoneReplacement,
  type PhoneSetup,
} from '@/server/auth/enrollment';
import { UnauthorizedError, currentAccount, startAdminSession } from '@/server/auth/guard';
import { requireAuthStore } from '@/server/auth/kv';
import { hashPassword, passwordProblem } from '@/server/auth/password';
import { recordSignInFailure } from '@/server/auth/rate-limit';
import { dataKeyProblem } from '@/server/auth/sealed';
import { backupUsedKey, confirmIdentity, consumeAppCode } from '@/server/auth/second-step';
import { endAllSessions } from '@/server/auth/sessions';
import { newBackupCodes } from '@/server/auth/totp';
import { ValidationError } from '@/server/validation';

// Changes to one's own sign-in, from Settings: replace the phone, get new backup codes, change
// the password. Each one first asks for the password and a fresh code ("confirm it's you"), so a
// signed-in browser left open is not enough to take over the account.

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.slice(0, max) : '');

/** The signed-in person's account, after checking their password and a fresh code. */
async function confirmedAccount(input: Record<string, unknown>): Promise<ActiveAccount> {
  const keyProblem = dataKeyProblem();
  if (keyProblem) throw new ValidationError({ form: `This cannot be changed here yet: ${keyProblem}` });
  const account = await currentAccount();
  if (!account) throw new UnauthorizedError();
  const problem = await confirmIdentity(account, text(input.password, 200), text(input.code, 20), await requester());
  if (problem) throw new ValidationError({ form: problem });
  return account;
}

function adminConfig() {
  const config = getAdminConfig();
  if (!config.ok) throw new UnauthorizedError();
  return config.config;
}

/** Replace my phone, first half: after "confirm it's you", the QR code for the new phone. */
export async function startReplacePhoneAction(input: unknown): Promise<ActionResult<PhoneSetup>> {
  return adminAction(async () => {
    const account = await confirmedAccount((input ?? {}) as Record<string, unknown>);
    return phoneSetupDetails(account.email, await startPhoneReplacement(account));
  }, undefined, '');
}

/** Replace my phone, second half: the first code from the new phone makes it the one that counts. */
export async function finishReplacePhoneAction(code: unknown): Promise<ActionResult> {
  return adminAction(async () => {
    const account = await currentAccount();
    if (!account) throw new UnauthorizedError();
    const from = await requester();
    const secret = await pendingPhoneReplacement(account);
    if (!secret) throw new ValidationError({ form: 'That took too long. Start again to get a new QR code.' });
    if (!(await consumeAppCode(account.id, secret, text(code, 20)))) {
      await recordSignInFailure(from.address, account.id);
      throw new ValidationError({ form: "That code is not right. Type the 6 digits the new phone shows under \"The Queen's Corn\" right now." });
    }
    await changeCredentials(adminConfig(), account, { totpSecret: secret });
    await endPhoneReplacement(account);
    await markPhoneSetUp({ ...account, totpSecret: secret });
    await recordActivity({ kind: 'phone-replaced', who: account.email, ...from });
  }, 'Your new phone is set up. Codes from the old one no longer work.', '');
}

/** Ten new backup codes, shown once. The old ones stop working. */
export async function newBackupCodesAction(input: unknown): Promise<ActionResult<string[]>> {
  return adminAction(async () => {
    const account = await confirmedAccount((input ?? {}) as Record<string, unknown>);
    const backup = newBackupCodes();
    await changeCredentials(adminConfig(), account, { backupCodeHashes: backup.hashes });
    await requireAuthStore().del(backupUsedKey(account.id));
    await recordActivity({ kind: 'backup-codes-renewed', who: account.email, ...(await requester()) });
    return backup.codes;
  }, 'New backup codes made. The old ones no longer work.', '');
}

/** A new password. Every other device is signed out; this one stays signed in. */
export async function changePasswordAction(input: unknown): Promise<ActionResult> {
  return adminAction(async () => {
    const fields = (input ?? {}) as Record<string, unknown>;
    const account = await confirmedAccount(fields);
    const password = text(fields.newPassword, 201);
    const weak = passwordProblem(password, text(fields.confirm, 201), account.email);
    if (weak) throw new ValidationError({ newPassword: weak, form: weak });
    const passwordHash = await hashPassword(password);
    const config = adminConfig();
    await changeCredentials(config, account, { passwordHash });
    await endAllSessions(account.email);
    await startAdminSession(account.email, config.sessionSecret);
    await recordActivity({ kind: 'password-changed', who: account.email, ...(await requester()) });
  }, 'Password changed. Other devices have been signed out.', '');
}
