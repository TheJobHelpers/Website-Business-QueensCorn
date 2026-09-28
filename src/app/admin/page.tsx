'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { isShopifyConfigured } from '@/lib/shopify';
import styles from './Admin.module.css';

type AdminTab = 'events' | 'fundraisers' | 'products' | 'shipping';

export default function AdminPortalPage() {
  const {
    products,
    events,
    fundraisers,
    addEvent,
    deleteEvent,
    toggleEventPickup,
    addFundraiser,
    updateFundraiserRaised,
    deleteFundraiser,
    updateProductPrice,
    resetStoreData,
  } = useCart();

  const [activeTab, setActiveTab] = useState<AdminTab>('events');
  const [priceEdits, setPriceEdits] = useState<Record<string, string>>({});

  // New Event Form State
  const [evtMonth, setEvtMonth] = useState('Nov');
  const [evtDay, setEvtDay] = useState('21');
  const [evtYear, setEvtYear] = useState('2026');
  const [evtTitle, setEvtTitle] = useState('');
  const [evtTime, setEvtTime] = useState('9:00 am - 1:00 pm');
  const [evtLocation, setEvtLocation] = useState('Marana, AZ');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtPickup, setEvtPickup] = useState(true);

  // New Fundraiser Form State
  const [fundOrg, setFundOrg] = useState('');
  const [fundCategory, setFundCategory] = useState('High School & Youth');
  const [fundCode, setFundCode] = useState('');
  const [fundLocation, setFundLocation] = useState('Marana, AZ');
  const [fundEndDate, setFundEndDate] = useState('Dec 15, 2026');
  const [fundGoal, setFundGoal] = useState(2000);
  const [fundDesc, setFundDesc] = useState('');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle.trim()) return;
    addEvent({
      month: evtMonth,
      day: evtDay,
      year: evtYear,
      title: evtTitle.trim(),
      time: evtTime,
      location: evtLocation,
      desc:
        evtDesc.trim() ||
        "Join The Queen's Corn for freshly popped handcrafted kettle corn.",
      pickupAvailable: evtPickup,
    });
    setEvtTitle('');
    setEvtDesc('');
  };

  const handleAddFundraiser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundOrg.trim() || !fundCode.trim()) return;
    addFundraiser({
      organization: fundOrg.trim(),
      category: fundCategory,
      code: fundCode.trim().toUpperCase(),
      location: fundLocation,
      endDate: fundEndDate,
      goalAmount: Number(fundGoal) || 2000,
      raisedAmount: 0,
      description:
        fundDesc.trim() ||
        "50% of every Queen's Corn order using this code goes directly to support our organization.",
    });
    setFundOrg('');
    setFundCode('');
    setFundDesc('');
  };

  const shopifyConnected = isShopifyConfigured();

  return (
    <main className={styles.page}>
      <div className="main-container">
        {/* Header */}
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>The Queen&apos;s Corn • Owner Dashboard</span>
            <h1 className={styles.title}>Store, Events &amp; Shipping Portal</h1>
            <p className={styles.subtitle}>
              Manage upcoming Farmers&apos; Markets, 50% Fundraising campaigns, popcorn pricing, and Arizona USPS shipping in one place.
            </p>
          </div>
          <div className={styles.headerActions}>
            <span
              className={`${styles.statusPill} ${
                shopifyConnected ? styles.statusConnected : styles.statusLocal
              }`}
            >
              {shopifyConnected ? '● Shopify Connected' : '● Local Live Sync Active'}
            </span>
            <button
              type="button"
              onClick={resetStoreData}
              className={styles.resetBtn}
            >
              Reset Defaults
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className={styles.tabs}>
          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`${styles.tabBtn} ${
              activeTab === 'events' ? styles.tabBtnActive : ''
            }`}
          >
            📅 1. Events Placement ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fundraisers')}
            className={`${styles.tabBtn} ${
              activeTab === 'fundraisers' ? styles.tabBtnActive : ''
            }`}
          >
            🎗️ 2. Fundraising ({fundraisers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`${styles.tabBtn} ${
              activeTab === 'products' ? styles.tabBtnActive : ''
            }`}
          >
            🍿 3. Flavors &amp; Pricing ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={`${styles.tabBtn} ${
              activeTab === 'shipping' ? styles.tabBtnActive : ''
            }`}
          >
            🚚 4. Arizona Shipping &amp; Shopify
          </button>
        </div>

        {/* TAB 1: EVENTS PLACEMENT */}
        {activeTab === 'events' && (
          <div className={styles.panelGrid}>
            {/* Left: Add New Event Form */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Add Upcoming Market / Event</h2>
              <p className={styles.cardSubtitle}>
                New events appear immediately on <Link href="/events">/events</Link> and inside the Cart Pickup selector.
              </p>

              <form onSubmit={handleAddEvent} className={styles.form}>
                <div className={styles.row3}>
                  <div className={styles.field}>
                    <label>Month</label>
                    <input
                      type="text"
                      value={evtMonth}
                      onChange={(e) => setEvtMonth(e.target.value)}
                      placeholder="Nov"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Day(s)</label>
                    <input
                      type="text"
                      value={evtDay}
                      onChange={(e) => setEvtDay(e.target.value)}
                      placeholder="21"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Year</label>
                    <input
                      type="text"
                      value={evtYear}
                      onChange={(e) => setEvtYear(e.target.value)}
                      placeholder="2026"
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label>Event / Market Title</label>
                  <input
                    type="text"
                    value={evtTitle}
                    onChange={(e) => setEvtTitle(e.target.value)}
                    placeholder="e.g. Marana Saturday Farmers' Market"
                    required
                  />
                </div>

                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label>Time</label>
                    <input
                      type="text"
                      value={evtTime}
                      onChange={(e) => setEvtTime(e.target.value)}
                      placeholder="9:00 am - 1:00 pm"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Location (City, AZ)</label>
                    <input
                      type="text"
                      value={evtLocation}
                      onChange={(e) => setEvtLocation(e.target.value)}
                      placeholder="Marana, AZ"
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={evtDesc}
                    onChange={(e) => setEvtDesc(e.target.value)}
                    placeholder="Details about the event, booth location, or special flavors..."
                  />
                </div>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={evtPickup}
                    onChange={(e) => setEvtPickup(e.target.checked)}
                  />
                  <span>Enable Free Pre-Order Pickup at this Event</span>
                </label>

                <button type="submit" className={`${styles.primaryBtn} shimmer-btn`}>
                  + Publish Event to Website
                </button>
              </form>
            </div>

            {/* Right: Existing Events List */}
            <div className={styles.card}>
              <div className={styles.cardHeaderRow}>
                <h2 className={styles.cardTitle}>Published Events ({events.length})</h2>
                <Link href="/events" className={styles.previewLink}>
                  View Live /events &rarr;
                </Link>
              </div>

              <div className={styles.itemList}>
                {events.map((evt) => (
                  <div key={evt.id} className={styles.listItem}>
                    <div className={styles.listItemMain}>
                      <span className={styles.badgeDate}>
                        {evt.month} {evt.day}, {evt.year}
                      </span>
                      <h4>{evt.title}</h4>
                      <p className={styles.metaText}>
                        {evt.time} • {evt.location}
                      </p>
                    </div>
                    <div className={styles.listItemActions}>
                      <button
                        type="button"
                        onClick={() => toggleEventPickup(evt.id)}
                        className={`${styles.smallBtn} ${
                          evt.pickupAvailable ? styles.smallBtnActive : ''
                        }`}
                      >
                        {evt.pickupAvailable ? '✓ Pickup On' : 'Pickup Off'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteEvent(evt.id)}
                        className={styles.deleteBtn}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FUNDRAISING CAMPAIGNS */}
        {activeTab === 'fundraisers' && (
          <div className={styles.panelGrid}>
            {/* Left: Create New Fundraiser */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Create 50% Fundraiser Campaign</h2>
              <p className={styles.cardSubtitle}>
                Launch a school, sports team, or community fundraiser on{' '}
                <Link href="/fundraising">/fundraising</Link>.
              </p>

              <form onSubmit={handleAddFundraiser} className={styles.form}>
                <div className={styles.field}>
                  <label>Organization / School Name</label>
                  <input
                    type="text"
                    value={fundOrg}
                    onChange={(e) => setFundOrg(e.target.value)}
                    placeholder="e.g. Tucson Youth Baseball League"
                    required
                  />
                </div>

                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label>Tracking Code</label>
                    <input
                      type="text"
                      value={fundCode}
                      onChange={(e) => setFundCode(e.target.value.toUpperCase())}
                      placeholder="e.g. BASEBALL50"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Goal Amount ($)</label>
                    <input
                      type="number"
                      value={fundGoal}
                      onChange={(e) => setFundGoal(Number(e.target.value))}
                      min={100}
                      step={100}
                      required
                    />
                  </div>
                </div>

                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label>Category</label>
                    <input
                      type="text"
                      value={fundCategory}
                      onChange={(e) => setFundCategory(e.target.value)}
                      placeholder="Youth Athletics"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>End Date</label>
                    <input
                      type="text"
                      value={fundEndDate}
                      onChange={(e) => setFundEndDate(e.target.value)}
                      placeholder="Dec 15, 2026"
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label>City / Location</label>
                  <input
                    type="text"
                    value={fundLocation}
                    onChange={(e) => setFundLocation(e.target.value)}
                    placeholder="Marana / Tucson, AZ"
                  />
                </div>

                <div className={styles.field}>
                  <label>Campaign Description</label>
                  <textarea
                    rows={2}
                    value={fundDesc}
                    onChange={(e) => setFundDesc(e.target.value)}
                    placeholder="What is this organization raising funds for?"
                  />
                </div>

                <button type="submit" className={`${styles.primaryBtn} shimmer-btn`}>
                  + Launch Fundraiser Campaign
                </button>
              </form>
            </div>

            {/* Right: Active Fundraisers List */}
            <div className={styles.card}>
              <div className={styles.cardHeaderRow}>
                <h2 className={styles.cardTitle}>
                  Active Campaigns ({fundraisers.length})
                </h2>
                <Link href="/fundraising" className={styles.previewLink}>
                  View Live /fundraising &rarr;
                </Link>
              </div>

              <div className={styles.itemList}>
                {fundraisers.map((fund) => {
                  const payoutOwed = Math.round(fund.raisedAmount * 0.5);
                  return (
                    <div key={fund.id} className={styles.listItem}>
                      <div className={styles.listItemMain}>
                        <span className={styles.badgeDate}>
                          Code: {fund.code} • Ends {fund.endDate}
                        </span>
                        <h4>{fund.organization}</h4>
                        <p className={styles.metaText}>
                          Sales: <strong>${fund.raisedAmount.toLocaleString()}</strong> / $
                          {fund.goalAmount.toLocaleString()} •{' '}
                          <span className={styles.payoutHighlight}>
                            50% Payout: ${payoutOwed.toLocaleString()}
                          </span>
                        </p>
                      </div>
                      <div className={styles.listItemActions}>
                        <button
                          type="button"
                          onClick={() =>
                            updateFundraiserRaised(fund.id, fund.raisedAmount + 50)
                          }
                          className={styles.smallBtn}
                        >
                          +$50 Sales
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteFundraiser(fund.id)}
                          className={styles.deleteBtn}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS & PRICING */}
        {activeTab === 'products' && (
          <div className={styles.card}>
            <div className={styles.cardHeaderRow}>
              <div>
                <h2 className={styles.cardTitle}>
                  The Queen&apos;s Corn Flavor Catalog ({products.length})
                </h2>
                <p className={styles.cardSubtitle}>
                  Update base bag prices below or manage full size variants in Shopify Products.
                </p>
              </div>
              <Link href="/shop" className={styles.previewLink}>
                View Live /shop &rarr;
              </Link>
            </div>

            <div className={styles.productGrid}>
              {products.map((product) => (
                <div key={product.id} className={styles.productRow}>
                  <div className={styles.productThumb}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="60px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className={styles.productMeta}>
                    <span className={styles.badgeDate}>{product.category}</span>
                    <h4>{product.name}</h4>
                    <p className={styles.metaText}>Current Base Price: {product.price}</p>
                  </div>
                  <div className={styles.priceEditBox}>
                    <input
                      type="text"
                      placeholder={product.price}
                      value={priceEdits[product.id] ?? ''}
                      onChange={(e) =>
                        setPriceEdits((prev) => ({
                          ...prev,
                          [product.id]: e.target.value,
                        }))
                      }
                      className={styles.priceInput}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (priceEdits[product.id]) {
                          updateProductPrice(product.id, priceEdits[product.id]);
                          setPriceEdits((prev) => ({ ...prev, [product.id]: '' }));
                        }
                      }}
                      className={styles.smallBtn}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ARIZONA SHIPPING & SHOPIFY HUB */}
        {activeTab === 'shipping' && (
          <div className={styles.panelGrid}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Arizona Shipping &amp; Label Tools</h2>
              <p className={styles.cardSubtitle}>
                Quick-launch tools for printing discounted USPS Ground Advantage (1–2 day AZ delivery) and UPS labels.
              </p>

              <div className={styles.itemList}>
                <div className={styles.listItem}>
                  <div className={styles.listItemMain}>
                    <span className={styles.badgeDate}>Recommended • $0/mo</span>
                    <h4>Pirate Ship (USPS Ground Advantage &amp; Cubic)</h4>
                    <p className={styles.metaText}>
                      Syncs with Shopify to print 1–2 day Arizona shipping labels ($4.25–$6.50 per box).
                    </p>
                  </div>
                  <a
                    href="https://ship.pirateship.com"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.smallBtnActive}
                  >
                    Open Pirate Ship &nearr;
                  </a>
                </div>

                <div className={styles.listItem}>
                  <div className={styles.listItemMain}>
                    <span className={styles.badgeDate}>All-In-One Storefront</span>
                    <h4>Shopify Admin Orders &amp; Shipping</h4>
                    <p className={styles.metaText}>
                      View online orders, Market Pickup reservations, and 50% Fundraiser tags.
                    </p>
                  </div>
                  <a
                    href="https://admin.shopify.com"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.smallBtnActive}
                  >
                    Open Shopify Admin &nearr;
                  </a>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Connect Live Shopify Storefront Keys</h2>
              <p className={styles.cardSubtitle}>
                Add these 2 keys to your <code>.env.local</code> file (or Vercel Environment Variables) to switch from Local Live Sync to Shopify Hosted Checkout:
              </p>

              <pre className={styles.codeBlock}>
{`NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=the-queens-corn.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_token`}
              </pre>

              <div className={styles.guideSteps}>
                <p>
                  <strong>1. Products:</strong> Add your 8 Queen&apos;s Corn flavors under <em>Shopify Admin &rarr; Products</em>.
                </p>
                <p>
                  <strong>2. Events &amp; Fundraisers:</strong> Manage directly here in <code>/admin</code> or create <code>event</code> and <code>fundraiser</code> entries under <em>Shopify Admin &rarr; Content &rarr; Metaobjects</em>.
                </p>
                <p>
                  <strong>3. Shipping:</strong> Set Free AZ Shipping at <strong>$35+</strong> and enable Free Local Pickup for Farmers&apos; Markets.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
