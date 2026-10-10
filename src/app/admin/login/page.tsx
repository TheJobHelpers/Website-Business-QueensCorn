'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/app/actions/auth';
import { AlertCircle } from 'lucide-react';
import styles from './Login.module.css';

const DEMO_EMAIL = 'thequeenscornaz@gmail.com';
const DEMO_PASSWORD = 'queenscorn2026';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleFillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    startTransition(async () => {
      const res = await loginAction(null, formData);
      if (res.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setErrorMessage(res.error || 'Login failed. Please check credentials.');
      }
    });
  };

  return (
    <div className={styles.loginScreen}>
      <div className={styles.loginGlow} />

      <div className={styles.loginCard}>
        {/* Brand Header */}
        <div className={styles.loginBrand}>
          <div className={styles.loginLogoBox}>
            <Image
              src="/logo.webp"
              alt="The Queen's Corn"
              width={48}
              height={48}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <div>
            <span className={styles.loginBadge}>Owner &amp; Operations Portal</span>
            <h1 className={styles.loginTitle}>The Queen&apos;s Corn</h1>
          </div>
        </div>

        <p className={styles.loginSubtitle}>
          Sign in to manage Arizona shipping queues, Farmers&apos; Market events, 50% fundraising campaigns, and Shopify integrations.
        </p>

        {errorMessage && (
          <div className={styles.errorBanner}>
            <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.field}>
            <label htmlFor="admin-email">Owner Email</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="thequeenscornaz@gmail.com"
              required
              autoComplete="username"
            />
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="admin-password">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.textToggleBtn}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <div className={styles.loginMetaRow}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" defaultChecked />
              <span>Remember this session for 7 days</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={styles.loginSubmitBtn}
          >
            {isPending ? 'Verifying Credentials...' : 'Sign In to Admin Dashboard →'}
          </button>
        </form>

        {/* 1-Click Demo Fill Box */}
        <div className={styles.demoBox}>
          <div className={styles.demoBoxHeader}>
            <span className={styles.demoBadge}>Quick Access</span>
            <button
              type="button"
              onClick={handleFillDemo}
              className={styles.fillDemoBtn}
            >
              Fill Demo Credentials
            </button>
          </div>
          <p className={styles.demoCredentials}>
            Email: <code>thequeenscornaz@gmail.com</code> <br />
            Password: <code>queenscorn2026</code>
          </p>
        </div>

        <div className={styles.loginFooter}>
          <Link href="/" className={styles.backStoreLink}>
            ← Return to Public Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
