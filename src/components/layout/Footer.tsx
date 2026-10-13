'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from '../ui/Button';
import styles from './Footer.module.css';

// Site footer, design system v3.1: espresso ground, the same labels, links and buttons as the pages.
const LINKS = [
  { href: '/shop', label: 'Shop flavors' },
  { href: '/events', label: 'Events' },
  { href: '/fundraising', label: 'Fundraising' },
  { href: '/story', label: 'Our story' },
  { href: '/contact', label: 'Contact' },
];

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <div className="main-container">
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logoBox} aria-label="The Queen's Corn home">
              <Image src="/logo.webp" alt="" width={80} height={80} className={styles.logo} />
            </Link>
            <p className={styles.tagline}>
              Hand-popped kettle corn, <em>fit for royalty.</em>
            </p>
            <p className={styles.about}>Made fresh at Arizona markets by Bob &amp; Reina since 2017.</p>
          </div>

          {/* Explore */}
          <nav className={styles.column} aria-label="Footer">
            <h2 className={styles.heading}>Explore</h2>
            <ul className={styles.links}>
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Get in touch */}
          <div className={`${styles.column} ${styles.contact}`}>
            <h2 className={styles.heading}>Get in touch</h2>
            <ul className={styles.links}>
              <li>
                <a href="tel:+16236921811" className={styles.strong}>
                  (623) 692-1811
                </a>
              </li>
              <li>
                <a href="mailto:thequeenscornaz@gmail.com" className={styles.strong}>
                  thequeenscornaz@gmail.com
                </a>
              </li>
              <li>Marana, Arizona</li>
            </ul>
            <div className={styles.book}>
              <Button href="/contact?subject=Event%20Booking" variant="kettle" size="sm">
                Book us for an event
              </Button>
            </div>
          </div>

          {/* Follow & trust */}
          <div className={styles.column}>
            <h2 className={styles.heading}>Follow along</h2>
            <ul className={styles.links}>
              <li>
                <a href="#" className={styles.social}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className={styles.social}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  Instagram
                </a>
              </li>
            </ul>
            {/* on a light chip: the badge's own text is dark blue */}
            <div className={styles.bbb}>
              <Image src="/bbb.png" alt="BBB Accredited Business, rating A+" width={180} height={45} />
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>&copy; {currentYear} The Queen&apos;s Corn. All rights reserved.</p>
          <div className={styles.legal}>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-of-service">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
