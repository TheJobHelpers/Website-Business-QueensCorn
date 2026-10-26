'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { changePasswordAction, finishReplacePhoneAction, newBackupCodesAction, startReplacePhoneAction } from '@/app/actions/account';
import Button from '@/components/ui/Button';
import { Field, NoticeBar } from './ui';
import { useAdminAction } from './useAdminAction';
import styles from './admin.module.css';

type Panel = 'phone' | 'codes' | 'password' | null;

const EMPTY = { password: '', code: '', newPassword: '', confirm: '' };

// Settings > Your sign-in: replace your phone, get new backup codes, change your password. Each
// starts with "confirm it's you" (your password and a current code), checked on the server.
export default function MySignIn({ unavailable }: { unavailable: string | null }) {
  const { pending, notice, clearNotice, run } = useAdminAction();
  const [panel, setPanel] = useState<Panel>(null);
  const [form, setForm] = useState(EMPTY);
  const [qr, setQr] = useState<{ qr: string; key: string } | null>(null);
  const [newCode, setNewCode] = useState('');
  const [codes, setCodes] = useState<string[] | null>(null);

  const set = (name: keyof typeof EMPTY, value: string) => setForm((f) => ({ ...f, [name]: value }));
  const open = (next: Panel) => {
    setPanel(next);
    setForm(EMPTY);
    setQr(null);
    setNewCode('');
    setCodes(null);
    clearNotice();
  };
  const close = () => open(null);

  const confirmIt = (e: FormEvent) => {
    e.preventDefault();
    const proof = { password: form.password, code: form.code };
    if (panel === 'phone') run(() => startReplacePhoneAction(proof), { onSuccess: (next) => setQr(next) });
    if (panel === 'codes') run(() => newBackupCodesAction(proof), { onSuccess: (next) => setCodes(next) });
    if (panel === 'password') run(() => changePasswordAction({ ...proof, newPassword: form.newPassword, confirm: form.confirm }), { onSuccess: close });
    setForm((f) => ({ ...f, code: '' }));
  };

  const finishPhone = (e: FormEvent) => {
    e.preventDefault();
    run(() => finishReplacePhoneAction(newCode), { onSuccess: close });
    setNewCode('');
  };

  if (unavailable) return <p className={styles.cardNote}>{unavailable}</p>;

  const proofFields = (
    <>
      <Field id="me-password" label="Your password">
        <input id="me-password" type="password" autoComplete="current-password" value={form.password} onChange={(e) => set('password', e.target.value)} maxLength={200} required />
      </Field>
      <Field id="me-code" label="Code from your phone" hint="Or one of your backup codes.">
        <input id="me-code" autoComplete="one-time-code" value={form.code} onChange={(e) => set('code', e.target.value)} maxLength={20} required />
      </Field>
    </>
  );

  return (
    <div>
      <h3 className={styles.subTitle}>Your sign-in</h3>
      <NoticeBar notice={notice} onClose={clearNotice} />

      {panel === null && (
        <div className={styles.formActions}>
          <Button variant="dark" size="sm" onClick={() => open('phone')}>
            Replace my phone
          </Button>
          <Button variant="ghost" size="sm" onClick={() => open('codes')}>
            New backup codes
          </Button>
          <Button variant="ghost" size="sm" onClick={() => open('password')}>
            Change password
          </Button>
        </div>
      )}

      {panel !== null && !qr && !codes && (
        <form onSubmit={confirmIt} noValidate>
          <p className={styles.cardText}>
            {panel === 'phone' && 'New phone, or the app was deleted? First confirm it is you. Then scan a new QR code: the old phone stops working.'}
            {panel === 'codes' && 'Ten new one-time codes for when your phone is not with you. Your old backup codes stop working.'}
            {panel === 'password' && 'Choose a new password. Your other devices will be signed out.'}
          </p>
          <div className={styles.formGrid}>
            {proofFields}
            {panel === 'password' && (
              <>
                <Field id="me-new-password" label="New password" hint="At least 12 characters. A few random words works well.">
                  <input id="me-new-password" type="password" autoComplete="new-password" value={form.newPassword} onChange={(e) => set('newPassword', e.target.value)} maxLength={200} required />
                </Field>
                <Field id="me-confirm" label="New password again">
                  <input id="me-confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} maxLength={200} required />
                </Field>
              </>
            )}
          </div>
          <div className={styles.formActions}>
            <Button type="submit" variant="red" size="sm" disabled={pending || !form.password || !form.code}>
              {pending ? 'Checking…' : panel === 'phone' ? 'Show the new QR code' : panel === 'codes' ? 'Make new backup codes' : 'Change password'}
            </Button>
            <Button variant="ghost" size="sm" onClick={close} disabled={pending}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {panel === 'phone' && qr && (
        <form onSubmit={finishPhone} noValidate>
          <p className={styles.cardText}>
            On the new phone, open the authenticator app, tap <b>+</b>, choose <b>Scan a QR code</b> and scan this. Then type the code it shows.
          </p>
          <span className={styles.qrBox}>
            <Image src={qr.qr} alt="QR code that adds The Queen's Corn to your authenticator app" width={180} height={180} unoptimized />
          </span>
          <p className={styles.cardNote}>
            Can&apos;t scan it? Tap + then &quot;Enter a setup key&quot;: <b className={styles.keyText}>{qr.key}</b> (Time based).
          </p>
          <div className={styles.formGrid}>
            <Field id="me-new-code" label="Code from the new phone">
              <input id="me-new-code" inputMode="numeric" autoComplete="one-time-code" value={newCode} onChange={(e) => setNewCode(e.target.value)} maxLength={7} required />
            </Field>
          </div>
          <div className={styles.formActions}>
            <Button type="submit" variant="red" size="sm" disabled={pending || !newCode}>
              {pending ? 'Checking…' : 'Finish'}
            </Button>
            <Button variant="ghost" size="sm" onClick={close} disabled={pending}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {panel === 'codes' && codes && (
        <div>
          <p className={styles.cardText}>
            Save these now: they are shown only once. Each signs you in one time if your phone is not with you. Keep them away from the phone
            (a password manager, or printed).
          </p>
          <ul className={styles.codeList} aria-label="Your new backup codes">
            {codes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
          <div className={styles.formActions}>
            <Button variant="dark" size="sm" onClick={() => navigator.clipboard?.writeText(codes.join('\n'))}>
              Copy all
            </Button>
            <Button variant="ghost" size="sm" onClick={close}>
              I have saved them
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
