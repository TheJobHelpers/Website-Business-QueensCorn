'use server';

import { headers } from 'next/headers';
import type { ActionResult } from '@/lib/action-result';
import { adminAction } from '@/server/admin-action';
import { AdminChangeError, addAdmin, removeAdmin, resetAdmin, type AdminAccount } from '@/server/auth/directory';
import { getAccounts, requireSuperAdmin } from '@/server/auth/guard';
import { INVITE_HOURS, createInvite, revokeInvites } from '@/server/auth/invites';
import { requireAuthStore } from '@/server/auth/kv';
import { dataKeyProblem } from '@/server/auth/sealed';
import { backupUsedKey } from '@/server/auth/second-step';
import { endAllSessions } from '@/server/auth/sessions';
import { ValidationError } from '@/server/validation';

// Managing who can sign in: super admins only. Each action makes a one-time invite link that the
// super admin sends to the person (it is shown once and never stored in readable form).

export interface InviteLink {
  email: string;
  link: string;
  hours: number;
}

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.slice(0, max) : '');

async function inviteUrl(token: string): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}/admin/setup?token=${token}`;
}

/** A super admin, and the account the action is about (never a super admin). */
async function target(id: unknown): Promise<{ by: string; account: AdminAccount }> {
  const session = await requireSuperAdmin();
  const keyProblem = dataKeyProblem();
  if (keyProblem) throw new ValidationError({ form: keyProblem });
  const account = ((await getAccounts()) ?? []).find((a) => a.id === text(id, 40));
  if (!account) throw new ValidationError({ form: 'That admin no longer exists. Refresh the page.' });
  if (account.source !== 'db') throw new ValidationError({ form: 'Super admins are managed in the server settings, not here.' });
  return { by: session.email, account };
}

const asMessage = (err: unknown) => (err instanceof AdminChangeError ? new ValidationError({ form: err.message }) : err);

/** Add an admin: they get an invite link to choose a password and add their phone. */
export async function addAdminAction(email: unknown): Promise<ActionResult<InviteLink>> {
  let added = '';
  return adminAction(async () => {
    const session = await requireSuperAdmin();
    const keyProblem = dataKeyProblem();
    if (keyProblem) throw new ValidationError({ form: keyProblem });
    try {
      const account = await addAdmin((await getAccounts()) ?? [], text(email, 200), session.email);
      added = account.email;
      return { email: account.email, link: await inviteUrl(await createInvite(account, session.email)), hours: INVITE_HOURS };
    } catch (err) {
      throw asMessage(err);
    }
  }, 'Admin added. Send them the invite link below.', () => `Added admin ${added} and made an invite link`);
}

/** A fresh invite link (the old one stops working), e.g. when the first one expired. */
export async function newInviteLinkAction(id: unknown): Promise<ActionResult<InviteLink>> {
  let email = '';
  return adminAction(async () => {
    const { by, account } = await target(id);
    if (account.status !== 'invited') throw new ValidationError({ form: 'They have already finished their invite. Use "Reset sign-in" instead.' });
    email = account.email;
    return { email, link: await inviteUrl(await createInvite(account, by)), hours: INVITE_HOURS };
  }, 'New invite link made. The old one no longer works.', () => `Made a new invite link for ${email}`);
}

/** Lost phone, forgotten password or a worry: their sign-in stops working now, and a new invite link sets it up again. */
export async function resetAdminAction(id: unknown): Promise<ActionResult<InviteLink>> {
  let email = '';
  return adminAction(async () => {
    const { by, account } = await target(id);
    email = account.email;
    try {
      await resetAdmin(account);
    } catch (err) {
      throw asMessage(err);
    }
    await endAllSessions(account.email);
    await requireAuthStore().del(backupUsedKey(account.id));
    return { email, link: await inviteUrl(await createInvite(account, by)), hours: INVITE_HOURS };
  }, 'Their sign-in is reset and they have been signed out. Send them the new invite link.', () =>
    `Reset the sign-in of ${email}, signed them out and made a new invite link`);
}

/** Takes away someone's access: signed out everywhere at once. */
export async function removeAdminAction(id: unknown): Promise<ActionResult> {
  let email = '';
  return adminAction(async () => {
    const { account } = await target(id);
    email = account.email;
    try {
      await removeAdmin(account);
    } catch (err) {
      throw asMessage(err);
    }
    await revokeInvites(account.id);
    await endAllSessions(account.email);
    await requireAuthStore().del(backupUsedKey(account.id), `qc_auth:fail:account:${account.id}`);
  }, 'Admin removed. They have been signed out everywhere.', () => `Removed admin ${email}`);
}
