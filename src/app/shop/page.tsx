'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import ShopProductCard from '@/components/shop/ShopProductCard';
import Button from '@/components/ui/Button';
import { CATEGORIES } from '@/data/products';
import { useCart, FREE_AZ_SHIPPING_THRESHOLD, SHIPPING_AVAILABLE } from '@/context/CartContext';
import { getUpcomingEvents, pickupLabel, weekdayLabel } from '@/lib/events';
import { BAG_SIZES, bagPrice, formatPrice } from '@/lib/shop';
import { useHydrated } from '@/lib/useHydrated';
import styles from './Shop.module.css';

// Shop blueprint (wiki/design-system/shop-page-blueprint.html): the page is for buying.
// A compact header settles how you get it, taste chips filter, every card shows the three
// sizes and prices, a bag bar keeps the total in view, and three helpers catch stalled shoppers.
const STARTER_FLAVOR_ID = '6'; // Caramel Cheddar: sweet and savory in one bag
const TASTES = CATEGORIES.filter((c) => c !== 'All Flavors');
type Taste = (typeof TASTES)[number];

export default function ShopPage() {
  const [taste, setTaste] = useState<Taste | 'All'>('All');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [starterAdded, setStarterAdded] = useState(false);
  const hydrated = useHydrated();
  const {
    products,
    events,
    fundraisers,
    totalItems,
    subtotal,
    fulfillmentMethod,
    selectedPickupEvent,
    selectedFundraiserCode,
    setFulfillmentMethod,
    selectPickupForEvent,
    setSelectedFundraiserCode,
    addItem,
    openDrawer,
  } = useCart();

  const shown = taste === 'All' ? products : products.filter((p) => p.category === taste);
  // Date filtering only after hydration: the page is prerendered at build time.
  const markets = hydrated ? getUpcomingEvents(events).filter((e) => e.pickupAvailable !== false) : [];
  const activeFundraiser = fundraisers.find((f) => f.code === selectedFundraiserCode);
  const starter = products.find((p) => p.id === STARTER_FLAVOR_ID);
  const lowest = Math.min(...products.map((p) => bagPrice(p.price, 1)));
  const isPickup = fulfillmentMethod === 'pickup';
  const toFreeShipping = Math.max(0, FREE_AZ_SHIPPING_THRESHOLD - subtotal);

  const marketSelect = (
    <select
      className={styles.marketSelect}
      aria-label="Market to pick up at"
      value={hydrated ? selectedPickupEvent : ''}
      onChange={(e) => selectPickupForEvent(e.target.value)}
    >
      {markets.length === 0 && <option value="">{hydrated ? 'No markets scheduled yet' : 'Loading markets…'}</option>}
      {markets.map((event) => (
        <option key={event.id} value={pickupLabel(event)}>
          {weekdayLabel(event)}, {event.month} {event.day.replace('-', '–')} · {event.title}
        </option>
      ))}
    </select>
  );

  const applyCode = (e: FormEvent) => {
    e.preventDefault();
    const match = fundraisers.find((f) => f.code.toLowerCase() === code.trim().toLowerCase());
    setCodeError(!match);
    if (match) {
      setSelectedFundraiserCode(match.code);
      setCode('');
    }
  };

  const addStarter = () => {
    if (!starter) return;
    addItem(starter, BAG_SIZES[0].key, 1);
    setStarterAdded(true);
    setTimeout(() => setStarterAdded(false), 1400);
  };

  return (
    <main className={styles.page}>
      <div className="main-container">
        {/* 1. Compact header: title and facts on the left, how you get it on the right */}
        <header className={`${styles.head} enter`}>
          <Image src="/popcorn-scoop-fresh.jpg" alt="" fill priority sizes="100vw" className={`${styles.headBg} fx-parallax`} />
          <div className={styles.intro}>
            <span className={styles.eyebrow}>Shop</span>
            <h1 className={styles.title}>
              Pick your <em>kettle corn.</em>
            </h1>
            <p className={styles.lede}>Popped fresh for every order. Every flavor in three sizes.</p>
            <ul className={styles.facts}>
              <li>{products.length} flavors</li>
              <li>From {formatPrice(lowest)}</li>
              <li>{SHIPPING_AVAILABLE ? `Free AZ shipping over $${FREE_AZ_SHIPPING_THRESHOLD}` : 'Free market pickup'}</li>
            </ul>
          </div>

          <div className={styles.how}>
            {SHIPPING_AVAILABLE ? (
              <>
                <p className={styles.howTitle}>
                  How do you want it? <small>You can change this in your bag.</small>
                </p>
                <div className={styles.seg} role="radiogroup" aria-label="How do you want it">
                  <label className={!isPickup ? styles.segOn : ''}>
                    <input
                      type="radio"
                      name="how"
                      checked={!isPickup}
                      onChange={() => setFulfillmentMethod('shipping')}
                    />
                    <span className={styles.dot} />
                    <span className={styles.segText}>
                      <b>Ship it to me</b>
                      <span>Anywhere in Arizona · free over ${FREE_AZ_SHIPPING_THRESHOLD}</span>
                    </span>
                  </label>
                  <label className={isPickup ? styles.segOn : ''}>
                    <input
                      type="radio"
                      name="how"
                      checked={isPickup}
                      onChange={() => setFulfillmentMethod('pickup')}
                    />
                    <span className={styles.dot} />
                    <span className={styles.segText}>
                      <b>Pick up at a market</b>
                      <span>Always free</span>
                      {marketSelect}
                    </span>
                  </label>
                </div>
              </>
            ) : (
              <>
                <p className={styles.howTitle}>
                  Where will you pick it up? <small>Pickup is always free.</small>
                </p>
                {marketSelect}
                <p className={styles.howNote}>Pre-order here, skip the line at the stand. Shipping is coming soon.</p>
              </>
            )}
          </div>
        </header>

        {/* 2. Taste chips (sticky while the grid scrolls) */}
        <div className={styles.browse}>
          <div id="flavor-grid" className={styles.chipsBar}>
            <div className={styles.chips} role="group" aria-label="Filter by taste">
              <button
                type="button"
                className={`${styles.chip} ${taste === 'All' ? styles.chipOn : ''}`}
                aria-pressed={taste === 'All'}
                onClick={() => setTaste('All')}
              >
                All <span className={styles.chipCount}>{products.length}</span>
              </button>
              {TASTES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.chip} ${taste === t ? styles.chipOn : ''}`}
                  aria-pressed={taste === t}
                  onClick={() => setTaste(t)}
                >
                  <i className={styles[t.toLowerCase()]} />
                  {t} <span className={styles.chipCount}>{products.filter((p) => p.category === t).length}</span>
                </button>
              ))}
            </div>
            <span className={styles.count} aria-live="polite">
              Showing {shown.length} {shown.length === 1 ? 'flavor' : 'flavors'}
            </span>
          </div>

          {/* 3. Flavors, with sizes on every card */}
          <div className={styles.grid}>
            {shown.map((product, i) => (
              <ShopProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>

        {/* 4. Helpers for shoppers who stall */}
        <section className={`${styles.helpers} fx-stagger`} aria-label="Need a hand?">
          {starter && (
            <div className={styles.helper}>
              <span className={styles.helperEyebrow}>Can&apos;t decide?</span>
              <h2 className={styles.helperTitle}>Start with {starter.name}</h2>
              <p>Sweet and savory in one bag: the easiest way to try both.</p>
              <div className={styles.helperRow}>
                <Button variant="kettle" size="sm" onClick={addStarter}>
                  {starterAdded ? 'Added ✓' : `Add a Small · ${formatPrice(bagPrice(starter.price, 1))}`}
                </Button>
              </div>
            </div>
          )}

          <div className={styles.helper}>
            <span className={styles.helperEyebrow}>Ordering for a fundraiser?</span>
            {activeFundraiser ? (
              <>
                <h2 className={styles.helperTitle}>Supporting {activeFundraiser.organization}</h2>
                <p>Half of your order goes to the team (code {activeFundraiser.code}).</p>
                <div className={styles.helperRow}>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedFundraiserCode('')}>
                    Remove code
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className={styles.helperTitle}>Enter your group&apos;s code</h2>
                <p className={codeError ? styles.helperError : ''} role={codeError ? 'alert' : undefined}>
                  {codeError
                    ? 'We could not find that code. Check the spelling with your group.'
                    : 'Half of your order goes to the team.'}
                </p>
                <form className={styles.helperRow} onSubmit={applyCode}>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setCodeError(false);
                    }}
                    aria-label="Fundraiser code"
                    placeholder="e.g. TIGERS50"
                    autoComplete="off"
                  />
                  <Button variant="dark" size="sm" type="submit" disabled={code.trim() === ''}>
                    Apply
                  </Button>
                </form>
              </>
            )}
          </div>

          <div className={styles.helper}>
            <span className={styles.helperEyebrow}>Big order?</span>
            <h2 className={styles.helperTitle}>Parties, weddings, company gifts</h2>
            <p>Talk to Bob &amp; Reina about bulk bags or popping live at your event.</p>
            <div className={styles.helperRow}>
              <Button variant="ghost" size="sm" href="/contact?subject=Wholesale%20Request">
                Ask about a big order
              </Button>
            </div>
          </div>
        </section>

        {/* 5. Bag bar: appears once the bag has something in it and stays in view */}
        {totalItems > 0 && (
          <div className={styles.bagBar} role="status">
            <span className={styles.bagSum}>
              {totalItems} {totalItems === 1 ? 'bag' : 'bags'} in your bag ·<b>{formatPrice(subtotal)}</b>
            </span>
            <span className={styles.bagNote}>
              {isPickup || !SHIPPING_AVAILABLE ? (
                selectedPickupEvent ? `Free pickup · ${selectedPickupEvent}` : 'Free market pickup'
              ) : (
                <>
                  {toFreeShipping === 0
                    ? 'You have free Arizona shipping'
                    : `${formatPrice(toFreeShipping)} away from free Arizona shipping`}
                  <span className={styles.bagProgress}>
                    <i style={{ width: `${Math.min(100, (subtotal / FREE_AZ_SHIPPING_THRESHOLD) * 100)}%` }} />
                  </span>
                </>
              )}
            </span>
            <Button variant="red" size="sm" onClick={openDrawer}>
              View bag &amp; check out
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
