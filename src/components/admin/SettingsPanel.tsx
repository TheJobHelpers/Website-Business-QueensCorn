'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { importShopifyCatalogAction, resetCollectionAction, testShopifyConnectionAction, type ShopifyStatus } from '@/app/actions/settings';
import Button from '@/components/ui/Button';
import { ConfirmButton, NoticeBar, PageHeader } from './ui';
import { useAdminAction } from './useAdminAction';
import styles from './admin.module.css';

export interface SettingsStatus {
  email: string;
  storeKind: 'redis' | 'file' | 'readonly';
  passwordIsHashed: boolean;
  shopifyConfigured: boolean;
  sessionDays: number;
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
export default function SettingsPanel({ status }: { status: SettingsStatus }) {
  const { pending, notice, clearNotice, run } = useAdminAction();
  const [shopify, setShopify] = useState<ShopifyStatus | null>(null);
  const store = STORE_TEXT[status.storeKind];

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
        <StatusLine ok title={`Signed in as ${status.email}`} text={`You stay signed in for ${status.sessionDays} days on this device, then sign in again.`} />
        <StatusLine
          ok={status.passwordIsHashed}
          title={status.passwordIsHashed ? 'Password is stored as a hash' : 'Password is stored as plain text in the server settings'}
          text={
            status.passwordIsHashed
              ? 'The server only keeps a scrambled form of the password.'
              : 'It works, but a hash is safer. Whoever manages the website can run "node scripts/hash-password.mjs" and set ADMIN_PASSWORD_HASH instead.'
          }
        />
        <ul className={styles.plainList}>
          <li>Five wrong passwords in a row lock sign-in from that connection for 15 minutes.</li>
          <li>Every change is checked on the server: nobody can save without being signed in.</li>
          <li>To change the email or password, update the server settings in Vercel and redeploy.</li>
        </ul>
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
