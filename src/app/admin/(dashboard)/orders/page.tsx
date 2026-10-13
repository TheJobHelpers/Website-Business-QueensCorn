import { AlertTriangle, ClipboardList, ExternalLink, PackageCheck, Popcorn } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import styles from '@/components/admin/admin.module.css';
import { getUpcomingEvents, pickupLabel } from '@/lib/events';
import { requireAdminPage } from '@/server/auth/guard';
import { events } from '@/server/repositories';
import { SHOP_TIME_ZONE, countBags, countedOrders, fetchRecentOrders, tallyBags, type ShopOrder } from '@/server/shopify-orders';

// This page is rendered per request (it reads the session cookie), so "now" is the request time.
const requestTime = () => Date.now();

const money = (amount: number) => amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const when = (iso: string) =>
  new Intl.DateTimeFormat('en-US', { timeZone: SHOP_TIME_ZONE, weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(iso));

const NO_MARKET = 'No pickup market on the order';

// Orders screen: what still has to be popped, grouped by the market it will be picked up at.
// Read live from Shopify; an order leaves this list when it is marked fulfilled there.
export default async function AdminOrdersPage() {
  await requireAdminPage();
  const now = requestTime();
  const [result, allEvents] = await Promise.all([fetchRecentOrders(now), events.list()]);

  if (!result.ok) {
    return (
      <>
        <PageHeader title="Orders" text="What still has to be made, market by market." />
        <section className={styles.card}>
          <div className={`${styles.status} ${styles.statusWarn}`}>
            <AlertTriangle size={20} aria-hidden="true" />
            <div>
              <b>Orders cannot be shown yet</b>
              <p>{result.message}</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  const { orders: counted, testOnly } = countedOrders(result.orders);
  const toMake = counted.filter((order) => !order.done);
  const handedOver = counted.length - toMake.length;

  // markets in calendar order, then anything else by name
  const calendar = getUpcomingEvents(allEvents, new Date(now)).map(pickupLabel);
  const rank = (market: string) => {
    const index = calendar.indexOf(market);
    return index < 0 ? calendar.length : index;
  };
  const groups = new Map<string, ShopOrder[]>();
  for (const order of toMake) {
    const market = order.pickupMarket || NO_MARKET;
    groups.set(market, [...(groups.get(market) ?? []), order]);
  }
  const markets = [...groups.entries()].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b));

  return (
    <>
      <PageHeader title="Orders" text="What still has to be made, market by market. Mark an order fulfilled in Shopify when you hand it over and it leaves this list." />

      {testOnly && <p className={styles.cardNote}>Only test orders so far. They are shown here so you can try the screen; real orders will replace them.</p>}
      {result.truncated && <p className={styles.cardNote}>Showing the newest 500 orders of the last 60 days.</p>}
      {!result.names && (
        <p className={styles.cardNote}>
          Customer names are not shown: Shopify does not share them with the dashboard app yet. In the Shopify developer dashboard, open the app&apos;s
          protected customer data settings and select the &quot;Name&quot; field.
        </p>
      )}

      <div className={styles.stats}>
        <div className={`${styles.stat} ${styles.statPlain}`}>
          <ClipboardList size={22} aria-hidden="true" />
          <span className={styles.statLabel}>Orders to make</span>
          <b className={styles.statValue}>{toMake.length}</b>
          <span className={styles.statNote}>{markets.length === 1 ? 'For 1 market' : `Across ${markets.length} markets`}</span>
        </div>
        <div className={`${styles.stat} ${styles.statPlain}`}>
          <Popcorn size={22} aria-hidden="true" />
          <span className={styles.statLabel}>Bags to pop</span>
          <b className={styles.statValue}>{countBags(toMake)}</b>
          <span className={styles.statNote}>{money(toMake.reduce((sum, order) => sum + order.total, 0))} in open orders</span>
        </div>
        <div className={`${styles.stat} ${styles.statPlain}`}>
          <PackageCheck size={22} aria-hidden="true" />
          <span className={styles.statLabel}>Handed over</span>
          <b className={styles.statValue}>{handedOver}</b>
          <span className={styles.statNote}>In the last 60 days</span>
        </div>
      </div>

      {markets.length === 0 ? (
        <section className={styles.card}>
          <p className={styles.empty}>Nothing to make right now. New orders appear here as soon as they are paid for.</p>
        </section>
      ) : (
        markets.map(([market, list]) => (
          <section key={market} className={styles.card} aria-label={market}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>
                {market} <span className={styles.count}>{list.length === 1 ? '1 order' : `${list.length} orders`}</span>
              </h2>
              <span className={styles.cardNote}>{countBags(list)} bags</span>
            </div>

            <ul className={styles.tallies} aria-label="Bags to pop for this market">
              {tallyBags(list).map((bag) => (
                <li key={bag.label}>
                  <b>{bag.quantity}</b> {bag.label}
                </li>
              ))}
            </ul>

            <ul className={styles.rows}>
              {list.map((order) => (
                <li key={order.id} className={styles.row}>
                  <div className={styles.rowMain}>
                    <h3 className={styles.rowTitle}>
                      {order.customerName ? `${order.customerName} · ${order.name}` : order.name}
                      {order.test && <span className={`${styles.tag} ${styles.tagMuted}`}>Test</span>}
                      {!order.paid && <span className={styles.tag}>Not paid</span>}
                      {order.fundraiserCode && <span className={styles.tag}>Fundraiser: {order.fundraiserGroup || order.fundraiserCode}</span>}
                    </h3>
                    <p className={styles.rowMeta}>
                      <span>{when(order.createdAt)}</span>
                      <span>{money(order.total)}</span>
                    </p>
                    <p className={styles.rowNote}>{order.lines.map((line) => `${line.quantity} × ${line.flavor}${line.size ? ` (${line.size})` : ''}`).join(', ')}</p>
                  </div>
                  <div className={styles.rowControls}>
                    <a href={order.adminUrl} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                      Open in Shopify <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}
