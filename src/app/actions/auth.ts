'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ActionResult } from '@/lib/action-result';
import { adminAction } from '@/server/admin-action';
import { recordActivity, requester } from '@/server/auth/audit';
import { getAdminConfig, type AdminConfig } from '@/server/auth/config';
import { changeCredentials, findActiveAccount, isActive, listAccounts, type ActiveAccount } from '@/server/auth/directory';
import {
  SETUP_COOKIE,
  SETUP_COOKIE_SECONDS,
  endPhoneSetup,
  isPhoneSetUp,
  markPhoneSetUp,
  phoneSetupDetails,
  readPhoneSetup,
  startPhoneSetup,
  type PhoneSetup,
} from '@/server/auth/enrollment';
import { clearAdminCookie, endAdminSession, getAdmin, requireAdmin, startAdminSession } from '@/server/auth/guard';
import { readInvite, revokeInvites } from '@/server/auth/invites';
import { getAuthStore, requireAuthStore } from '@/server/auth/kv';
import { burnPasswordCheck, hashPassword, parsePasswordHash, passwordProblem, verifyPassword } from '@/server/auth/password';
import { clearSignInFailures, recordSignInFailure, signInPauseMinutes } from '@/server/auth/rate-limit';
import { backupUsedKey, checkSecondStep, consumeAppCode, type Requester } from '@/server/auth/second-step';
import { endAllSessions } from '@/server/auth/sessions';
import { newBackupCodes } from '@/server/auth/totp';

export interface LoginState {
  error?: string;
  /** first sign-in of a super admin: the QR code to scan before the first code can be typed */
  setup?: PhoneSetup;
}

// One message for every kind of wrong answer, so nothing leaks about which part was wrong.
const WRONG = 'That email, password or code is not right.';
const NOT_SET_UP = 'Sign-in is not set up on this server yet. Ask whoever manages the website.';
const UNAVAILABLE = 'Sign-in is not available right now. Try again in a moment.';
const WRONG_FIRST_CODE = "That code is not right. Type the 6 digits the app shows under \"The Queen's Corn\" right now.";

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const field = (formData: FormData, name: string, max: number) => String(formData.get(name) ?? '').slice(0, max);

async function setSetupCookie(token: string, maxAge: number): Promise<void> {
  (await cookies()).set(SETUP_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/admin',
    maxAge,
  });
}

function signInConfig(): AdminConfig | null {
  const result = getAdminConfig();
  if (!result.ok || !getAuthStore()) {
    console.error('Admin sign-in is switched off:', result.problems.join(' '), getAuthStore() ? '' : 'No sign-in database.');
    return null;
  }
  return result.config;
}

/**
 * Sign in with email, password and the 6-digit code, all checked together. The very first time
 * for a super admin (code left empty, phone not set up yet), the right password shows the QR
 * code instead. Returns what the sign-in page should show, or sends a signed-in person on.
 */
export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const config = signInConfig();
  if (!config) return { error: NOT_SET_UP };
  const from = await requester();

  let outcome: LoginState | null;
  try {
    const accounts = (await listAccounts(config)).filter(isActive);
    outcome =
      formData.get('step') === 'setup'
        ? await finishPhoneSetup(formData, config, accounts, from)
        : await signIn(formData, config, accounts, from);
  } catch (err) {
    console.error('Admin sign-in failed:', err);
    return { error: UNAVAILABLE };
  }
  if (outcome) return outcome;
  redirect('/admin');
}

/** null when signed in. */
async function signIn(formData: FormData, config: AdminConfig, accounts: ActiveAccount[], from: Requester): Promise<LoginState | null> {
  const email = field(formData, 'email', 200);
  const password = field(formData, 'password', 200);
  const code = field(formData, 'code', 20);
  const account = findActiveAccount(accounts, email) ?? null;
  const who = account?.email ?? 'someone else';

  const paused = await signInPauseMinutes(from.address, account?.id ?? null);
  if (paused > 0) {
    await recordActivity({ kind: 'paused', who, ...from });
    return { error: `Too many tries. Wait ${paused} minutes, then try again.` };
  }

  // a wrong email still pays for a full password check, so timing does not reveal the accounts
  const passwordOk = account ? await verifyPassword(password, account.password) : (await burnPasswordCheck(password), false);

  // a super admin's first sign-in: no code yet, and their phone has never been set up
  if (account && passwordOk && account.source === 'env' && !code.trim() && !(await isPhoneSetUp(account))) {
    await setSetupCookie(await startPhoneSetup(account), SETUP_COOKIE_SECONDS);
    return { setup: await phoneSetupDetails(account.email, account.totpSecret) };
  }

  const via = account && passwordOk ? await checkSecondStep(account, code) : null;
  if (!account || !passwordOk || !via) {
    await recordSignInFailure(from.address, account?.id ?? null);
    // a right password with a wrong code is worth knowing about: someone may have the password
    await recordActivity({ kind: passwordOk ? 'wrong-code' : 'failed', who, ...from });
    await pause(400);
    return { error: WRONG };
  }

  // a code from the app also proves the phone is set up (e.g. it was added with the script)
  if (via === 'app' && !(await isPhoneSetUp(account))) await markPhoneSetUp(account);
  await clearSignInFailures(from.address, account.id);
  await startAdminSession(account.email, config.sessionSecret);
  await recordActivity({ kind: via === 'backup' ? 'signed-in-backup-code' : 'signed-in', who, ...from });
  return null;
}

/** First sign-in, second half: the first code from the newly added app finishes the setup. null when signed in. */
async function finishPhoneSetup(
  formData: FormData,
  config: AdminConfig,
  accounts: ActiveAccount[],
  from: Requester
): Promise<LoginState | null> {
  const token = (await cookies()).get(SETUP_COOKIE)?.value ?? '';
  const account = await readPhoneSetup(token, accounts);
  if (!account) {
    await setSetupCookie('', 0);
    return { error: 'Setting up took too long. Sign in again to see the QR code.' };
  }

  const paused = await signInPauseMinutes(from.address, account.id);
  if (paused > 0) {
    await recordActivity({ kind: 'paused', who: account.email, ...from });
    return { error: `Too many tries. Wait ${paused} minutes, then sign in again.` };
  }

  if (!(await consumeAppCode(account.id, account.totpSecret, field(formData, 'code', 20)))) {
    await recordSignInFailure(from.address, account.id);
    await recordActivity({ kind: 'wrong-code', who: account.email, ...from });
    await pause(400);
    return { setup: await phoneSetupDetails(account.email, account.totpSecret), error: WRONG_FIRST_CODE };
  }

  await markPhoneSetUp(account);
  await endPhoneSetup(token);
  await setSetupCookie('', 0);
  await clearSignInFailures(from.address, account.id);
  await startAdminSession(account.email, config.sessionSecret);
  await recordActivity({ kind: 'phone-set-up', who: account.email, ...from });
  return null;
}

export interface InviteState {
  error?: string;
  /** the link no longer works: show the "ask for a new link" message */
  expired?: boolean;
  /** finished: the new backup codes, shown once */
  backupCodes?: string[];
}

/**
 * The invite link: an admin added from the dashboard (or whose sign-in was reset) chooses a
 * password, adds the QR code to their phone and types the first code. Then they are signed in
 * and see their backup codes once.
 */
export async function acceptInviteAction(_previous: InviteState, formData: FormData): Promise<InviteState> {
  const config = signInConfig();
  if (!config) return { error: NOT_SET_UP };
  const from = await requester();
  const token = field(formData, 'token', 100);
  const password = field(formData, 'password', 201);
  const confirm = field(formData, 'confirm', 201);
  const code = field(formData, 'code', 20);

  try {
    const invite = await readInvite(token, await listAccounts(config));
    if (!invite) return { expired: true, error: 'This link has expired or was already used.' };
    const { account, secret } = invite;

    const paused = await signInPauseMinutes(from.address, account.id);
    if (paused > 0) return { error: `Too many tries. Wait ${paused} minutes, then try again.` };

    const weak = passwordProblem(password, confirm, account.email);
    if (weak) return { error: weak };

    if (!(await consumeAppCode(account.id, secret, code))) {
      await recordSignInFailure(from.address, account.id);
      await recordActivity({ kind: 'wrong-code', who: account.email, ...from });
      await pause(400);
      return { error: WRONG_FIRST_CODE };
    }

    const passwordHash = await hashPassword(password);
    const backup = newBackupCodes();
    await changeCredentials(config, account, { passwordHash, totpSecret: secret, backupCodeHashes: backup.hashes, activate: true });
    await revokeInvites(account.id);
    await requireAuthStore().del(backupUsedKey(account.id));
    const active: ActiveAccount = { ...account, status: 'active', password: parsePasswordHash(passwordHash)!, totpSecret: secret };
    await markPhoneSetUp(active);
    await clearSignInFailures(from.address, account.id);
    await startAdminSession(account.email, config.sessionSecret);
    await recordActivity({ kind: 'invite-accepted', who: account.email, ...from });
    return { backupCodes: backup.codes };
  } catch (err) {
    console.error('Finishing an invite failed:', err);
    return { error: UNAVAILABLE };
  }
}

export async function logoutAction(): Promise<void> {
  const session = await getAdmin();
  await endAdminSession(session?.email);
  if (session) await recordActivity({ kind: 'signed-out', who: session.email, ...(await requester()) });
  redirect('/admin/login');
}

/** Ends every session of the signed-in person, this one included (e.g. after losing a phone). */
export async function signOutEverywhereAction(): Promise<ActionResult> {
  return adminAction(async () => {
    const session = await requireAdmin();
    await endAllSessions(session.email);
    await clearAdminCookie();
    await recordActivity({ kind: 'signed-out-everywhere', who: session.email, ...(await requester()) });
    // logged above as its own kind of event, not as a change
  }, 'Signed out on every device.', '');
}
