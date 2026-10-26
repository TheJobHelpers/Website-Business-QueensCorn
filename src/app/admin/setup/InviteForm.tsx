'use client';

import { useActionState, useState } from 'react';
import Image from 'next/image';
import { AlertTriangle } from 'lucide-react';
import { acceptInviteAction, type InviteState } from '@/app/actions/auth';
import Button from '@/components/ui/Button';
import type { PhoneSetup } from '@/server/auth/enrollment';
import styles from '../login/Login.module.css';

const INITIAL: InviteState = {};

// The invite link's form: one page, three steps, checked together on the server. Afterwards the
// person is signed in and sees their backup codes once.
export default function InviteForm({ token, email, invitedBy, setup }: { token: string; email: string; invitedBy: string; setup: PhoneSetup }) {
  const [state, formAction, pending] = useActionState(acceptInviteAction, INITIAL);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  if (state.backupCodes) {
    const codes = state.backupCodes;
    return (
      <>
        <div>
          <h2 className={styles.subtitle}>You&apos;re all set</h2>
          <p className={styles.text}>
            Last step: save your <b>backup codes</b>. Each one signs you in once if your phone is lost or not with you. They are shown only
            now, so put them in a password manager or print them, and keep them away from your phone.
          </p>
        </div>
        <ul className={styles.codes} aria-label="Your backup codes">
          {codes.map((code) => (
            <li key={code}>{code}</li>
          ))}
        </ul>
        <Button
          variant="dark"
          fullWidth
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(codes.join('\n'));
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? 'Copied' : 'Copy the codes'}
        </Button>
        <Button href="/admin" variant="red" fullWidth>
          I have saved them: go to the dashboard
        </Button>
      </>
    );
  }

  if (state.expired) {
    return (
      <>
        <h2 className={styles.subtitle}>This link no longer works</h2>
        <p className={styles.text}>Invite links work once, for 48 hours. Ask {invitedBy} for a new link.</p>
      </>
    );
  }

  return (
    <>
      <div>
        <h2 className={styles.subtitle}>Set up your sign-in</h2>
        <p className={styles.text}>
          {invitedBy} added <b>{email}</b> to the owner dashboard. Three steps, about two minutes.
        </p>
      </div>

      {state.error && (
        <p className={styles.error} role="alert">
          <AlertTriangle size={18} aria-hidden="true" />
          {state.error}
        </p>
      )}

      <form action={formAction} className={styles.form}>
        <input type="hidden" name="token" value={token} />
        {/* lets password managers save the new password under the right email */}
        <input type="hidden" name="username" value={email} autoComplete="username" />
        <ol className={styles.steps}>
          <li>
            <b>Choose a password</b> (at least 12 characters; a few random words works well):
          </li>
        </ol>
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor="invite-password">New password</label>
            <button type="button" onClick={() => setShowPassword((s) => !s)} aria-pressed={showPassword}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <input id="invite-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={12} maxLength={200} required />
        </div>
        <div className={styles.field}>
          <label htmlFor="invite-confirm">Same password again</label>
          <input id="invite-confirm" name="confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={12} maxLength={200} required />
        </div>

        <ol className={styles.steps} start={2}>
          <li>
            <b>Add your phone.</b> Install <b>Google Authenticator</b> or <b>Microsoft Authenticator</b> (free), tap <b>+</b>, choose{' '}
            <b>Scan a QR code</b>, and scan this:
            <span className={styles.qr}>
              <Image src={setup.qr} alt="QR code that adds The Queen's Corn to your authenticator app" width={200} height={200} unoptimized />
            </span>
            <details className={styles.manual}>
              <summary>Can&apos;t scan it?</summary>
              Tap <b>+</b>, then <b>Enter a setup key</b>. Name: The Queen&apos;s Corn. Key: <code>{setup.key}</code>. Type of key: Time
              based.
            </details>
          </li>
          <li>
            <label htmlFor="invite-code">Type the 6-digit code the app now shows:</label>
          </li>
        </ol>
        <div className={styles.field}>
          <input id="invite-code" name="code" className={styles.code} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]*" maxLength={7} required />
        </div>

        <Button type="submit" variant="red" fullWidth disabled={pending}>
          {pending ? 'Setting up…' : 'Finish setting up'}
        </Button>
      </form>
    </>
  );
}
