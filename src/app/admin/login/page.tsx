'use client';

import { useActionState, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { loginAction, type LoginState } from '@/app/actions/auth';
import Button from '@/components/ui/Button';
import styles from './Login.module.css';

const INITIAL: LoginState = {};

// Sign-in for the owner dashboard. Nothing is pre-filled and there are no demo credentials:
// the email and password live only in the server settings.
export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className={styles.screen} data-admin>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            <Image src="/logo.webp" alt="" width={48} height={48} priority />
          </span>
          <div>
            <span className={styles.eyebrow}>Owner dashboard</span>
            <h1 className={styles.title}>The Queen&apos;s Corn</h1>
          </div>
        </div>

        <p className={styles.text}>Sign in to manage events, flavors and fundraisers on the website.</p>

        {state.error && (
          <p className={styles.error} role="alert">
            <AlertTriangle size={18} aria-hidden="true" />
            {state.error}
          </p>
        )}

        <form action={formAction} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="admin-email">Email</label>
            <input id="admin-email" name="email" type="email" autoComplete="username" maxLength={200} required />
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="admin-password">Password</label>
              <button type="button" onClick={() => setShowPassword((s) => !s)} aria-pressed={showPassword}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="admin-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              maxLength={200}
              required
            />
          </div>

          <Button type="submit" variant="red" fullWidth disabled={pending}>
            {pending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <Link href="/" className={styles.back}>
          ← Back to the website
        </Link>
      </div>
    </main>
  );
}
