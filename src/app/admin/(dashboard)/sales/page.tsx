import { AlertTriangle, CalendarDays, CalendarRange, Receipt, Sun } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import styles from '@/components/admin/admin.module.css';
import { requireAdminPage } from '@/server/auth/guard';
import { countBags, countedOrders, fetchRecentOrders, shopDay, sumTotals, tallyBags, type ShopOrder } from '@/server/shopify-orders';

// This page is rendered per request (it reads the session cookie), so "now" is the request time.
const requestTime = () => Date.now();

const DAY = 86400000;
const money = (amount: number) => amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const merchandise = (order: ShopOrder) => order.lines.reduce((sum, line) => sum + line.total, 0);
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;
const dayLabel = (day: string) =>
  new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(`${day}T12:00:00Z`));

function Bars({ rows, label }: { rows: { label: string; amount: number; value: string }[]; label: string }) {
  const highest = Math.max(...rows.map((row) => row.amount), 0);
  return (
    <ul className={styles.bars} aria-label={label}>
      {rows.map((row) => (
        <li key={row.label}>
          <span>{row.label}</span>
          <span className={styles.barTrack}>
            {row.amount > 0 && <span className={styles.barFill} style={{ width: `${(row.amount / highest) * 100}%` }} />}
          </span>
          <span className={styles.barValue}>{row.value}</span>
        </li>
      ))}
    </ul>
  );
}

// Sales screen: how the shop is doing, worked out from the last 60 days of Shopify orders.
// Shopify's own Analytics has the full history and payouts.
export default async function AdminSalesPage() {
  await requireAdminPage();
  const now = requestTime();
  const result = await fetchRecentOrders(now);

  if (!result.ok) {
    return (
      <>
        <PageHeader title="Sales" text="How the shop is doing." />
        <section className={styles.card}>
          <div className={`${styles.status} ${styles.statusWarn}`}>
            <AlertTriangle size={20} aria-hidden="true" />
            <div>
              <b>Sales cannot be shown yet</b>
              <p>{result.message}</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  const { orders, testOnly } = countedOrders(result.orders);
  const today = shopDay(now);
  const since = (days: number) => shopDay(now - (days - 1) * DAY);
  const within = (days: number) => orders.filter((order) => shopDay(order.createdAt) >= since(days));

  const todays = orders.filter((order) => shopDay(order.createdAt) === today);
  const week = within(7);
  const month = within(30);
  const summary = (list: ShopOrder[]) => `${plural(list.length, 'order')} · ${plural(countBags(list), 'bag')}`;

  const days = Array.from({ length: 14 }, (_, i) => shopDay(now - (13 - i) * DAY));
  const byDay = days.map((day) => {
    const list = orders.filter((order) => shopDay(order.createdAt) === day);
    return { label: day === today ? 'Today' : dayLabel(day), amount: sumTotals(list), value: list.length > 0 ? `${money(sumTotals(list))} · ${list.length}` : '—' };
  });

  const bestSellers = tallyBags(month).slice(0, 10);

  const fundraisers = new Map<string, { group: string; orders: number; sales: number }>();
  const markets = new Map<string, { orders: number; sales: number }>();
  for (const order of orders) {
    if (order.fundraiserCode) {
      const entry = fundraisers.get(order.fundraiserCode) ?? { group: order.fundraiserGroup || order.fundraiserCode, orders: 0, sales: 0 };
      entry.orders += 1;
      // half of the popcorn, not of any shipping or tax on the order
      entry.sales += merchandise(order);
      fundraisers.set(order.fundraiserCode, entry);
    }
    if (order.pickupMarket) {
      const entry = markets.get(order.pickupMarket) ?? { orders: 0, sales: 0 };
      entry.orders += 1;
      entry.sales += order.total;
      markets.set(order.pickupMarket, entry);
    }
  }

  return (
    <>
      <PageHeader title="Sales" text="How the shop is doing, from the last 60 days of orders. Shopify's Analytics has the full history and your payouts." />

      {testOnly && <p className={styles.cardNote}>Only test orders so far. They are counted here so you can try the screen; once a real order arrives, test orders are left out.</p>}
      {result.truncated && <p className={styles.cardNote}>Worked out from the newest 500 orders of the last 60 days.</p>}

      <div className={styles.stats}>
        <div className={`${styles.stat} ${styles.statPlain}`}>
          <Sun size={22} aria-hidden="true" />
          <span className={styles.statLabel}>Today</span>
          <b className={styles.statValue}>{money(sumTotals(todays))}</b>
          <span className={styles.statNote}>{summary(todays)}</span>
        </div>
        <div className={`${styles.stat} ${styles.statPlain}`}>
          <CalendarDays size={22} aria-hidden="true" />
          <span className={styles.statLabel}>Last 7 days</span>
          <b className={styles.statValue}>{money(sumTotals(week))}</b>
          <span className={styles.statNote}>{summary(week)}</span>
        </div>
        <div className={`${styles.stat} ${styles.statPlain}`}>
          <CalendarRange size={22} aria-hidden="true" />
          <span className={styles.statLabel}>Last 30 days</span>
          <b className={styles.statValue}>{money(sumTotals(month))}</b>
          <span className={styles.statNote}>{summary(month)}</span>
        </div>
        <div className={`${styles.stat} ${styles.statPlain}`}>
          <Receipt size={22} aria-hidden="true" />
          <span className={styles.statLabel}>Average order</span>
          <b className={styles.statValue}>{month.length > 0 ? money(sumTotals(month) / month.length) : '—'}</b>
          <span className={styles.statNote}>Over the last 30 days</span>
        </div>
      </div>

      <section className={styles.card} aria-labelledby="days-title">
        <h2 id="days-title" className={styles.cardTitle}>
          Day by day
        </h2>
        <Bars rows={byDay} label="Sales for each of the last 14 days" />
        <p className={styles.cardNote}>Sales and number of orders, in Arizona time.</p>
      </section>

      <section className={styles.card} aria-labelledby="best-title">
        <h2 id="best-title" className={styles.cardTitle}>
          Best sellers
        </h2>
        {bestSellers.length === 0 ? (
          <p className={styles.empty}>No bags sold in the last 30 days yet.</p>
        ) : (
          <Bars rows={bestSellers.map((bag) => ({ label: bag.label, amount: bag.quantity, value: `${plural(bag.quantity, 'bag')} · ${money(bag.total)}` }))} label="Bags sold per flavor and size in the last 30 days" />
        )}
        <p className={styles.cardNote}>Bags sold in the last 30 days.</p>
      </section>

      <section className={styles.card} aria-labelledby="fund-title">
        <h2 id="fund-title" className={styles.cardTitle}>
          Fundraisers
        </h2>
        {fundraisers.size === 0 ? (
          <p className={styles.empty}>No orders were placed for a fundraiser in the last 60 days.</p>
        ) : (
          <ul className={styles.rows}>
            {[...fundraisers.entries()]
              .sort(([, a], [, b]) => b.sales - a.sales)
              .map(([code, entry]) => (
                <li key={code} className={styles.row}>
                  <div className={styles.rowMain}>
                    <h3 className={styles.rowTitle}>
                      {entry.group} <span className={`${styles.tag} ${styles.tagMuted}`}>{code}</span>
                    </h3>
                    <p className={styles.rowMeta}>
                      <span>{plural(entry.orders, 'order')}</span>
                      <span>{money(entry.sales)} of popcorn</span>
                    </p>
                  </div>
                  <div className={styles.rowControls}>
                    <b>{money(entry.sales / 2)}</b>
                    <span className={styles.cardNote}>their 50%</span>
                  </div>
                </li>
              ))}
          </ul>
        )}
        <p className={styles.cardNote}>Half of the popcorn on each order in the last 60 days, before any discount, shipping or tax. Check against Shopify before paying a group.</p>
      </section>

      <section className={styles.card} aria-labelledby="market-title">
        <h2 id="market-title" className={styles.cardTitle}>
          By pickup market
        </h2>
        {markets.size === 0 ? (
          <p className={styles.empty}>No pickup orders in the last 60 days yet.</p>
        ) : (
          <Bars
            rows={[...markets.entries()]
              .sort(([, a], [, b]) => b.sales - a.sales)
              .map(([market, entry]) => ({ label: market, amount: entry.sales, value: `${money(entry.sales)} · ${entry.orders}` }))}
            label="Sales per pickup market in the last 60 days"
          />
        )}
      </section>
    </>
  );
}
