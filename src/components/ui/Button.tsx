import Link from 'next/link';
import type { ReactNode, MouseEventHandler } from 'react';
import styles from './Button.module.css';

// Design System v3.1: Button (wiki/design-system/components.css → .btn)
// red    = the one main action per view
// kettle = add to bag; pre-order on dark grounds
// dark   = fundraising and events
// ghost  = secondary on light grounds
// light  = secondary on the dark hero / dark band
type Variant = 'red' | 'kettle' | 'dark' | 'ghost' | 'light';

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: 'md' | 'sm';
  fullWidth?: boolean;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export default function Button({
  children,
  variant = 'ghost',
  size = 'md',
  fullWidth = false,
  href,
  onClick,
  type = 'button',
  disabled,
  className,
  'aria-label': ariaLabel,
}: ButtonProps) {
  const classes = [
    styles.btn,
    styles[variant],
    size === 'sm' ? styles.sm : '',
    fullWidth ? styles.full : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
