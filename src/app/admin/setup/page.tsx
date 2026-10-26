import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getAdminConfig } from '@/server/auth/config';
import { listAccounts } from '@/server/auth/directory';
import { phoneSetupDetails } from '@/server/auth/enrollment';
import { readInvite } from '@/server/auth/invites';
import InviteForm from './InviteForm';
import styles from '../login/Login.module.css';

export const metadata: Metadata = {
  title: "Set up your sign-in | The Queen's Corn",
  robots: { index: false, follow: false },
};

// Where an invite link lands: choose a password, add the phone, get the backup codes. The link
// itself is the permission; it works once, for 48 hours (src/server/auth/invites.ts).
export default async function AdminSetupPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = String((await searchParams).token ?? '').slice(0, 100);

  let invite: Awaited<ReturnType<typeof readInvite>> = null;
  try {
    const config = getAdminConfig();
    if (config.ok) invite = await readInvite(token, await listAccounts(config.config));
  } catch (err) {
    console.error('Could not open an invite link:', err);
  }

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

        {invite ? (
          <InviteForm
            token={token}
            email={invite.account.email}
            invitedBy={invite.createdBy}
            setup={await phoneSetupDetails(invite.account.email, invite.secret)}
          />
        ) : (
          <>
            <h2 className={styles.subtitle}>This link no longer works</h2>
            <p className={styles.text}>
              Invite links work once, for 48 hours, and only the newest one counts. Ask the person who invited you for a new link.
            </p>
            <Link href="/admin/login" className={styles.back}>
              Already set up? Sign in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
