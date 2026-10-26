'use client';

import { useState, type FormEvent } from 'react';
import { Copy, UserPlus } from 'lucide-react';
import { addAdminAction, newInviteLinkAction, removeAdminAction, resetAdminAction, type InviteLink } from '@/app/actions/admins';
import Button from '@/components/ui/Button';
import { ConfirmButton, Field, NoticeBar } from './ui';
import { useAdminAction } from './useAdminAction';
import styles from './admin.module.css';

/** One person, already worded on the server. */
export interface AdminRow {
  id: string;
  email: string;
  role: string;
  you: boolean;
  signedInNow: boolean;
  invited: boolean;
  /** "Last signed in …", "On 2 devices", "Added by … on …" */
  meta: string[];
  note: { text: string; warn: boolean };
  /** a super admin may reset or remove this person */
  manageable: boolean;
}

// "Who can sign in" on Admins & activity. Super admins can add people (who get an invite link),
// make a new link, reset someone's sign-in, or remove them. Everyone else sees the list only.
export default function AdminsManager({
  rows,
  canManage,
  manageProblem,
}: {
  rows: AdminRow[];
  canManage: boolean;
  /** why admins cannot be managed on this server, if they cannot */
  manageProblem: string | null;
}) {
  const { pending, notice, clearNotice, run } = useAdminAction();
  const [adding, setAdding] = useState(false);
  const [email, setEmail] = useState('');
  const [link, setLink] = useState<InviteLink | null>(null);
  const [copied, setCopied] = useState(false);

  const showLink = (next: InviteLink) => {
    setLink(next);
    setCopied(false);
  };

  const add = (e: FormEvent) => {
    e.preventDefault();
    run(() => addAdminAction(email), {
      onSuccess: (next) => {
        showLink(next);
        setAdding(false);
        setEmail('');
      },
    });
  };

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link.link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const manage = canManage && !manageProblem;

  return (
    <section className={styles.card} aria-labelledby="people-title">
      <div className={styles.cardHead}>
        <h2 id="people-title" className={styles.cardTitle}>
          Who can sign in <span className={styles.count}>{rows.length === 1 ? '1 person' : `${rows.length} people`}</span>
        </h2>
        {manage && !adding && (
          <Button variant="dark" size="sm" onClick={() => setAdding(true)} disabled={pending}>
            <UserPlus size={16} aria-hidden="true" /> Add admin
          </Button>
        )}
      </div>

      <NoticeBar notice={notice} onClose={clearNotice} />
      {canManage && manageProblem && <p className={`${styles.cardNote} ${styles.cardNoteWarn}`}>{manageProblem}</p>}

      {adding && (
        <form onSubmit={add} noValidate>
          <div className={styles.formGrid}>
            <Field id="new-admin-email" label="Their email" hint="They get an invite link to choose their own password and add their phone." wide>
              <input
                id="new-admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={200}
                autoComplete="off"
                required
              />
            </Field>
          </div>
          <div className={styles.formActions}>
            <Button type="submit" variant="red" size="sm" disabled={pending || !email.trim()}>
              {pending ? 'Adding…' : 'Add and make invite link'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setAdding(false)} disabled={pending}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {link && (
        <div className={`${styles.status} ${styles.statusOk}`} role="status">
          <Copy size={20} aria-hidden="true" />
          <div>
            <b>Invite link for {link.email}</b>
            <p>
              Send it to them yourself (text or email). It works once, for {link.hours} hours, and is shown only now. On it they choose a
              password, scan a QR code with an authenticator app, and get their backup codes.
            </p>
            <div className={styles.formActions}>
              <input className={styles.linkBox} value={link.link} readOnly aria-label="Invite link" onFocus={(e) => e.target.select()} />
              <Button variant="dark" size="sm" onClick={copy}>
                {copied ? 'Copied' : 'Copy link'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ul className={styles.rows}>
        {rows.map((row) => (
          <li key={row.id} className={`${styles.row} ${row.invited ? styles.rowMuted : ''}`}>
            <div className={styles.rowMain}>
              <h3 className={styles.rowTitle}>
                {row.email}
                <span className={styles.tag}>{row.role}</span>
                {row.you && <span className={styles.tag}>You</span>}
                {row.signedInNow && <span className={`${styles.tag} ${styles.tagMuted}`}>Signed in now</span>}
                {row.invited && <span className={`${styles.tag} ${styles.tagMuted}`}>Invited</span>}
              </h3>
              <p className={styles.rowMeta}>
                {row.meta.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
              <p className={`${styles.rowNote} ${row.note.warn ? styles.cardNoteWarn : ''}`}>{row.note.text}</p>
            </div>
            {manage && row.manageable && (
              <div className={styles.rowControls}>
                {row.invited ? (
                  <button type="button" className={styles.linkBtn} disabled={pending} onClick={() => run(() => newInviteLinkAction(row.id), { onSuccess: showLink })}>
                    New invite link
                  </button>
                ) : (
                  <ConfirmButton
                    label="Reset sign-in"
                    confirmLabel="Yes, sign them out and make a new invite link"
                    disabled={pending}
                    onConfirm={() => run(() => resetAdminAction(row.id), { onSuccess: showLink })}
                  />
                )}
                <ConfirmButton
                  label="Remove"
                  confirmLabel={`Yes, remove ${row.email}`}
                  disabled={pending}
                  onConfirm={() => run(() => removeAdminAction(row.id), { onSuccess: () => setLink((l) => (l?.email === row.email ? null : l)) })}
                />
              </div>
            )}
          </li>
        ))}
      </ul>

      <p className={styles.cardNote}>
        {canManage
          ? 'Super admins are set in the server settings (node scripts/admin-account.mjs) and cannot be removed here, so the dashboard can never lock everyone out.'
          : 'Only a super admin can add, reset or remove admins.'}
      </p>
    </section>
  );
}
