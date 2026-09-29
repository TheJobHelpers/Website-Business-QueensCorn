'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { isShopifyConfigured } from '@/lib/shopify';
import styles from './Admin.module.css';

type AdminSection =
  | 'overview'
  | 'orders'
  | 'events'
  | 'fundraisers'
  | 'products'
  | 'settings';

interface SampleOrder {
  id: string;
  customer: string;
  city: string;
  items: string;
  total: number;
  method: 'USPS Ground Advantage (AZ)' | 'Free Market Pickup';
  pickupEvent?: string;
  fundraiserCode?: string;
  status: 'Unfulfilled' | 'Label Printed' | 'Ready for Pickup';
  date: string;
}

const INITIAL_ORDERS: SampleOrder[] = [
  {
    id: '#QC-1048',
    customer: 'Sarah Jenkins',
    city: 'Scottsdale, AZ 85251',
    items: '2× Caramel (Med), 2× Jalapeño (Med)',
    total: 40.0,
    method: 'USPS Ground Advantage (AZ)',
    fundraiserCode: 'TIGERS50',
    status: 'Unfulfilled',
    date: 'Today, 9:42 AM',
  },
  {
    id: '#QC-1047',
    customer: 'Mark Thompson',
    city: 'Avondale, AZ 85392',
    items: '3× Caramel & Cheddar (Large)',
    total: 45.0,
    method: 'Free Market Pickup',
    pickupEvent: "Desert West Farmers' Market (Oct 10)",
    status: 'Ready for Pickup',
    date: 'Today, 8:15 AM',
  },
  {
    id: '#QC-1046',
    customer: 'Elena Rodriguez',
    city: 'Tucson, AZ 85718',
    items: '2× Regular Sweet & Salty (Med), 1× Cheddar (Med)',
    total: 30.0,
    method: 'USPS Ground Advantage (AZ)',
    fundraiserCode: 'OVSOCCER',
    status: 'Unfulfilled',
    date: 'Yesterday',
  },
  {
    id: '#QC-1045',
    customer: 'David Chen',
    city: 'Gilbert, AZ 85234',
    items: '4× Caramel Apple (Small)',
    total: 24.0,
    method: 'USPS Ground Advantage (AZ)',
    status: 'Label Printed',
    date: 'Yesterday',
  },
];

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

  // Sample Login State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('thequeenscornaz@gmail.com');
  const [loginPassword, setLoginPassword] = useState('queenscorn2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard Navigation State
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [orders, setOrders] = useState<SampleOrder[]>(INITIAL_ORDERS);
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter your email and password.');
      return;
    }
    setLoginError('');
    setIsAuthenticated(true);
  };

  const handlePrintLabel = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status:
                o.method === 'Free Market Pickup'
                  ? 'Ready for Pickup'
                  : 'Label Printed',
            }
          : o
      )
    );
  };

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
  const totalFundraiserSales = fundraisers.reduce((s, f) => s + f.raisedAmount, 0);
  const unfulfilledCount = orders.filter((o) => o.status === 'Unfulfilled').length;

  // ---------------------------------------------------------------------------
  // 1. SAMPLE LOGIN UI (Standalone Full-Screen — No Landing Page Navbar/Footer)
  // ---------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className={styles.loginScreen}>
        <div className={styles.loginGlow} />
        <div className={styles.loginCard}>
          <div className={styles.loginBrand}>
            <div className={styles.loginLogoBox}>
              <Image
                src="/logo.webp"
                alt="The Queen's Corn"
                width={56}
                height={56}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div>
              <span className={styles.loginBadge}>Owner &amp; Operations Portal</span>
              <h1 className={styles.loginTitle}>The Queen&apos;s Corn</h1>
            </div>
          </div>

          <p className={styles.loginSubtitle}>
            Sign in to manage Arizona USPS shipping labels, Farmers&apos; Market events, and 50% fundraising campaigns.
          </p>

          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.field}>
              <label htmlFor="admin-email">Owner Email</label>
              <input
                id="admin-email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="thequeenscornaz@gmail.com"
                required
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
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            {loginError && <p className={styles.errorText}>{loginError}</p>}

            <div className={styles.loginMetaRow}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" defaultChecked />
                <span>Keep me signed in on this device</span>
              </label>
            </div>

            <button type="submit" className={`${styles.loginSubmitBtn} shimmer-btn`}>
              Sign In to Admin Dashboard &rarr;
            </button>
          </form>

          <div className={styles.demoNotice}>
            <span>Demo Credentials Pre-Filled:</span> Just click{' '}
            <strong>Sign In to Admin Dashboard</strong> above to enter as{' '}
            <strong>Bob &amp; Reina</strong>.
          </div>

          <div className={styles.loginFooter}>
            <Link href="/" className={styles.backStoreLink}>
              &larr; Return to Public Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. STANDALONE SIDEBAR ADMIN DASHBOARD
  // ---------------------------------------------------------------------------
  return (
    <div className={styles.dashboardShell}>
      {/* Left Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.sidebarLogo}>
            <Image
              src="/logo.webp"
              alt="The Queen's Corn"
              width={42}
              height={42}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div>
            <h2 className={styles.sidebarTitle}>The Queen&apos;s Corn</h2>
            <span className={styles.sidebarSub}>Admin Workspace</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <span className={styles.navGroupLabel}>Operations</span>
          <button
            type="button"
            onClick={() => setActiveSection('overview')}
            className={`${styles.navItem} ${
              activeSection === 'overview' ? styles.navItemActive : ''
            }`}
          >
            <span>📊 Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('orders')}
            className={`${styles.navItem} ${
              activeSection === 'orders' ? styles.navItemActive : ''
            }`}
          >
            <span>📦 Orders &amp; AZ Shipping</span>
            {unfulfilledCount > 0 && (
              <span className={styles.navBadge}>{unfulfilledCount}</span>
            )}
          </button>

          <span className={styles.navGroupLabel}>CMS &amp; Programs</span>
          <button
            type="button"
            onClick={() => setActiveSection('events')}
            className={`${styles.navItem} ${
              activeSection === 'events' ? styles.navItemActive : ''
            }`}
          >
            <span>📅 Events Placement</span>
            <span className={styles.navCount}>{events.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('fundraisers')}
            className={`${styles.navItem} ${
              activeSection === 'fundraisers' ? styles.navItemActive : ''
            }`}
          >
            <span>🎗️ Fundraising (50%)</span>
            <span className={styles.navCount}>{fundraisers.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('products')}
            className={`${styles.navItem} ${
              activeSection === 'products' ? styles.navItemActive : ''
            }`}
          >
            <span>🍿 Flavors &amp; Catalog</span>
            <span className={styles.navCount}>{products.length}</span>
          </button>

          <span className={styles.navGroupLabel}>Integrations</span>
          <button
            type="button"
            onClick={() => setActiveSection('settings')}
            className={`${styles.navItem} ${
              activeSection === 'settings' ? styles.navItemActive : ''
            }`}
          >
            <span>⚙️ Shopify &amp; Carriers</span>
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.ownerProfile}>
            <div className={styles.ownerAvatar}>BR</div>
            <div>
              <strong>Bob &amp; Reina</strong>
              <span>Marana, AZ • Owners</span>
            </div>
          </div>

          <div className={styles.sidebarFooterActions}>
            <Link href="/" className={styles.storefrontBtn}>
              View Storefront &nearr;
            </Link>
            <button
              type="button"
              onClick={() => setIsAuthenticated(false)}
              className={styles.logoutBtn}
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainArea}>
        {/* Top Bar */}
        <header className={styles.topbar}>
          <div>
            <h1 className={styles.topbarTitle}>
              {activeSection === 'overview' && 'Operations Overview'}
              {activeSection === 'orders' && 'Orders & Arizona Shipping Queue'}
              {activeSection === 'events' && 'Events Placement Manager'}
              {activeSection === 'fundraisers' && '50% Fundraising Campaigns'}
              {activeSection === 'products' && "The Queen's Corn Flavor Catalog"}
              {activeSection === 'settings' && 'Shopify & Shipping Carrier Setup'}
            </h1>
            <p className={styles.topbarSub}>
              Changes made here sync immediately with your public storefront pages.
            </p>
          </div>

          <div className={styles.topbarRight}>
            <span
              className={`${styles.statusPill} ${
                shopifyConnected ? styles.statusConnected : styles.statusLocal
              }`}
            >
              {shopifyConnected ? '● Shopify Connected' : '● Live Store Sync Active'}
            </span>
            <button
              type="button"
              onClick={resetStoreData}
              className={styles.resetBtn}
            >
              Reset Demo Data
            </button>
          </div>
        </header>

        <div className={styles.workspace}>
          {/* SECTION 1: OVERVIEW */}
          {activeSection === 'overview' && (
            <div className={styles.sectionStack}>
              <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                  <span className={styles.kpiLabel}>Unfulfilled AZ Orders</span>
                  <strong className={styles.kpiValue}>{unfulfilledCount}</strong>
                  <span className={styles.kpiMeta}>
                    USPS Ground Advantage (1–2 Day AZ)
                  </span>
                </div>
                <div className={styles.kpiCard}>
                  <span className={styles.kpiLabel}>Active Fundraiser Sales</span>
                  <strong className={styles.kpiValue}>
                    ${totalFundraiserSales.toLocaleString()}
                  </strong>
                  <span className={styles.kpiMeta}>
                    50% Giveback: ${(totalFundraiserSales * 0.5).toLocaleString()} owed
                  </span>
                </div>
                <div className={styles.kpiCard}>
                  <span className={styles.kpiLabel}>Upcoming Market Events</span>
                  <strong className={styles.kpiValue}>{events.length}</strong>
                  <span className={styles.kpiMeta}>
                    {events.filter((e) => e.pickupAvailable).length} with Free Pickup On
                  </span>
                </div>
                <div className={styles.kpiCard}>
                  <span className={styles.kpiLabel}>Active Popcorn Flavors</span>
                  <strong className={styles.kpiValue}>{products.length}</strong>
                  <span className={styles.kpiMeta}>Small $6 • Med $10 • Large $15</span>
                </div>
              </div>

              <div className={styles.panelGrid}>
                <div className={styles.card}>
                  <div className={styles.cardHeaderRow}>
                    <h2 className={styles.cardTitle}>Recent Orders &amp; Pickups</h2>
                    <button
                      type="button"
                      onClick={() => setActiveSection('orders')}
                      className={styles.previewLinkBtn}
                    >
                      Manage All Orders &rarr;
                    </button>
                  </div>
                  <div className={styles.itemList}>
                    {orders.slice(0, 3).map((ord) => (
                      <div key={ord.id} className={styles.listItem}>
                        <div className={styles.listItemMain}>
                          <span className={styles.badgeDate}>
                            {ord.id} • {ord.date}
                          </span>
                          <h4>
                            {ord.customer} — ${ord.total.toFixed(2)}
                          </h4>
                          <p className={styles.metaText}>
                            {ord.items} • {ord.method}
                          </p>
                        </div>
                        <span
                          className={
                            ord.status === 'Unfulfilled'
                              ? styles.badgeWarning
                              : styles.badgeSuccess
                          }
                        >
                          {ord.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Quick Owner Shortcuts</h2>
                  <p className={styles.cardSubtitle}>
                    Jump directly to common daily tasks:
                  </p>
                  <div className={styles.shortcutGrid}>
                    <button
                      type="button"
                      onClick={() => setActiveSection('events')}
                      className={styles.shortcutCard}
                    >
                      <strong>📅 + Add Market Event</strong>
                      <span>Post a new weekend market or festival date</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection('fundraisers')}
                      className={styles.shortcutCard}
                    >
                      <strong>🎗️ + Launch Fundraiser</strong>
                      <span>Create a 50% school or youth sports campaign</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection('orders')}
                      className={styles.shortcutCard}
                    >
                      <strong>🚚 Print AZ USPS Labels</strong>
                      <span>Process 1–2 day Arizona shipping boxes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection('products')}
                      className={styles.shortcutCard}
                    >
                      <strong>🍿 Update Flavor Prices</strong>
                      <span>Edit catalog pricing for The Queen&apos;s Corn</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: ORDERS & ARIZONA SHIPPING */}
          {activeSection === 'orders' && (
            <div className={styles.card}>
              <div className={styles.cardHeaderRow}>
                <div>
                  <h2 className={styles.cardTitle}>
                    Arizona Shipping &amp; Market Pickup Queue
                  </h2>
                  <p className={styles.cardSubtitle}>
                    Print discounted USPS Ground Advantage labels (1–2 day Arizona delivery) or prepare bags for weekend Farmers&apos; Market pickup.
                  </p>
                </div>
                <div className={styles.listItemActions}>
                  <a
                    href="https://ship.pirateship.com"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.smallBtnActive}
                  >
                    Open Pirate Ship &nearr;
                  </a>
                  <a
                    href="https://admin.shopify.com"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.smallBtn}
                  >
                    Shopify Orders &nearr;
                  </a>
                </div>
              </div>

              <div className={styles.itemList}>
                {orders.map((ord) => (
                  <div key={ord.id} className={styles.listItem}>
                    <div className={styles.listItemMain}>
                      <span className={styles.badgeDate}>
                        {ord.id} • {ord.date} • {ord.method}
                      </span>
                      <h4>
                        {ord.customer} ({ord.city}) —{' '}
                        <span style={{ color: 'var(--accent)' }}>
                          ${ord.total.toFixed(2)}
                        </span>
                      </h4>
                      <p className={styles.metaText}>{ord.items}</p>
                      {ord.pickupEvent && (
                        <p className={styles.payoutHighlight}>
                          🎪 Pickup Event: {ord.pickupEvent}
                        </p>
                      )}
                      {ord.fundraiserCode && (
                        <p className={styles.payoutHighlight}>
                          🎗️ Fundraiser Code: {ord.fundraiserCode} (50% Credit: $
                          {(ord.total * 0.5).toFixed(2)})
                        </p>
                      )}
                    </div>

                    <div className={styles.listItemActions}>
                      <span
                        className={
                          ord.status === 'Unfulfilled'
                            ? styles.badgeWarning
                            : styles.badgeSuccess
                        }
                      >
                        {ord.status}
                      </span>
                      {ord.status === 'Unfulfilled' && (
                        <button
                          type="button"
                          onClick={() => handlePrintLabel(ord.id)}
                          className={styles.smallBtnActive}
                        >
                          Print USPS Label ($5.25)
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: EVENTS PLACEMENT */}
          {activeSection === 'events' && (
            <div className={styles.panelGrid}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Add Upcoming Market / Event</h2>
                <p className={styles.cardSubtitle}>
                  Publishes immediately to <Link href="/events">/events</Link> and the Cart Pickup selector.
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

              <div className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <h2 className={styles.cardTitle}>
                    Published Events ({events.length})
                  </h2>
                  <Link href="/events" className={styles.previewLink}>
                    Preview /events &nearr;
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

          {/* SECTION 4: FUNDRAISING CAMPAIGNS */}
          {activeSection === 'fundraisers' && (
            <div className={styles.panelGrid}>
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

              <div className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <h2 className={styles.cardTitle}>
                    Active Campaigns ({fundraisers.length})
                  </h2>
                  <Link href="/fundraising" className={styles.previewLink}>
                    Preview /fundraising &nearr;
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

          {/* SECTION 5: FLAVORS & PRICING */}
          {activeSection === 'products' && (
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
                  Preview /shop &nearr;
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
                      <p className={styles.metaText}>
                        Current Base Price: {product.price}
                      </p>
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
                            setPriceEdits((prev) => ({
                              ...prev,
                              [product.id]: '',
                            }));
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

          {/* SECTION 6: SHOPIFY & CARRIER SETUP */}
          {activeSection === 'settings' && (
            <div className={styles.panelGrid}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Connect Live Shopify Storefront</h2>
                <p className={styles.cardSubtitle}>
                  Add these 2 keys to your <code>.env.local</code> file (or Vercel Environment Variables) to enable Shopify Hosted Checkout:
                </p>

                <pre className={styles.codeBlock}>
{`NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=the-queens-corn.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_token`}
                </pre>

                <div className={styles.guideSteps}>
                  <p>
                    <strong>1. Products:</strong> Add your 8 Queen&apos;s Corn flavors under{' '}
                    <em>Shopify Admin &rarr; Products</em>.
                  </p>
                  <p>
                    <strong>2. Events &amp; Fundraisers:</strong> Manage directly here in{' '}
                    <code>/admin</code> or via{' '}
                    <em>Shopify Admin &rarr; Content &rarr; Metaobjects</em>.
                  </p>
                  <p>
                    <strong>3. Arizona Shipping:</strong> Set Free AZ Shipping at{' '}
                    <strong>$35+</strong> and connect Pirate Ship for USPS Ground Advantage Cubic rates.
                  </p>
                </div>
              </div>

              <div className={styles.card}>
                <h2 className={styles.cardTitle}>External Carrier &amp; Admin Portals</h2>
                <p className={styles.cardSubtitle}>
                  Direct links to your shipping label and payment dashboards:
                </p>

                <div className={styles.itemList}>
                  <div className={styles.listItem}>
                    <div className={styles.listItemMain}>
                      <span className={styles.badgeDate}>USPS Ground Advantage AZ</span>
                      <h4>Pirate Ship Label Portal</h4>
                      <p className={styles.metaText}>
                        Lowest commercial USPS Cubic &amp; UPS rates ($0 monthly fee).
                      </p>
                    </div>
                    <a
                      href="https://ship.pirateship.com"
                      target="_blank"
                      rel="noreferrer"
                      className={styles.smallBtnActive}
                    >
                      Launch &nearr;
                    </a>
                  </div>

                  <div className={styles.listItem}>
                    <div className={styles.listItemMain}>
                      <span className={styles.badgeDate}>Payments &amp; POS</span>
                      <h4>Shopify Admin Dashboard</h4>
                      <p className={styles.metaText}>
                        Manage payouts, Arizona sales tax, and in-person market POS.
                      </p>
                    </div>
                    <a
                      href="https://admin.shopify.com"
                      target="_blank"
                      rel="noreferrer"
                      className={styles.smallBtnActive}
                    >
                      Launch &nearr;
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
