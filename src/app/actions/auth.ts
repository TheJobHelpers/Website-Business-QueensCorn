'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminConfig } from '@/server/auth/config';
import { verifyCredentials } from '@/server/auth/credentials';
import { endAdminSession, startAdminSession } from '@/server/auth/guard';
import { clearLoginFailures, loginLockMinutes, recordLoginFailure } from '@/server/auth/rate-limit';

export interface LoginState {
  error?: string;
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function clientAddress(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
}

/** Sign in. One message for every kind of wrong answer, so nothing leaks about which part was wrong. */
export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').slice(0, 200);
  const password = String(formData.get('password') ?? '').slice(0, 200);
  const address = await clientAddress();

  const locked = loginLockMinutes(address);
  if (locked > 0) {
    return { error: `Too many attempts. Try again in ${locked} minute${locked === 1 ? '' : 's'}.` };
  }

  const result = getAdminConfig();
  if (!result.ok) {
    console.error('Admin sign-in is switched off:', result.problems.join(' '));
    return { error: 'Sign-in is not set up on this server yet. Ask whoever manages the website.' };
  }

  if (!email || !password || !verifyCredentials(email, password, result.config)) {
    recordLoginFailure(address);
    await pause(400);
    return { error: 'That email and password do not match.' };
  }

  clearLoginFailures(address);
  await startAdminSession(result.config.email, result.config.sessionSecret);
  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  await endAdminSession();
  redirect('/admin/login');
}
