'use server';

import { redirect } from 'next/navigation';
import { validateCredentials, setAdminSession, clearAdminSession, getCurrentAdminUser } from '@/lib/auth';

export interface AuthState {
  success: boolean;
  error?: string;
}

/**
 * Server action to handle admin login submission.
 */
export async function loginAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get('email') as string) || '';
  const password = (formData.get('password') as string) || '';

  if (!email.trim() || !password.trim()) {
    return {
      success: false,
      error: 'Please enter both email and password.',
    };
  }

  const { valid, user } = validateCredentials(email, password);

  if (!valid || !user) {
    return {
      success: false,
      error: 'Invalid email or password. Please check your credentials.',
    };
  }

  await setAdminSession(user);

  return {
    success: true,
  };
}

/**
 * Server action to log out of the admin portal.
 */
export async function logoutAction(): Promise<void> {
  await clearAdminSession();
  redirect('/admin/login');
}

/**
 * Server action to check session status.
 */
export async function checkAdminSessionAction(): Promise<{ authenticated: boolean; email?: string; name?: string }> {
  const user = await getCurrentAdminUser();
  if (!user) {
    return { authenticated: false };
  }
  return {
    authenticated: true,
    email: user.email,
    name: user.name,
  };
}
