'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { isShopifyConfigured } from '@/lib/shopify';
import { logoutAction } from '@/app/actions/auth';
import {
  testShopifyConnectionAction,
  syncShopifyCatalogAction,
  testShopifyCheckoutAction,
  ShopifyConnectionResult,
  ShopifyCheckoutTestResult,
} from '@/app/actions/shopify';
import {
  LayoutDashboard,
  Package,
  Calendar,
  BadgePercent,
  Popcorn,
  Settings,
  Store,
  LogOut,
  ExternalLink,
  MapPin,
  Clock,
  CheckCircle2,
  Trash2,
  Search,
  Truck,
  FileText,
  Heart,
  Check,
  DollarSign,
  RefreshCw,
  Printer,
  AlertTriangle,
  Flame,
  Radio,
} from 'lucide-react';
import styles from './Admin.module.css';

type AdminSection =
  | 'overview'
  | 'orders'
  | 'events'
  | 'fundraisers'
  | 'products'
  | 'settings';

type OrderFilter = 'all' | 'unfulfilled' | 'shipping' | 'pickup' | 'ready';
type FlavorCategoryFilter = 'all' | 'Sweet' | 'Savory' | 'Spicy' | 'Seasonal';

interface SampleOrder {
  id: string;
  customer: string;
  city: string;
  address?: string;
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
    address: '7420 E Camelback Rd, Scottsdale, AZ 85251',
    items: '2× Caramel (Med), 2× Jalapeño Cheddar (Med)',
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
    address: '1023 N Dysart Rd, Avondale, AZ 85392',
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
    address: '4300 E Sunrise Dr, Tucson, AZ 85718',
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
    address: '1450 S Val Vista Dr, Gilbert, AZ 85234',
    items: '4× Caramel Apple (Small)',
    total: 24.0,
    method: 'USPS Ground Advantage (AZ)',
    status: 'Label Printed',
    date: 'Yesterday',
  },
];

const AZ_MARKET_PRESETS = [
  {
    title: "Marana Farmers Market",
    location: 'Marana, AZ',
    time: '9:00 am - 1:00 pm',
    desc: 'Handcrafted kettle corn popped fresh on-site. Pre-order for free booth pickup.',
  },
  {
    title: "Rillito Park Farmers Market",
    location: 'Tucson, AZ',
    time: '8:30 am - 12:30 pm',
    desc: 'Sunday heirloom farmers market in Tucson. Pick up freshly popped batches.',
  },
  {
    title: "St. Philip's Plaza Classic",
    location: 'Tucson, AZ',
    time: '9:00 am - 1:00 pm',
    desc: 'Artisan pop-up under the sycamores. Full signature flavor lineup available.',
  },
  {
    title: 'Oro Valley Farmers Market',
    location: 'Oro Valley, AZ',
    time: '9:00 am - 1:00 pm',
    desc: 'Saturday morning community pop-up at historic Steam Pump Ranch.',
  },
  {
    title: 'Downtown Phoenix Open Air',
    location: 'Phoenix, AZ',
    time: '8:00 am - 1:00 pm',
    desc: 'Central Phoenix market stand with freshly popped Arizona kettle corn.',
  },
  {
    title: 'Old Town Scottsdale Market',
    location: 'Scottsdale, AZ',
    time: '8:00 am - 12:30 pm',
    desc: 'Fresh batches popped on-site at the Old Town Scottsdale community market.',
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
    syncProducts,
    resetStoreData,
  } = useCart();

  // Navigation & Core State
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [orders, setOrders] = useState<SampleOrder[]>(INITIAL_ORDERS);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');
  const [flavorCategoryFilter, setFlavorCategoryFilter] = useState<FlavorCategoryFilter>('all');
  const [globalSearch, setGlobalSearch] = useState('');
  const [activeOrderModal, setActiveOrderModal] = useState<SampleOrder | null>(null);
  const [priceEdits, setPriceEdits] = useState<Record<string, string>>({});
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Transitions
  const [isLoggingOut, startLogoutTransition] = useTransition();
  const [isTestingShopify, startShopifyTest] = useTransition();
  const [isSyncingCatalog, startCatalogSync] = useTransition();
  const [isTestingCheckout, startCheckoutTest] = useTransition();

  // Shopify Tools State
  const [shopifyDomainInput, setShopifyDomainInput] = useState(
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'the-queens-corn.myshopify.com'
  );
  const [shopifyTokenInput, setShopifyTokenInput] = useState(
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || ''
  );
  const [shopifyDiagResult, setShopifyDiagResult] = useState<ShopifyConnectionResult | null>(null);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [checkoutResult, setCheckoutResult] = useState<ShopifyCheckoutTestResult | null>(null);

  // New Event Form State
  const [evtDateInput, setEvtDateInput] = useState('2026-11-21');
  const [evtMonth, setEvtMonth] = useState('Nov');
  const [evtDay, setEvtDay] = useState('21');
  const [evtYear, setEvtYear] = useState('2026');
  const [evtTitle, setEvtTitle] = useState('');
  const [evtTime, setEvtTime] = useState('9:00 am - 1:00 pm');
  const [evtLocation, setEvtLocation] = useState('Marana, AZ');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtPickup, setEvtPickup] = useState(true);
  const [eventTabFilter, setEventTabFilter] = useState<'all' | 'pickup' | 'walkup'>('all');

  // New Fundraiser Form State
  const [fundOrg, setFundOrg] = useState('');
  const [fundCategory, setFundCategory] = useState('Youth Athletics');
  const [fundCode, setFundCode] = useState('');
  const [fundLocation, setFundLocation] = useState('Marana, AZ');
  const [fundEndDate, setFundEndDate] = useState('Dec 15, 2026');
  const [fundGoal, setFundGoal] = useState(2000);
  const [fundDesc, setFundDesc] = useState('');

  // Toast Helper
  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Handlers
  const handleSignOut = () => {
    startLogoutTransition(async () => {
      await logoutAction();
    });
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
    showToast(`Order ${orderId} marked as Label Printed!`);
  };

  const handleTestShopifyConnection = () => {
    setShopifyDiagResult(null);
    startShopifyTest(async () => {
      const res = await testShopifyConnectionAction(shopifyDomainInput, shopifyTokenInput);
      setShopifyDiagResult(res);
      if (res.ok) {
        showToast(`Connected to Shopify! Found ${res.productCount} products.`);
      }
    });
  };

  const handleSyncCatalog = () => {
    setSyncStatusMsg('');
    startCatalogSync(async () => {
      const res = await syncShopifyCatalogAction(shopifyDomainInput, shopifyTokenInput);
      if (res.success && res.products && res.products.length > 0) {
        syncProducts(res.products);
        const msg = `Successfully synced ${res.products.length} flavors directly from Shopify!`;
        setSyncStatusMsg(msg);
        showToast(msg);
      } else {
        const msg = `Sync note: ${res.error || 'No remote products returned. Retaining current catalog.'}`;
        setSyncStatusMsg(msg);
      }
    });
  };

  const handleTestCheckout = (method: 'shipping' | 'pickup') => {
    setCheckoutResult(null);
    startCheckoutTest(async () => {
      const res = await testShopifyCheckoutAction(
        method,
        events[0]?.title || 'Marana Farmers Market',
        fundraisers[0]?.code || 'TIGERS50'
      );
      setCheckoutResult(res);
      showToast('Checkout test link created!');
    });
  };

  const handleDateChange = (val: string) => {
    setEvtDateInput(val);
    if (!val) return;
    try {
      const d = new Date(val + 'T00:00:00');
      const m = d.toLocaleString('en-US', { month: 'short' });
      const day = String(d.getDate());
      const yr = String(d.getFullYear());
      setEvtMonth(m);
      setEvtDay(day);
      setEvtYear(yr);
    } catch {}
  };

  const applyMarketPreset = (preset: (typeof AZ_MARKET_PRESETS)[0]) => {
    setEvtTitle(preset.title);
    setEvtLocation(preset.location);
    setEvtTime(preset.time);
    if (preset.desc) setEvtDesc(preset.desc);
    showToast(`Loaded preset for ${preset.title}!`);
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
    showToast(`Published "${evtTitle.trim()}" to the events calendar!`);
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
    showToast(`Launched 50% Campaign for "${fundOrg.trim()}" (Code: ${fundCode.trim().toUpperCase()})!`);
    setFundOrg('');
    setFundCode('');
    setFundDesc('');
  };

  const handleCopyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      showToast(`Copied code "${code}" to clipboard!`);
    }
  };

  const shopifyConnected = isShopifyConfigured();
  const totalFundraiserSales = fundraisers.reduce((s, f) => s + f.raisedAmount, 0);
  const totalGivebackPaid = Math.round(totalFundraiserSales * 0.5);
  const unfulfilledCount = orders.filter((o) => o.status === 'Unfulfilled').length;

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    // Search query check
    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase();
      const match =
        o.customer.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.items.toLowerCase().includes(q);
      if (!match) return false;
    }
    // Filter pill check
    if (orderFilter === 'unfulfilled') return o.status === 'Unfulfilled';
    if (orderFilter === 'ready') return o.status === 'Ready for Pickup';
    if (orderFilter === 'shipping') return o.method === 'USPS Ground Advantage (AZ)';
    if (orderFilter === 'pickup') return o.method === 'Free Market Pickup';
    return true;
  });

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    if (flavorCategoryFilter !== 'all' && p.category !== flavorCategoryFilter) {
      return false;
    }
    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className={styles.dashboardShell}>
      {/* 1. LEFT SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.sidebarLogo}>
            <Image
              src="/logo.webp"
              alt="The Queen's Corn"
              width={42}
              height={42}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <div>
            <h2 className={styles.sidebarTitle}>The Queen&apos;s Corn</h2>
            <span className={styles.sidebarSub}>Owner Operations</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <button
            type="button"
            onClick={() => setActiveSection('overview')}
            className={`${styles.navItem} ${
              activeSection === 'overview' ? styles.navItemActive : ''
            }`}
          >
            <div className={styles.navItemLeft}>
              <LayoutDashboard className={styles.navIcon} size={18} strokeWidth={2} />
              <span>Overview</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('orders')}
            className={`${styles.navItem} ${
              activeSection === 'orders' ? styles.navItemActive : ''
            }`}
          >
            <div className={styles.navItemLeft}>
              <Package className={styles.navIcon} size={18} strokeWidth={2} />
              <span>Orders &amp; Shipping</span>
            </div>
            {unfulfilledCount > 0 && (
              <span className={styles.navBadge}>{unfulfilledCount}</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('events')}
            className={`${styles.navItem} ${
              activeSection === 'events' ? styles.navItemActive : ''
            }`}
          >
            <div className={styles.navItemLeft}>
              <Calendar className={styles.navIcon} size={18} strokeWidth={2} />
              <span>Events &amp; Markets</span>
            </div>
            <span className={styles.navCount}>{events.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('products')}
            className={`${styles.navItem} ${
              activeSection === 'products' ? styles.navItemActive : ''
            }`}
          >
            <div className={styles.navItemLeft}>
              <Popcorn className={styles.navIcon} size={18} strokeWidth={2} />
              <span>Flavor Catalog</span>
            </div>
            <span className={styles.navCount}>{products.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('fundraisers')}
            className={`${styles.navItem} ${
              activeSection === 'fundraisers' ? styles.navItemActive : ''
            }`}
          >
            <div className={styles.navItemLeft}>
              <BadgePercent className={styles.navIcon} size={18} strokeWidth={2} />
              <span>50% Fundraisers</span>
            </div>
            <span className={styles.navCount}>{fundraisers.length}</span>
          </button>

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.07)', margin: '0.4rem 0' }} />

          <button
            type="button"
            onClick={() => setActiveSection('settings')}
            className={`${styles.navItem} ${
              activeSection === 'settings' ? styles.navItemActive : ''
            }`}
          >
            <div className={styles.navItemLeft}>
              <Settings className={styles.navIcon} size={18} strokeWidth={2} />
              <span>Shopify &amp; Settings</span>
            </div>
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
            <Link href="/" className={styles.storefrontBtn} title="View public customer storefront">
              <Store size={13} strokeWidth={2} />
              <span>Storefront</span>
              <ExternalLink size={11} strokeWidth={2} style={{ opacity: 0.6 }} />
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className={styles.logoutBtn}
              title="Sign out of owner portal"
            >
              <LogOut size={13} strokeWidth={2} />
              <span>{isLoggingOut ? 'Exiting...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <div className={styles.mainArea}>
        {/* Top Header */}
        <header className={styles.topbar}>
          <div>
            <div className={styles.topbarGreeting}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={14} style={{ color: '#F5BA31' }} /> Welcome back, Bob &amp; Reina
              </span>
            </div>
            <h1 className={styles.topbarTitle}>
              {activeSection === 'overview' && 'Operations Dashboard'}
              {activeSection === 'orders' && 'Arizona Orders & Shipping Queue'}
              {activeSection === 'events' && 'Farmers’ Market Calendar Manager'}
              {activeSection === 'fundraisers' && '50% Community Fundraising Hub'}
              {activeSection === 'products' && 'Kettle Corn Flavor Catalog'}
              {activeSection === 'settings' && 'Shopify & Shipping Carriers'}
            </h1>
            <p className={styles.topbarSub}>
              {activeSection === 'overview' && 'Real-time overview of Arizona orders, weekend booth dates, and community fundraisers.'}
              {activeSection === 'orders' && 'Print discounted USPS Ground Advantage labels or prepare pre-orders for Farmers’ Market pickup.'}
              {activeSection === 'events' && 'Schedule upcoming pop-ups and enable free website pre-order pickup at your booth.'}
              {activeSection === 'fundraisers' && 'Track 50% giveback campaign sales and manage organization referral discount codes.'}
              {activeSection === 'products' && 'Manage base bag prices across the store or sync directly with Shopify products.'}
              {activeSection === 'settings' && 'Test live Shopify Storefront API connectivity, review carrier rates, and test Arizona checkout.'}
            </p>
          </div>

          <div className={styles.topbarRight}>
            {/* Quick Search Bar */}
            <div className={styles.searchBarBox}>
              <span className={styles.searchIcon}>
                <Search size={15} style={{ color: '#a8a29e' }} />
              </span>
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search orders, flavors..."
                className={styles.searchBarInput}
              />
            </div>

            {/* Sync Status Badge */}
            <span
              className={`${styles.statusPill} ${
                shopifyConnected ? styles.statusConnected : styles.statusLocal
              }`}
            >
              {shopifyConnected ? '● Shopify Connected' : '● Live Store Sync Active'}
            </span>

            <button
              type="button"
              onClick={() => {
                resetStoreData();
                showToast('Reset store data to default sample values.');
              }}
              className={styles.resetBtn}
              title="Reset sample orders, events, and catalog"
            >
              Reset Data
            </button>
          </div>
        </header>

        {/* Global Feedback Banner */}
        {feedbackToast && (
          <div style={{ padding: '0 2.25rem', marginTop: '1.25rem' }}>
            <div className={styles.syncSuccessNotice}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
                <strong>Notification:</strong>
              </span>{' '}
              {feedbackToast}
            </div>
          </div>
        )}

        <div className={styles.workspace}>
          {/* =================================================================
              SECTION 1: OVERVIEW
              ================================================================= */}
          {activeSection === 'overview' && (
            <div className={styles.sectionStack}>
              {/* Attention Checklist Banner */}
              {unfulfilledCount > 0 && (
                <div className={styles.attentionBanner}>
                  <div className={styles.attentionMain}>
                    <Package size={22} style={{ color: '#f87171', flexShrink: 0 }} />
                    <div>
                      <div className={styles.attentionTitle}>
                        {unfulfilledCount} Arizona Orders Require Shipping Labels
                      </div>
                      <div className={styles.attentionDesc}>
                        Customer orders waiting for 1–2 day USPS Ground Advantage labels or weekend market preparation.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection('orders')}
                    className={styles.attentionActionBtn}
                  >
                    Fulfill Orders Now &rarr;
                  </button>
                </div>
              )}

              {/* 4 Clean Metric Cards */}
              <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                  <div className={styles.kpiHeaderRow}>
                    <span className={styles.kpiLabel}>Unfulfilled AZ Orders</span>
                    <div className={styles.kpiIconBadge} style={{ background: 'rgba(220, 38, 38, 0.15)', color: '#f87171' }}>
                      <Package size={17} strokeWidth={2} />
                    </div>
                  </div>
                  <strong className={styles.kpiValue}>{unfulfilledCount}</strong>
                  <span className={styles.kpiMeta}>
                    USPS Ground Advantage (1–2 Day AZ)
                  </span>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiHeaderRow}>
                    <span className={styles.kpiLabel}>Farmers&apos; Markets</span>
                    <div className={styles.kpiIconBadge} style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
                      <Calendar size={17} strokeWidth={2} />
                    </div>
                  </div>
                  <strong className={styles.kpiValue}>{events.length}</strong>
                  <span className={styles.kpiMeta}>
                    {events.filter((e) => e.pickupAvailable).length} with Free Pre-Order Pickup
                  </span>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiHeaderRow}>
                    <span className={styles.kpiLabel}>50% School Giveback</span>
                    <div className={styles.kpiIconBadge} style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#86efac' }}>
                      <BadgePercent size={17} strokeWidth={2} />
                    </div>
                  </div>
                  <strong className={styles.kpiValue}>
                    ${totalGivebackPaid.toLocaleString()}
                  </strong>
                  <span className={styles.kpiMeta}>
                    From ${totalFundraiserSales.toLocaleString()} in gross fundraiser sales
                  </span>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiHeaderRow}>
                    <span className={styles.kpiLabel}>Flavor Catalog</span>
                    <div className={styles.kpiIconBadge} style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#7dd3fc' }}>
                      <Popcorn size={17} strokeWidth={2} />
                    </div>
                  </div>
                  <strong className={styles.kpiValue}>{products.length}</strong>
                  <span className={styles.kpiMeta}>
                    Handcrafted in Marana, Arizona
                  </span>
                </div>
              </div>

              {/* Priority Shipping Queue Preview */}
              <div className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div>
                    <h2 className={styles.cardTitle}>Immediate Fulfillment Queue</h2>
                    <p className={styles.cardSubtitle}>
                      Orders needing Arizona USPS shipping labels or weekend Farmers’ Market preparation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection('orders')}
                    className={styles.previewLinkBtn}
                  >
                    View All Orders ({orders.length}) &rarr;
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
                          {ord.customer} ({ord.city}) —{' '}
                          <span style={{ color: '#fbbf24' }}>
                            ${ord.total.toFixed(2)}
                          </span>
                        </h4>
                        <p className={styles.metaText}>{ord.items}</p>
                        <div>
                          {ord.method === 'USPS Ground Advantage (AZ)' ? (
                            <span className={styles.deliveryBadgeShipping}>
                              <Truck size={13} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '5px' }} />
                              USPS Ground Advantage (AZ 1-2 Day)
                            </span>
                          ) : (
                            <span className={styles.deliveryBadgePickup}>
                              <Calendar size={13} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '5px' }} />
                              Free Farmers&apos; Market Pickup: {ord.pickupEvent}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={styles.listItemActions}>
                        <button
                          type="button"
                          onClick={() => setActiveOrderModal(ord)}
                          className={styles.smallBtn}
                        >
                          <FileText size={13} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '5px' }} />
                          Packing Slip
                        </button>
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
                            onClick={() => {
                              handlePrintLabel(ord.id);
                              setActiveOrderModal(ord);
                            }}
                            className={styles.smallBtnActive}
                          >
                            Print Label ($5.25)
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className={styles.shortcutGrid}>
                <div
                  onClick={() => setActiveSection('events')}
                  className={styles.shortcutCard}
                >
                  <Calendar size={22} style={{ color: '#fbbf24', marginBottom: '0.25rem' }} strokeWidth={2} />
                  <h4>Add Farmers&apos; Market</h4>
                  <p>Schedule your booth date and enable pre-order bag pickup.</p>
                </div>

                <div
                  onClick={() => setActiveSection('fundraisers')}
                  className={styles.shortcutCard}
                >
                  <BadgePercent size={22} style={{ color: '#fbbf24', marginBottom: '0.25rem' }} strokeWidth={2} />
                  <h4>Create School Fundraiser</h4>
                  <p>Launch a 50% community campaign with custom referral code.</p>
                </div>

                <div
                  onClick={() => setActiveSection('settings')}
                  className={styles.shortcutCard}
                >
                  <Settings size={22} style={{ color: '#fbbf24', marginBottom: '0.25rem' }} strokeWidth={2} />
                  <h4>Shopify Diagnostics</h4>
                  <p>Test GraphQL connection, sync flavors, and inspect API latency.</p>
                </div>

                <div
                  onClick={() => setActiveSection('products')}
                  className={styles.shortcutCard}
                >
                  <Popcorn size={22} style={{ color: '#fbbf24', marginBottom: '0.25rem' }} strokeWidth={2} />
                  <h4>Adjust Flavor Prices</h4>
                  <p>Update base bag prices across the storefront catalog.</p>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 2: ORDERS & ARIZONA SHIPPING
              ================================================================= */}
          {activeSection === 'orders' && (
            <div className={styles.card}>
              <div className={styles.cardHeaderRow}>
                <div>
                  <h2 className={styles.cardTitle}>
                    Arizona Shipping &amp; Market Pickup Queue
                  </h2>
                  <p className={styles.cardSubtitle}>
                    Fulfill orders via USPS Ground Advantage (1–2 day Arizona delivery) or prepare bags for weekend Farmers&apos; Market pickup.
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

              {/* Filter Pills */}
              <div className={styles.filterBar}>
                <button
                  type="button"
                  onClick={() => setOrderFilter('all')}
                  className={`${styles.filterBtn} ${orderFilter === 'all' ? styles.filterBtnActive : ''}`}
                >
                  All Orders ({orders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderFilter('unfulfilled')}
                  className={`${styles.filterBtn} ${orderFilter === 'unfulfilled' ? styles.filterBtnActive : ''}`}
                >
                  Unfulfilled ({unfulfilledCount})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderFilter('shipping')}
                  className={`${styles.filterBtn} ${orderFilter === 'shipping' ? styles.filterBtnActive : ''}`}
                >
                  USPS Ground AZ ({orders.filter((o) => o.method === 'USPS Ground Advantage (AZ)').length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderFilter('pickup')}
                  className={`${styles.filterBtn} ${orderFilter === 'pickup' ? styles.filterBtnActive : ''}`}
                >
                  Market Pickup ({orders.filter((o) => o.method === 'Free Market Pickup').length})
                </button>
              </div>

              <div className={styles.itemList}>
                {filteredOrders.length === 0 ? (
                  <p style={{ color: '#a8a29e', padding: '1.5rem', textAlign: 'center' }}>
                    No orders matching this filter or search query.
                  </p>
                ) : (
                  filteredOrders.map((ord) => (
                    <div key={ord.id} className={styles.listItem}>
                      <div className={styles.listItemMain}>
                        <span className={styles.badgeDate}>
                          {ord.id} • {ord.date}
                        </span>
                        <h4>
                          {ord.customer} ({ord.city}) —{' '}
                          <span style={{ color: '#fbbf24' }}>
                            ${ord.total.toFixed(2)}
                          </span>
                        </h4>
                        <p className={styles.metaText}>{ord.items}</p>
                        <div>
                          {ord.method === 'USPS Ground Advantage (AZ)' ? (
                            <span className={styles.deliveryBadgeShipping}>
                              <Truck size={13} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '5px' }} />
                              USPS Ground Advantage (AZ 1-2 Day)
                            </span>
                          ) : (
                            <span className={styles.deliveryBadgePickup}>
                              <Calendar size={13} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '5px' }} />
                              Free Farmers&apos; Market Pickup: {ord.pickupEvent}
                            </span>
                          )}
                        </div>
                        {ord.fundraiserCode && (
                          <p className={styles.payoutHighlight}>
                            <Heart size={13} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '5px', color: '#D9232A' }} />
                            Fundraiser Code: <strong>{ord.fundraiserCode}</strong> (50% Giveback: ${(ord.total * 0.5).toFixed(2)})
                          </p>
                        )}
                      </div>

                      <div className={styles.listItemActions}>
                        <button
                          type="button"
                          onClick={() => setActiveOrderModal(ord)}
                          className={styles.smallBtn}
                        >
                          <FileText size={13} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '5px' }} />
                          Packing Slip
                        </button>
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
                            onClick={() => {
                              handlePrintLabel(ord.id);
                              setActiveOrderModal(ord);
                            }}
                            className={styles.smallBtnActive}
                          >
                            Print USPS Label ($5.25)
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 3: EVENTS & POP-UP SCHEDULE (SYNCED LIVE)
              ================================================================= */}
          {activeSection === 'events' && (
            <div>
              {/* Live Sync Banner */}
              <div className={styles.syncNoticeBanner}>
                <div className={styles.syncNoticeLeft}>
                  <span className={styles.syncNoticeDot} />
                  <span>
                    <strong>Live Storefront Sync:</strong> Events scheduled here are automatically published to both the <strong>Homepage Schedule</strong> and <strong>/events calendar</strong>, and immediately become selectable for free pre-order pickup.
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Link href="/" target="_blank" className={styles.syncNoticeLink}>
                    <ExternalLink size={12} />
                    <span>Homepage</span>
                  </Link>
                  <Link href="/events" target="_blank" className={styles.syncNoticeLink}>
                    <ExternalLink size={12} />
                    <span>/events</span>
                  </Link>
                </div>
              </div>

              <div className={styles.panelGrid}>
                {/* 1. Schedule New Event */}
                <div className={styles.card}>
                  <div className={styles.cardHeaderRow}>
                    <div>
                      <h2 className={styles.cardTitle}>Schedule Pop-Up Market</h2>
                      <p className={styles.cardSubtitle}>
                        Add a farmers&apos; market or community festival in Arizona.
                      </p>
                    </div>
                  </div>

                  {/* 1-Click Arizona Presets */}
                  <div className={styles.presetChipsGroup}>
                    <span className={styles.presetChipsLabel}>Quick Arizona Presets (1-Click Fill)</span>
                    <div className={styles.presetChipsRow}>
                      {AZ_MARKET_PRESETS.map((preset) => (
                        <button
                          key={preset.title}
                          type="button"
                          onClick={() => applyMarketPreset(preset)}
                          className={styles.presetChip}
                          title={`Click to fill ${preset.title}`}
                        >
                          <MapPin size={11} style={{ color: '#fbbf24' }} />
                          <span>{preset.title.replace(' Farmers Market', '')}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleAddEvent} className={styles.form} style={{ marginTop: '0.75rem' }}>
                    <div className={styles.row2}>
                      <div className={styles.field}>
                        <label>Calendar Date</label>
                        <input
                          type="date"
                          value={evtDateInput}
                          onChange={(e) => handleDateChange(e.target.value)}
                          required
                        />
                      </div>
                      <div className={styles.field}>
                        <label>Display Badge (Month / Day)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                          <input
                            type="text"
                            value={evtMonth}
                            onChange={(e) => setEvtMonth(e.target.value)}
                            placeholder="Month"
                            required
                          />
                          <input
                            type="text"
                            value={evtDay}
                            onChange={(e) => setEvtDay(e.target.value)}
                            placeholder="Day e.g. 21"
                            required
                          />
                        </div>
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
                        <label>Booth Hours</label>
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
                      <label>Booth Notes / Flavors (Optional)</label>
                      <textarea
                        rows={2}
                        value={evtDesc}
                        onChange={(e) => setEvtDesc(e.target.value)}
                        placeholder="Handcrafted kettle corn popped fresh on-site. Pre-order for free booth pickup."
                      />
                    </div>

                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={evtPickup}
                        onChange={(e) => setEvtPickup(e.target.checked)}
                      />
                      <span>Allow customers to pre-order online &amp; pick up free at this event</span>
                    </label>

                    {/* Real-Time Customer Preview Box */}
                    <div className={styles.livePreviewBox}>
                      <div className={styles.livePreviewTitle}>
                        <Store size={13} />
                        <span>Live Preview (How Customers See This)</span>
                      </div>
                      <div className={styles.previewEventCard}>
                        <div className={styles.previewDateBadge}>
                          <span className={styles.previewDateMonth}>{evtMonth || 'MONTH'}</span>
                          <span className={styles.previewDateDay}>{evtDay || '00'}</span>
                        </div>
                        <div className={styles.previewInfo}>
                          <h4>{evtTitle || 'Your Event Title Will Appear Here'}</h4>
                          <p>
                            {evtTime} • {evtLocation} {evtPickup ? '• Free Pickup' : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button type="submit" className={styles.primaryBtn} style={{ marginTop: '0.25rem' }}>
                      <Calendar size={15} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: '-2px' }} />
                      Publish Event to Website
                    </button>
                  </form>
                </div>

                {/* 2. Scheduled Markets List */}
                <div className={styles.card}>
                  <div className={styles.cardHeaderRow}>
                    <div>
                      <h2 className={styles.cardTitle}>Scheduled Pop-Ups ({events.length})</h2>
                      <p className={styles.cardSubtitle}>
                        Active dates published across the storefront.
                      </p>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className={styles.filterBar} style={{ marginBottom: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => setEventTabFilter('all')}
                      className={`${styles.filterBtn} ${eventTabFilter === 'all' ? styles.filterBtnActive : ''}`}
                    >
                      All Events ({events.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventTabFilter('pickup')}
                      className={`${styles.filterBtn} ${eventTabFilter === 'pickup' ? styles.filterBtnActive : ''}`}
                    >
                      Pickup Enabled ({events.filter((e) => e.pickupAvailable).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventTabFilter('walkup')}
                      className={`${styles.filterBtn} ${eventTabFilter === 'walkup' ? styles.filterBtnActive : ''}`}
                    >
                      Walk-Up Only ({events.filter((e) => !e.pickupAvailable).length})
                    </button>
                  </div>

                  <div className={styles.eventCardList}>
                    {events
                      .filter((evt) => {
                        if (eventTabFilter === 'pickup') return evt.pickupAvailable;
                        if (eventTabFilter === 'walkup') return !evt.pickupAvailable;
                        return true;
                      })
                      .map((evt) => (
                        <div key={evt.id} className={styles.eventCardItem}>
                          <div className={styles.eventCardMain}>
                            <div className={styles.eventDateBox}>
                              <span className={styles.eventDateMonth}>{evt.month}</span>
                              <span className={styles.eventDateDay}>{evt.day}</span>
                              <span className={styles.eventDateYear}>{evt.year}</span>
                            </div>
                            <div className={styles.eventDetails}>
                              <div className={styles.eventTitleRow}>
                                <h4>{evt.title}</h4>
                                <span className={styles.eventLiveTag}>
                                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e' }} />
                                  Live on Website
                                </span>
                              </div>
                              <div className={styles.eventMetaRow}>
                                <span className={styles.eventMetaItem}>
                                  <Clock size={12} style={{ color: '#fbbf24' }} /> {evt.time}
                                </span>
                                <span className={styles.eventMetaItem}>
                                  <MapPin size={12} style={{ color: '#fbbf24' }} /> {evt.location}
                                </span>
                              </div>
                              <div>
                                {evt.pickupAvailable ? (
                                  <span className={styles.deliveryBadgePickup}>
                                    <Check size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '4px' }} />
                                    Free Pre-Order Pickup Enabled
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '0.72rem', color: '#78716c' }}>
                                    Walk-Up Sales Only
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className={styles.eventActions}>
                            <button
                              type="button"
                              onClick={() => {
                                toggleEventPickup(evt.id);
                                showToast(`Toggled pickup for "${evt.title}"`);
                              }}
                              className={`${styles.smallBtn} ${evt.pickupAvailable ? styles.smallBtnActive : ''}`}
                              title={evt.pickupAvailable ? 'Disable pickup' : 'Enable pickup'}
                            >
                              {evt.pickupAvailable ? 'Pickup On' : 'Pickup Off'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                deleteEvent(evt.id);
                                showToast(`Removed event: ${evt.title}`);
                              }}
                              className={styles.deleteBtn}
                              title="Delete event from website"
                            >
                              <Trash2 size={13} style={{ display: 'inline', marginRight: '3px' }} />
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 4: FUNDRAISING CAMPAIGNS
              ================================================================= */}
          {activeSection === 'fundraisers' && (
            <div className={styles.panelGrid}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Launch 50% Fundraiser</h2>
                <p className={styles.cardSubtitle}>
                  Set up a school, youth league, or non-profit campaign on{' '}
                  <Link href="/fundraising">/fundraising</Link>.
                </p>

                <form onSubmit={handleAddFundraiser} className={styles.form}>
                  <div className={styles.field}>
                    <label>School or Organization Name</label>
                    <input
                      type="text"
                      value={fundOrg}
                      onChange={(e) => setFundOrg(e.target.value)}
                      placeholder="e.g. Marana High School Band"
                      required
                    />
                  </div>

                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label>Supporter Referral Code</label>
                      <input
                        type="text"
                        value={fundCode}
                        onChange={(e) => setFundCode(e.target.value.toUpperCase())}
                        placeholder="e.g. BAND50"
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Fundraising Goal ($)</label>
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
                        placeholder="High School Athletics"
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Campaign End Date</label>
                      <input
                        type="text"
                        value={fundEndDate}
                        onChange={(e) => setFundEndDate(e.target.value)}
                        placeholder="Dec 15, 2026"
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label>City &amp; Community</label>
                    <input
                      type="text"
                      value={fundLocation}
                      onChange={(e) => setFundLocation(e.target.value)}
                      placeholder="Marana / Tucson, AZ"
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Campaign Story &amp; Purpose</label>
                    <textarea
                      rows={2}
                      value={fundDesc}
                      onChange={(e) => setFundDesc(e.target.value)}
                      placeholder="What is the group raising funds for?"
                    />
                  </div>

                  <button type="submit" className={styles.primaryBtn}>
                    + Launch 50% Fundraiser
                  </button>
                </form>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div>
                    <h2 className={styles.cardTitle}>
                      Active Campaigns ({fundraisers.length})
                    </h2>
                    <p className={styles.cardSubtitle}>
                      Every order using these codes credits 50% directly to the organization.
                    </p>
                  </div>
                  <Link href="/fundraising" className={styles.previewLink}>
                    Preview /fundraising &nearr;
                  </Link>
                </div>

                <div className={styles.itemList}>
                  {fundraisers.map((fund) => {
                    const payoutOwed = Math.round(fund.raisedAmount * 0.5);
                    const pct = Math.min(100, Math.round((fund.raisedAmount / fund.goalAmount) * 100));

                    return (
                      <div key={fund.id} className={styles.listItem}>
                        <div className={styles.listItemMain}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span className={styles.badgeDate}>
                              Code: <strong>{fund.code}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(fund.code)}
                              style={{ background: 'none', border: 'none', color: '#fbbf24', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                              Copy Code
                            </button>
                          </div>

                          <h4>{fund.organization}</h4>
                          <p className={styles.metaText}>
                            Ends {fund.endDate} • {fund.location}
                          </p>

                          {/* Progress bar */}
                          <div style={{ margin: '0.5rem 0 0.35rem', background: '#292524', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, background: '#22c55e', height: '100%' }} />
                          </div>

                          <p className={styles.metaText}>
                            Sales: <strong>${fund.raisedAmount.toLocaleString()}</strong> of ${fund.goalAmount.toLocaleString()} ({pct}%)
                          </p>
                          <p className={styles.payoutHighlight}>
                            <DollarSign size={14} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '4px', color: '#22c55e' }} />
                            50% Community Giveback: <strong>${payoutOwed.toLocaleString()}</strong>
                          </p>
                        </div>

                        <div className={styles.listItemActions}>
                          <button
                            type="button"
                            onClick={() => {
                              updateFundraiserRaised(fund.id, fund.raisedAmount + 50);
                              showToast(`Added $50 sales credit to ${fund.organization}!`);
                            }}
                            className={styles.smallBtn}
                          >
                            +$50 Order Test
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteFundraiser(fund.id);
                              showToast(`Removed campaign: ${fund.organization}`);
                            }}
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

          {/* =================================================================
              SECTION 5: FLAVORS & PRICING
              ================================================================= */}
          {activeSection === 'products' && (
            <div className={styles.card}>
              <div className={styles.cardHeaderRow}>
                <div>
                  <h2 className={styles.cardTitle}>
                    Kettle Corn Flavor Catalog ({products.length})
                  </h2>
                  <p className={styles.cardSubtitle}>
                    Update base bag prices below or pull fresh products directly from Shopify.
                  </p>
                </div>
                <div className={styles.listItemActions}>
                  <button
                    type="button"
                    onClick={handleSyncCatalog}
                    disabled={isSyncingCatalog}
                    className={styles.smallBtnActive}
                  >
                    {isSyncingCatalog ? (
                      'Syncing...'
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <RefreshCw size={13} /> Sync from Shopify
                      </span>
                    )}
                  </button>
                  <Link href="/shop" className={styles.previewLink}>
                    Preview /shop &nearr;
                  </Link>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className={styles.filterBar}>
                {(['all', 'Sweet', 'Savory', 'Spicy', 'Seasonal'] as FlavorCategoryFilter[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFlavorCategoryFilter(cat)}
                    className={`${styles.filterBtn} ${flavorCategoryFilter === cat ? styles.filterBtnActive : ''}`}
                  >
                    {cat === 'all' ? 'All Flavors' : cat}
                  </button>
                ))}
              </div>

              {syncStatusMsg && (
                <div className={styles.syncSuccessNotice}>
                  <span>ℹ️ {syncStatusMsg}</span>
                </div>
              )}

              <div className={styles.productGrid}>
                {filteredProducts.map((product) => (
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
                        Base Bag Price: <strong style={{ color: '#fbbf24' }}>{product.price}</strong>
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
                            showToast(`Updated ${product.name} price to ${priceEdits[product.id]}`);
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

          {/* =================================================================
              SECTION 6: SHOPIFY & CARRIER SETUP
              ================================================================= */}
          {activeSection === 'settings' && (
            <div className={styles.panelGrid}>
              {/* Interactive Shopify Operations Card */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Shopify Operations &amp; Diagnostics</h2>
                <p className={styles.cardSubtitle}>
                  Test GraphQL connectivity, verify Storefront API credentials, and simulate Arizona checkout metadata.
                </p>

                <div className={styles.shopifyStatusBox}>
                  <div className={styles.field} style={{ marginBottom: '1rem' }}>
                    <label>Shopify Store Domain</label>
                    <input
                      type="text"
                      value={shopifyDomainInput}
                      onChange={(e) => setShopifyDomainInput(e.target.value)}
                      placeholder="the-queens-corn.myshopify.com"
                    />
                  </div>

                  <div className={styles.field} style={{ marginBottom: '1rem' }}>
                    <label>Storefront Access Token</label>
                    <input
                      type="password"
                      value={shopifyTokenInput}
                      onChange={(e) => setShopifyTokenInput(e.target.value)}
                      placeholder="Enter token to test..."
                    />
                  </div>

                  <div className={styles.actionBtnGroup}>
                    <button
                      type="button"
                      onClick={handleTestShopifyConnection}
                      disabled={isTestingShopify}
                      className={styles.smallBtnActive}
                    >
                      {isTestingShopify ? (
                        'Testing Connection...'
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <Radio size={13} /> Test Live Connection
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleSyncCatalog}
                      disabled={isSyncingCatalog}
                      className={styles.smallBtn}
                    >
                      {isSyncingCatalog ? (
                        'Syncing...'
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <RefreshCw size={13} /> Sync Shopify Catalog
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Diagnostic Results */}
                  {shopifyDiagResult && (
                    <>
                      {shopifyDiagResult.ok ? (
                        <div className={styles.shopifyDiagSuccess}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <CheckCircle2 size={15} style={{ color: '#22c55e' }} />
                            <strong>Connected to {shopifyDiagResult.shopName}</strong>
                          </span>
                          <br />
                          <span>Host: {shopifyDiagResult.domain}</span> •{' '}
                          <span>Currency: {shopifyDiagResult.currency}</span> •{' '}
                          <span>Products found: {shopifyDiagResult.productCount}</span> •{' '}
                          <span>Latency: {shopifyDiagResult.latencyMs}ms</span>
                        </div>
                      ) : (
                        <div className={styles.shopifyDiagError}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <AlertTriangle size={15} style={{ color: '#fbbf24' }} />
                            <strong>Connection Result:</strong>
                          </span>
                          <br />
                          <span>{shopifyDiagResult.error}</span>
                          {shopifyDiagResult.latencyMs !== undefined && (
                            <span> (Response in {shopifyDiagResult.latencyMs}ms)</span>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {syncStatusMsg && (
                    <div className={styles.syncSuccessNotice}>
                      <span>{syncStatusMsg}</span>
                    </div>
                  )}
                </div>

                {/* Test Checkout Generator */}
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Test Arizona Checkout Flow
                </h3>
                <p className={styles.cardSubtitle}>
                  Verifies that order metadata tags (Market Pickup vs USPS Shipping and 50% Fundraiser giveback) attach properly to Shopify hosted cart sessions.
                </p>

                <div className={styles.actionBtnGroup}>
                  <button
                    type="button"
                    onClick={() => handleTestCheckout('pickup')}
                    disabled={isTestingCheckout}
                    className={styles.smallBtn}
                  >
                    Test Market Pickup Checkout
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTestCheckout('shipping')}
                    disabled={isTestingCheckout}
                    className={styles.smallBtn}
                  >
                    Test USPS Ground Checkout
                  </button>
                </div>

                {checkoutResult && (
                  <div style={{ marginTop: '1rem' }} className={styles.syncSuccessNotice}>
                    <strong>
                      {checkoutResult.simulated
                        ? 'Simulated Local Checkout URL:'
                        : 'Live Shopify Checkout URL Generated:'}
                    </strong>
                    <br />
                    <a
                      href={checkoutResult.checkoutUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#fbbf24', textDecoration: 'underline', wordBreak: 'break-all' }}
                    >
                      {checkoutResult.checkoutUrl} &nearr;
                    </a>
                  </div>
                )}
              </div>

              {/* Carrier & Dashboard Portals */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Carrier &amp; Operations Portals</h2>
                <p className={styles.cardSubtitle}>
                  Direct access to Arizona discounted shipping label software and Shopify backoffice.
                </p>

                <div className={styles.itemList}>
                  <div className={styles.listItem}>
                    <div className={styles.listItemMain}>
                      <span className={styles.badgeDate}>USPS Ground Advantage AZ</span>
                      <h4>Pirate Ship Label Portal</h4>
                      <p className={styles.metaText}>
                        Discounted commercial Cubic shipping rates for kettle corn boxes ($0 monthly fee).
                      </p>
                    </div>
                    <a
                      href="https://ship.pirateship.com"
                      target="_blank"
                      rel="noreferrer"
                      className={styles.smallBtnActive}
                    >
                      Launch Pirate Ship &nearr;
                    </a>
                  </div>

                  <div className={styles.listItem}>
                    <div className={styles.listItemMain}>
                      <span className={styles.badgeDate}>Payments &amp; POS</span>
                      <h4>Shopify Admin Dashboard</h4>
                      <p className={styles.metaText}>
                        Payouts, in-person Farmers&apos; Market POS card reader, and inventory management.
                      </p>
                    </div>
                    <a
                      href="https://admin.shopify.com"
                      target="_blank"
                      rel="noreferrer"
                      className={styles.smallBtnActive}
                    >
                      Launch Shopify Admin &nearr;
                    </a>
                  </div>

                  <div className={styles.listItem}>
                    <div className={styles.listItemMain}>
                      <span className={styles.badgeDate}>Live Storefront</span>
                      <h4>Customer Shop Page</h4>
                      <p className={styles.metaText}>
                        Browse customer catalog, cart drawer, and review AZ shipping threshold ($35+).
                      </p>
                    </div>
                    <Link href="/shop" className={styles.smallBtn}>
                      View Public Shop &nearr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. PACKING SLIP & USPS SHIPPING LABEL MODAL */}
      {activeOrderModal && (
        <div className={styles.modalOverlay} onClick={() => setActiveOrderModal(null)}>
          <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                  Order Packing Slip &amp; Shipping Label
                </h3>
                <span style={{ fontSize: '0.84rem', color: '#a8a29e' }}>
                  {activeOrderModal.id} • {activeOrderModal.method}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveOrderModal(null)}
                className={styles.modalCloseBtn}
              >
                &times;
              </button>
            </div>

            {/* Printable Document Paper */}
            <div className={styles.packingSlipPaper}>
              <div className={styles.slipHeader}>
                <div>
                  <h2 className={styles.slipBrandTitle}>THE QUEEN&apos;S CORN</h2>
                  <div className={styles.slipOriginAddress}>
                    Handcrafted Kettle Corn<br />
                    Marana, Arizona 85653<br />
                    thequeenscornaz@gmail.com • (623) 692-1811
                  </div>
                </div>
                <div className={styles.slipMeta}>
                  <h3>PACKING SLIP</h3>
                  <div><strong>Order:</strong> {activeOrderModal.id}</div>
                  <div><strong>Date:</strong> {activeOrderModal.date}</div>
                  <div><strong>Status:</strong> {activeOrderModal.status}</div>
                </div>
              </div>

              <div className={styles.slipAddresses}>
                <div className={styles.slipAddressBox}>
                  <h5>Ship / Pickup For:</h5>
                  <strong>{activeOrderModal.customer}</strong><br />
                  {activeOrderModal.address || activeOrderModal.city}<br />
                  Arizona, United States
                </div>
                <div className={styles.slipAddressBox}>
                  <h5>Fulfillment Details:</h5>
                  <strong>Method:</strong> {activeOrderModal.method}<br />
                  {activeOrderModal.pickupEvent && (
                    <span><strong>Market Event:</strong> {activeOrderModal.pickupEvent}<br /></span>
                  )}
                  {activeOrderModal.fundraiserCode && (
                    <span><strong>50% Fundraiser:</strong> {activeOrderModal.fundraiserCode} (Credited)<br /></span>
                  )}
                  <strong>Order Total:</strong> ${activeOrderModal.total.toFixed(2)}
                </div>
              </div>

              <table className={styles.slipItemsTable}>
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th style={{ textAlign: 'right' }}>Batch Checked</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{activeOrderModal.items}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Check size={13} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '4px' }} />
                      Checked
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className={styles.barcodeBox}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#78716c', textTransform: 'uppercase', fontWeight: 700 }}>
                    USPS Ground Advantage Tracking
                  </div>
                  <div className={styles.barcodeLines}>
                    ||||| ||| ||||||| |||| ||||| ||||||
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#57534e', marginTop: '0.2rem' }}>
                    9400 1118 9956 2026 8525 01
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className={styles.smallBtnActive}
                >
                  <Printer size={14} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '5px' }} />
                  Print Document
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setActiveOrderModal(null)}
                className={styles.smallBtn}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
