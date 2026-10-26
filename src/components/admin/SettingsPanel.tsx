'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { signOutEverywhereAction } from '@/app/actions/auth';
import {
  importShopifyCatalogAction,
  resetCollectionAction,
  sendFlavorsToShopifyAction,
  testShopifyConnectionAction,
  type ShopifyStatus,
} from '@/app/actions/settings';
import Button from '@/components/ui/Button';
import { ConfirmButton, NoticeBar, PageHeader } from './ui';
import { useAdminAction } from './useAdminAction';
import styles from './admin.module.css';

export interface SettingsStatus {
  email: string;
  role: 'super' | 'admin';
  storeKind: 'redis' | 'file' | 'readonly';
  /** people who can sign in */
  accountCount: number;
  idleMinutes: number;
  maxHours: number;
  /** this person's one-time backup codes */
  backupCodes: { total: number; left: number };
  /** sign-in settings that are wrong or no longer used (names only, never values) */
  settingsToTidy: string[];
  shopifyConfigured: boolean;
  /** the server has a key that may change products in Shopify */
  shopifyAdminConnected: boolean;
}

const STORE_TEXT: Record<SettingsStatus['storeKind'], { ok: boolean; title: string; text: string }> = {
  redis: {
    ok: true,
    title: 'Saved to the database',
    text: 'Changes are stored in the Redis database and show for every visitor.',
  },
  file: {
    ok: true,
    title: 'Saved on this computer',
    text: 'This is the local development setup: changes are written to the .data folder here and are not on the live website.',
  },
  readonly: {
    ok: false,
    title: 'Nowhere to save yet',
    text: 'The live website has no database connected, so the dashboard cannot save. In Vercel, open Storage, add an Upstash Redis database to this project, and redeploy. Until then the site shows the built-in lists.',
  },
};

const LISTS = [
  { key: 'events', label: 'Events' },
  { key: 'products', label: 'Flavors' },
  { key: 'fundraisers', label: 'Fundraisers' },
] as const;

function StatusLine({ ok, title, text }: { ok: boolean; title: string; text: string }) {
  const Icon = ok ? CheckCircle2 : AlertTriangle;
  return (
    <div className={`${styles.status} ${ok ? styles.statusOk : styles.statusWarn}`}>
      <Icon size={20} aria-hidden="true" />
      <div>
        <b>{title}</b>
        <p>{text}</p>
      </div>
    </div>
  );
}

// Settings screen: where things are saved, how sign-in is protected, Shopify, and the
// "put it back" buttons.
export default function SettingsPanel({ status, mySignIn }: { status: SettingsStatus; mySignIn: ReactNode }) {
  const { pending, notice, clearNotice, run } = useAdminAction();
  const [shopify, setShopify] = useState<ShopifyStatus | null>(null);
  const store = STORE_TEXT[status.storeKind];
  const { total: codesTotal, left: codesLeft } = status.backupCodes;

  return (
    <>
      <PageHeader title="Settings" text="Where your changes are kept, how the dashboard is protected, and the Shopify connection." />
      <NoticeBar notice={notice} onClose={clearNotice} />

      <section className={styles.card} aria-labelledby="saving-title">
        <h2 id="saving-title" className={styles.cardTitle}>
          Saving
        </h2>
        <StatusLine ok={store.ok} title={store.title} text={store.text} />
      </section>

      <section className={styles.card} aria-labelledby="security-title">
        <h2 id="security-title" className={styles.cardTitle}>
          Sign-in and security
        </h2>
        <StatusLine
          ok
          title={`Signed in as ${status.email} (${status.role === 'super' ? 'super admin' : 'admin'})`}
          text={`Two-step sign-in is on: a password plus a code from your phone. You are signed out after ${status.idleMinutes} minutes without activity, and always after ${status.maxHours} hours.`}
        />
        <StatusLine
          ok={codesLeft > 2}
          title={codesTotal === 0 ? 'You have no backup codes' : `${codesLeft} of ${codesTotal} backup codes left`}
          text={
            codesLeft > 2
              ? 'Each backup code signs you in once if your phone is lost. Keep them somewhere safe, away from your phone.'
              : 'Without backup codes, a lost phone means you cannot sign in. Make new ones below.'
          }
        />
        {status.settingsToTidy.length > 0 && (
          <>
            <StatusLine
              ok={false}
              title="Some sign-in settings need attention"
              text="Whoever manages the website should fix these in the server settings in Vercel."
            />
            <ul className={styles.plainList}>
              {status.settingsToTidy.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </>
        )}
        <ul className={styles.plainList}>
          <li>
            {status.accountCount === 1 ? 'One person has' : `${status.accountCount} people have`} their own sign-in: see{' '}
            <Link href="/admin/admins">Admins &amp; activity</Link>{' '}
            for who they are and what they did.
            {status.role === 'super'
              ? ' As a super admin you add, reset and remove people there.'
              : ' A super admin adds, resets and removes people there.'}
          </li>
          <li>Five wrong tries from one connection, or ten for one account, pause sign-in for 15 minutes.</li>
          <li>Every change is checked on the server: nobody can save without being signed in.</li>
        </ul>
        {mySignIn}
        <div className={styles.formActions}>
          <ConfirmButton
            label="Sign out on every device"
            confirmLabel="Yes, sign me out everywhere"
            disabled={pending}
            onConfirm={() => run(signOutEverywhereAction)}
          />
        </div>
      </section>

      <section className={styles.card} aria-labelledby="shopify-title">
        <h2 id="shopify-title" className={styles.cardTitle}>
          Shopify
        </h2>
        {status.shopifyConfigured ? (
          <>
            <StatusLine
              ok
              title="Shopify is connected"
              text="Checkout goes through Shopify. Orders, payments and refunds are managed in your Shopify admin, not here."
            />
            <StatusLine
              ok={status.shopifyAdminConnected}
              title={status.shopifyAdminConnected ? 'Flavor changes are sent to Shopify' : 'Flavor changes are not sent to Shopify'}
              text={
                status.shopifyAdminConnected
                  ? 'When you add, rename, reprice, hide or delete a flavor here, the product in Shopify is changed to match.'
                  : 'The Flavors screen only changes the website. Until the dashboard key is added to the server settings, every change must be repeated in Shopify by hand.'
              }
            />
            {shopify && (
              <p className={styles.result}>
                Reached <b>{shopify.shopName}</b>
                {shopify.domain && ` (${shopify.domain})`}: {shopify.productCount} products, answered in {shopify.latencyMs} ms.
              </p>
            )}
            {shopify &&
              (shopify.issues.length === 0 ? (
                <StatusLine ok title="Every flavor can be ordered" text="Each flavor and bag size on the website matches a product in Shopify at the same price." />
              ) : (
                <>
                  <StatusLine
                    ok={false}
                    title={`${shopify.issues.length} thing${shopify.issues.length === 1 ? '' : 's'} to fix before shoppers can check out`}
                    text="A bag with any of these in it cannot be paid for until it is fixed in Shopify or on the Flavors screen."
                  />
                  <ul className={styles.plainList}>
                    {shopify.issues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                </>
              ))}
            <div className={styles.formActions}>
              <Button variant="dark" size="sm" disabled={pending} onClick={() => run(testShopifyConnectionAction, { onSuccess: setShopify })}>
                Test the connection
              </Button>
              {status.shopifyAdminConnected && (
                <ConfirmButton
                  label="Send all flavors to Shopify"
                  confirmLabel="Yes, create or update them in Shopify"
                  disabled={pending}
                  onConfirm={() => run(sendFlavorsToShopifyAction, { onSuccess: () => setShopify(null) })}
                />
              )}
              <ConfirmButton
                label="Replace flavors with Shopify's products"
                confirmLabel="Yes, replace all flavors"
                disabled={pending}
                onConfirm={() => run(importShopifyCatalogAction)}
              />
            </div>
          </>
        ) : (
          <StatusLine
            ok={false}
            title="Shopify is not connected"
            text="Checkout is not live: the cart sends shoppers to the contact form instead. To connect, add the store address and Storefront token to the server settings in Vercel."
          />
        )}
      </section>

      <section className={styles.card} aria-labelledby="reset-title">
        <h2 id="reset-title" className={styles.cardTitle}>
          Put a list back
        </h2>
        <p className={styles.cardText}>
          Throws away your changes to one list and brings back the version that ships with the website. This cannot be undone.
        </p>
        <ul className={styles.resetList}>
          {LISTS.map((list) => (
            <li key={list.key}>
              <span>{list.label}</span>
              <ConfirmButton
                label="Restore built-in list"
                confirmLabel={`Yes, restore ${list.label.toLowerCase()}`}
                disabled={pending}
                onConfirm={() => run(() => resetCollectionAction(list.key))}
              />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
