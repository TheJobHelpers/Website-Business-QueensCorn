'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, ExternalLink, HeartHandshake, LayoutDashboard, LogOut, Popcorn, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { logoutAction } from '@/app/actions/auth';
import styles from './admin.module.css';

// The frame around every dashboard screen: navigation on the left (a scrolling strip on
// phones), the screen itself on the right.
const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/events', label: 'Events', icon: CalendarDays },
  { href: '/admin/products', label: 'Flavors', icon: Popcorn },
  { href: '/admin/fundraisers', label: 'Fundraisers', icon: HeartHandshake },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  return (
    <div className={styles.shell} data-admin>
      <aside className={styles.sidebar}>
        <Link href="/admin" className={styles.brand}>
          <span className={styles.brandLogo}>
            <Image src="/logo.webp" alt="" width={40} height={40} />
          </span>
          <span>
            <b>The Queen&apos;s Corn</b>
            <small>Owner dashboard</small>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Dashboard">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.navLink} ${isActive(href) ? styles.navLinkOn : ''}`}
              aria-current={isActive(href) ? 'page' : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFoot}>
          <a href="/" target="_blank" rel="noopener noreferrer" className={styles.navLink}>
            <ExternalLink size={18} aria-hidden="true" />
            View the website
          </a>
          <form action={logoutAction}>
            <button type="submit" className={styles.navLink}>
              <LogOut size={18} aria-hidden="true" />
              Sign out
            </button>
          </form>
          <p className={styles.signedIn} title={email}>
            Signed in as {email}
          </p>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
