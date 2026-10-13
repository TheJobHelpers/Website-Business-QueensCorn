import Link from 'next/link';
import { AlertTriangle, CalendarDays, HeartHandshake, Popcorn, ShoppingBag } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import styles from '@/components/admin/admin.module.css';
import { eventEndDate, weekdayLabel } from '@/lib/events';
import { requireAdminPage } from '@/server/auth/guard';
import { events, fundraisers, products } from '@/server/repositories';
import { getStore } from '@/server/store';

// This page is rendered per request (it reads the session cookie), so "now" is the request time.
const requestTime = () => Date.now();

// Overview: what is live on the website right now, and anything that needs the owners' attention.
export default async function AdminOverviewPage() {
  await requireAdminPage();
  const [allEvents, allProducts, allFundraisers] = await Promise.all([events.list(), products.list(), fundraisers.list()]);

  const now = requestTime();
  const ends = (e: (typeof allEvents)[number]) => eventEndDate(e)?.getTime() ?? Infinity;
  const upcoming = allEvents.filter((e) => ends(e) >= now).sort((a, b) => ends(a) - ends(b));
  const pastCount = allEvents.length - upcoming.length;
  const next = upcoming[0];
  const visible = allProducts.filter((p) => !p.hidden);
  const featured = visible.filter((p) => p.featured);
  const shopifyConnected = Boolean(
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN && process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN
  );

  const attention: { text: string; href: string; link: string }[] = [];
  if (getStore().kind === 'readonly') {
    attention.push({ text: 'The live website has no database connected, so changes cannot be saved.', href: '/admin/settings', link: 'How to fix it' });
  }
  if (upcoming.length === 0) {
    attention.push({ text: 'There are no upcoming events on the website.', href: '/admin/events', link: 'Add an event' });
  }
  if (pastCount > 0) {
    attention.push({ text: `${pastCount} finished event${pastCount === 1 ? '' : 's'} can be cleared out.`, href: '/admin/events', link: 'Review' });
  }
  if (featured.length > 4) {
    attention.push({ text: `${featured.length} flavors are marked for the homepage, but only four fit.`, href: '/admin/products', link: 'Choose four' });
  }
  if (!shopifyConnected) {
    attention.push({ text: 'Online checkout is not connected: the cart sends shoppers to the contact form.', href: '/admin/settings', link: 'Details' });
  }

  return (
    <>
      <PageHeader title="Overview" text="What is live on the website right now." />

      {attention.length > 0 && (
        <section className={`${styles.card} ${styles.attention}`} aria-labelledby="attention-title">
          <h2 id="attention-title" className={styles.cardTitle}>
            <AlertTriangle size={20} aria-hidden="true" /> Needs your attention
          </h2>
          <ul className={styles.attentionList}>
            {attention.map((item) => (
              <li key={item.text}>
                <span>{item.text}</span>
                <Link href={item.href} className={styles.linkBtn}>
                  {item.link}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className={styles.stats}>
        <Link href="/admin/events" className={styles.stat}>
          <CalendarDays size={22} aria-hidden="true" />
          <span className={styles.statLabel}>Upcoming events</span>
          <b className={styles.statValue}>{upcoming.length}</b>
          <span className={styles.statNote}>
            {next ? `Next: ${weekdayLabel(next)}, ${next.month} ${next.day.replace('-', '–')} · ${next.title}` : 'Nothing scheduled'}
          </span>
        </Link>

        <Link href="/admin/products" className={styles.stat}>
          <Popcorn size={22} aria-hidden="true" />
          <span className={styles.statLabel}>Flavors in the shop</span>
          <b className={styles.statValue}>{visible.length}</b>
          <span className={styles.statNote}>
            {allProducts.length - visible.length > 0 ? `${allProducts.length - visible.length} hidden · ` : ''}
            {featured.length} on the homepage
          </span>
        </Link>

        <Link href="/admin/fundraisers" className={styles.stat}>
          <HeartHandshake size={22} aria-hidden="true" />
          <span className={styles.statLabel}>Fundraising campaigns</span>
          <b className={styles.statValue}>{allFundraisers.length}</b>
          <span className={styles.statNote}>
            ${allFundraisers.reduce((sum, f) => sum + f.raisedAmount, 0).toLocaleString('en-US')} raised in total
          </span>
        </Link>

        <Link href={shopifyConnected ? '/admin/orders' : '/admin/settings'} className={styles.stat}>
          <ShoppingBag size={22} aria-hidden="true" />
          <span className={styles.statLabel}>Orders</span>
          <b className={styles.statValue}>{shopifyConnected ? 'Shopify' : 'By message'}</b>
          <span className={styles.statNote}>
            {shopifyConnected
              ? 'See what has to be made on the Orders screen. Payments and refunds are in your Shopify admin.'
              : 'Until Shopify is connected, orders arrive through the contact form.'}
          </span>
        </Link>
      </div>
    </>
  );
}
