import { LogIn, PencilLine, ShieldAlert, Users } from 'lucide-react';
import AdminsManager, { type AdminRow } from '@/components/admin/AdminsManager';
import { PageHeader } from '@/components/admin/ui';
import styles from '@/components/admin/admin.module.css';
import { summarizeAccount, type AccountSummary } from '@/server/auth/accounts';
import { ACTIVITY_DAYS, recentActivity, type ActivityEvent, type ActivityKind } from '@/server/auth/audit';
import { getAccounts, requireAdminPage } from '@/server/auth/guard';
import { dataKeyProblem } from '@/server/auth/sealed';
import { SHOP_TIME_ZONE, shopDay } from '@/server/shopify-orders';

// This page is rendered per request (it reads the session cookie), so "now" is the request time.
const requestTime = () => Date.now();

const KIND_TEXT: Record<ActivityKind, { label: string; warn: boolean }> = {
  'signed-in': { label: 'Signed in', warn: false },
  'signed-in-backup-code': { label: 'Signed in with a backup code', warn: true },
  failed: { label: 'Failed sign-in: wrong email or password', warn: true },
  'wrong-code': { label: 'Failed sign-in: right password, wrong code', warn: true },
  paused: { label: 'Sign-in paused after too many tries', warn: true },
  'signed-out': { label: 'Signed out', warn: false },
  'signed-out-everywhere': { label: 'Signed out on every device', warn: false },
  'phone-set-up': { label: 'Set up a phone for two-step sign-in', warn: true },
  'invite-accepted': { label: 'Finished their invite: chose a password and set up a phone', warn: true },
  'phone-replaced': { label: 'Replaced their phone for two-step sign-in', warn: true },
  'backup-codes-renewed': { label: 'Made new backup codes', warn: true },
  'password-changed': { label: 'Changed their password', warn: true },
  change: { label: 'Change', warn: false },
};

const SIGN_IN_KINDS = new Set<ActivityKind>(['signed-in', 'signed-in-backup-code', 'phone-set-up', 'invite-accepted']);
const FAILED_KINDS = new Set<ActivityKind>(['failed', 'wrong-code', 'paused']);

const time = (iso: string) => new Intl.DateTimeFormat('en-US', { timeZone: SHOP_TIME_ZONE, hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
const shortDate = (iso: string) => new Intl.DateTimeFormat('en-US', { timeZone: SHOP_TIME_ZONE, month: 'short', day: 'numeric' }).format(new Date(iso));
const dateTime = (iso: string) =>
  new Intl.DateTimeFormat('en-US', { timeZone: SHOP_TIME_ZONE, weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
const longDay = (iso: string) => new Intl.DateTimeFormat('en-US', { timeZone: SHOP_TIME_ZONE, weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(iso));

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

// Admins & activity: who can sign in, and everything they did in the last 30 days, day by day.
export default async function AdminActivityPage() {
  const session = await requireAdminPage();
  const now = requestTime();

  let accounts: AccountSummary[] = [];
  let events: ActivityEvent[] = [];
  let failedToLoad = false;
  try {
    [accounts, events] = await Promise.all([
      getAccounts().then((list) => Promise.all((list ?? []).map(summarizeAccount))),
      recentActivity(1000, now),
    ]);
  } catch (err) {
    console.error('Could not read the admins or the activity log:', err);
    failedToLoad = true;
  }

  const lastSignIn = (email: string) => events.find((e) => e.who === email && SIGN_IN_KINDS.has(e.kind));
  const signIns = events.filter((e) => SIGN_IN_KINDS.has(e.kind)).length;
  const failed = events.filter((e) => FAILED_KINDS.has(e.kind)).length;
  const changes = events.filter((e) => e.kind === 'change').length;

  // newest day first; events are already newest first
  const today = shopDay(now);
  const yesterday = shopDay(now - 86400000);
  const days = new Map<string, ActivityEvent[]>();
  for (const event of events) {
    const day = shopDay(event.at);
    days.set(day, [...(days.get(day) ?? []), event]);
  }
  const rows: AdminRow[] = accounts.map((account) => {
    const last = lastSignIn(account.email);
    const lowOnCodes = account.backupCodesLeft <= 2;
    const invited = account.status === 'invited';
    const meta = invited
      ? [
          account.inviteExpiresAt ? `Invite link works until ${dateTime(account.inviteExpiresAt)}` : 'Invite link expired: make a new one',
          ...(account.addedBy && account.addedAt ? [`Added by ${account.addedBy} on ${shortDate(account.addedAt)}`] : []),
        ]
      : [
          last ? `Last signed in ${dateTime(last.at)}` : `Not signed in during the last ${ACTIVITY_DAYS} days`,
          account.devices === 0 ? 'No device signed in' : `On ${plural(account.devices, 'device')}`,
          ...(account.addedBy && account.addedAt ? [`Added by ${account.addedBy} on ${shortDate(account.addedAt)}`] : []),
        ];
    const note = invited
      ? { text: 'Cannot sign in until they open their invite link, choose a password and set up their phone.', warn: true }
      : !account.phoneSetUp
        ? { text: 'Phone not set up yet: the QR code is shown once, at their first sign-in.', warn: true }
        : account.backupCodesTotal === 0
          ? { text: 'Phone set up. No backup codes: they can make some in Settings.', warn: true }
          : {
              text: `Phone set up · ${account.backupCodesLeft} of ${account.backupCodesTotal} backup codes left${lowOnCodes ? ': time to make new ones in Settings' : ''}`,
              warn: lowOnCodes,
            };
    return {
      id: account.id,
      email: account.email,
      role: account.role === 'super' ? 'Super admin' : 'Admin',
      you: account.email === session.email,
      signedInNow: account.devices > 0,
      invited,
      meta,
      note,
      manageable: account.source === 'db',
    };
  });

  const dayTitle = (day: string, first: ActivityEvent) => (day === today ? 'Today' : day === yesterday ? 'Yesterday' : longDay(first.at));

  return (
    <>
      <PageHeader
        title="Admins & activity"
        text={`Who can sign in to this dashboard, and every sign-in, failed try and change in the last ${ACTIVITY_DAYS} days. Times are Arizona time.`}
      />

      {failedToLoad && <p className={`${styles.cardNote} ${styles.cardNoteWarn}`}>The activity log could not be read just now. Reload the page in a moment.</p>}

      <div className={styles.stats}>
        <div className={`${styles.stat} ${styles.statPlain}`}>
          <Users size={22} aria-hidden="true" />
          <span className={styles.statLabel}>People who can sign in</span>
          <b className={styles.statValue}>{accounts.length}</b>
          <span className={styles.statNote}>Each with their own password and phone code</span>
        </div>
        <div className={`${styles.stat} ${styles.statPlain}`}>
          <LogIn size={22} aria-hidden="true" />
          <span className={styles.statLabel}>Sign-ins</span>
          <b className={styles.statValue}>{signIns}</b>
          <span className={styles.statNote}>In the last {ACTIVITY_DAYS} days</span>
        </div>
        <div className={`${styles.stat} ${styles.statPlain}`}>
          <ShieldAlert size={22} aria-hidden="true" />
          <span className={styles.statLabel}>Failed tries</span>
          <b className={styles.statValue}>{failed}</b>
          <span className={styles.statNote}>{failed === 0 ? 'Nothing suspicious' : 'Check below that these were you'}</span>
        </div>
        <div className={`${styles.stat} ${styles.statPlain}`}>
          <PencilLine size={22} aria-hidden="true" />
          <span className={styles.statLabel}>Changes saved</span>
          <b className={styles.statValue}>{changes}</b>
          <span className={styles.statNote}>Flavors, events, fundraisers, Shopify</span>
        </div>
      </div>

      {accounts.length === 0 && !failedToLoad ? (
        <section className={styles.card}>
          <p className={styles.empty}>No accounts could be read from the server settings.</p>
        </section>
      ) : (
        <AdminsManager rows={rows} canManage={session.role === 'super'} manageProblem={dataKeyProblem()} />
      )}

      {days.size === 0 ? (
        <section className={styles.card}>
          <p className={styles.empty}>No activity in the last {ACTIVITY_DAYS} days yet.</p>
        </section>
      ) : (
        [...days.entries()].map(([day, list]) => (
          <section key={day} className={styles.card} aria-label={dayTitle(day, list[0])}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>
                {dayTitle(day, list[0])} <span className={styles.count}>{plural(list.length, 'event')}</span>
              </h2>
            </div>
            <ul className={styles.rows}>
              {list.map((event, index) => {
                const kind = KIND_TEXT[event.kind] ?? { label: event.kind, warn: true };
                return (
                  <li key={`${event.at}-${index}`} className={styles.row}>
                    <div className={styles.rowMain}>
                      <h3 className={styles.rowTitle}>
                        {event.kind === 'change' ? event.detail : kind.label}
                        <span className={`${styles.tag} ${kind.warn ? '' : styles.tagMuted}`}>{event.who}</span>
                      </h3>
                      <p className={styles.rowMeta}>
                        <span>{time(event.at)}</span>
                        <span>{event.device}</span>
                        <span>{event.address}</span>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}

      <p className={styles.cardNote}>
        Anything you do not recognize? Go to Settings, choose &quot;Sign out on every device&quot;, and ask whoever manages the website for a new
        password. Entries older than {ACTIVITY_DAYS} days are deleted automatically.
      </p>
    </>
  );
}
