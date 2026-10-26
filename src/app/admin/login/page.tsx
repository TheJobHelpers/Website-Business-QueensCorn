'use client';

import { useActionState, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { loginAction, type LoginState } from '@/app/actions/auth';
import Button from '@/components/ui/Button';
import styles from './Login.module.css';

const INITIAL: LoginState = {};

// Sign-in for the owner dashboard: email, password and the code from an authenticator app,
// checked together. The first time, the right password shows a QR code to add the dashboard to
// the app instead (once per account). Nothing is pre-filled and there are no demo credentials:
// the accounts live only in the server settings.
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

        {state.setup ? (
          <>
            <div>
              <h2 className={styles.subtitle}>Set up your phone</h2>
              <p className={styles.text}>
                First time here. Add the dashboard to an authenticator app on your phone: from then on, it gives you the code to
                sign in. You only do this once.
              </p>
            </div>

            {state.error && (
              <p className={styles.error} role="alert">
                <AlertTriangle size={18} aria-hidden="true" />
                {state.error}
              </p>
            )}

            <form action={formAction} className={styles.form}>
              <input type="hidden" name="step" value="setup" />
              <ol className={styles.steps}>
                <li>
                  On your phone, install <b>Google Authenticator</b> or <b>Microsoft Authenticator</b> (free, from the App Store
                  or Google Play).
                </li>
                <li>
                  In the app, tap <b>+</b>, choose <b>Scan a QR code</b>, and point your phone at this code:
                  <span className={styles.qr}>
                    <Image src={state.setup.qr} alt="QR code that adds The Queen's Corn to your authenticator app" width={200} height={200} unoptimized />
                  </span>
                  <details className={styles.manual}>
                    <summary>Can&apos;t scan it?</summary>
                    Tap <b>+</b>, then <b>Enter a setup key</b>. Name: The Queen&apos;s Corn. Key: <code>{state.setup.key}</code>.
                    Type of key: Time based.
                  </details>
                </li>
                <li>
                  <label htmlFor="admin-setup-code">Type the 6-digit code the app now shows:</label>
                </li>
              </ol>

              <div className={styles.field}>
                <input
                  id="admin-setup-code"
                  name="code"
                  className={styles.code}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9 ]*"
                  maxLength={7}
                  autoFocus
                  required
                />
              </div>

              <Button type="submit" variant="red" fullWidth disabled={pending}>
                {pending ? 'Checking…' : 'Finish and sign in'}
              </Button>
              <p className={styles.hint}>Keep the backup codes you were given somewhere safe: they let you in if you lose this phone.</p>
            </form>

            <a href="/admin/login" className={styles.back}>
              Start again
            </a>
          </>
        ) : (
          <>
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

              <div className={styles.field}>
                <label htmlFor="admin-code">6-digit code</label>
                <input
                  id="admin-code"
                  name="code"
                  className={styles.code}
                  inputMode="text"
                  autoComplete="one-time-code"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={20}
                  aria-describedby="admin-code-hint"
                />
                <p id="admin-code-hint" className={styles.hint}>
                  From the authenticator app on your phone. <b>First time?</b> Leave it empty: you will set up your phone next. Lost
                  your phone? Type one of your backup codes.
                </p>
              </div>

              <Button type="submit" variant="red" fullWidth disabled={pending}>
                {pending ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <Link href="/" className={styles.back}>
              ← Back to the website
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
