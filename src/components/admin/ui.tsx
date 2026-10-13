'use client';

import { useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import type { Notice } from './useAdminAction';
import styles from './admin.module.css';

// Small building blocks shared by every dashboard screen.

/** The title row at the top of a screen, with its main action on the right. */
export function PageHeader({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <header className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.pageText}>{text}</p>
      </div>
      {action}
    </header>
  );
}

/** Result of the last save: green and self-clearing, or red and sticky. */
export function NoticeBar({ notice, onClose }: { notice: Notice | null; onClose: () => void }) {
  if (!notice) return null;
  const Icon = notice.kind === 'ok' ? CheckCircle2 : AlertTriangle;
  return (
    <div className={`${styles.notice} ${notice.kind === 'ok' ? styles.noticeOk : styles.noticeError}`} role={notice.kind === 'ok' ? 'status' : 'alert'}>
      <Icon size={18} aria-hidden="true" />
      <span>{notice.text}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss message">
        <X size={16} />
      </button>
    </div>
  );
}

/** A labelled form field with its hint and error message wired up for screen readers. */
export function Field({
  id,
  label,
  hint,
  error,
  wide,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`${styles.field} ${wide ? styles.fieldWide : ''} ${error ? styles.fieldInvalid : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <p className={styles.fieldError} id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : (
        hint && <p className={styles.fieldHint}>{hint}</p>
      )}
    </div>
  );
}

/** An on/off switch. `label` is read out; pass `children` to show text beside it. */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
  children,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
  children?: ReactNode;
}) {
  return (
    <label className={styles.switch}>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        aria-label={children ? undefined : label}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.switchTrack} aria-hidden="true" />
      {children && <span className={styles.switchText}>{children}</span>}
    </label>
  );
}

/** Delete needs a second, deliberate click. */
export function ConfirmButton({
  label,
  confirmLabel,
  onConfirm,
  disabled,
}: {
  label: string;
  confirmLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <button type="button" className={`${styles.linkBtn} ${styles.danger}`} disabled={disabled} onClick={() => setAsking(true)}>
        {label}
      </button>
    );
  }
  return (
    <span className={styles.confirm}>
      <button
        type="button"
        className={`${styles.smallBtn} ${styles.dangerSolid}`}
        disabled={disabled}
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
      >
        {confirmLabel}
      </button>
      <button type="button" className={styles.linkBtn} onClick={() => setAsking(false)}>
        Cancel
      </button>
    </span>
  );
}
