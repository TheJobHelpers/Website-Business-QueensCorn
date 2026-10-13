import 'server-only';
import { adminQuery, isShopifyAdminConnected } from './shopify-admin';
import { shopifyDomain } from './shopify';
import { ValidationError } from './validation';

// Orders, read live from Shopify for the dashboard's Sales and Orders screens. Nothing is stored
// on the website, and no customer details are asked for: only totals, items and the notes the
// website attached at checkout (pickup market, fundraiser).

/** The owners' clock: Arizona does not change its clocks, so this is the same all year. */
export const SHOP_TIME_ZONE = 'America/Phoenix';
const DAYS_BACK = 60;
const MAX_PAGES = 5;

export interface OrderLine {
  flavor: string;
  size: string;
  quantity: number;
  total: number;
}

export interface ShopOrder {
  id: string;
  /** "#1001" */
  name: string;
  createdAt: string;
  /** address of the order in the Shopify admin */
  adminUrl: string;
  total: number;
  /** placed with the test payment gateway */
  test: boolean;
  cancelled: boolean;
  paid: boolean;
  /** handed over (fulfilled in Shopify) */
  done: boolean;
  pickupMarket: string;
  fundraiserCode: string;
  fundraiserGroup: string;
  lines: OrderLine[];
}

export type OrdersResult =
  | { ok: true; orders: ShopOrder[]; truncated: boolean }
  | { ok: false; reason: 'not-connected' | 'no-permission' | 'error'; message: string };

interface OrderNode {
  id: string;
  legacyResourceId: string;
  name: string;
  createdAt: string;
  cancelledAt: string | null;
  test: boolean;
  displayFinancialStatus: string | null;
  displayFulfillmentStatus: string | null;
  currentTotalPriceSet: { shopMoney: { amount: string } };
  customAttributes: { key: string; value: string | null }[];
  lineItems: {
    nodes: { title: string; variantTitle: string | null; currentQuantity: number; originalUnitPriceSet: { shopMoney: { amount: string } } }[];
  };
}

const ORDERS = `
  query Orders($query: String!, $after: String) {
    orders(first: 100, after: $after, sortKey: CREATED_AT, reverse: true, query: $query) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id legacyResourceId name createdAt cancelledAt test
        displayFinancialStatus displayFulfillmentStatus
        currentTotalPriceSet { shopMoney { amount } }
        customAttributes { key value }
        lineItems(first: 50) { nodes { title variantTitle currentQuantity originalUnitPriceSet { shopMoney { amount } } } }
      }
    }
  }`;

const PAID = new Set(['PAID', 'PARTIALLY_REFUNDED', 'PARTIALLY_PAID']);

function toOrder(node: OrderNode, store: string): ShopOrder {
  const note = (key: string) => node.customAttributes.find((a) => a.key === key)?.value?.trim() ?? '';
  return {
    id: node.id,
    name: node.name,
    createdAt: node.createdAt,
    adminUrl: `https://admin.shopify.com/store/${store}/orders/${node.legacyResourceId}`,
    total: Number(node.currentTotalPriceSet.shopMoney.amount) || 0,
    test: node.test,
    cancelled: node.cancelledAt !== null,
    paid: PAID.has(node.displayFinancialStatus ?? ''),
    done: node.displayFulfillmentStatus === 'FULFILLED',
    pickupMarket: note('Pickup_Market_Event'),
    fundraiserCode: note('Fundraiser_Code'),
    fundraiserGroup: note('Fundraiser_50_Percent_Giveback'),
    lines: node.lineItems.nodes
      .filter((line) => line.currentQuantity > 0)
      .map((line) => ({
        flavor: line.title,
        size: line.variantTitle ?? '',
        quantity: line.currentQuantity,
        total: (Number(line.originalUnitPriceSet.shopMoney.amount) || 0) * line.currentQuantity,
      })),
  };
}

/** The last 60 days of orders, newest first. Never throws: the screens show the reason instead. */
export async function fetchRecentOrders(now: number): Promise<OrdersResult> {
  if (!isShopifyAdminConnected()) {
    return { ok: false, reason: 'not-connected', message: 'The dashboard has no Shopify key yet, so it cannot read orders.' };
  }
  try {
    const store = shopifyDomain().replace(/\.myshopify\.com$/i, '');
    const since = new Date(now - DAYS_BACK * 86400000).toISOString().slice(0, 10);
    const orders: ShopOrder[] = [];
    let after: string | null = null;
    let truncated = false;

    for (let page = 0; page < MAX_PAGES; page += 1) {
      const data: { orders: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: OrderNode[] } } = await adminQuery(
        ORDERS,
        { query: `created_at:>=${since}`, after }
      );
      orders.push(...data.orders.nodes.map((node) => toOrder(node, store)));
      if (!data.orders.pageInfo.hasNextPage) break;
      after = data.orders.pageInfo.endCursor;
      truncated = page === MAX_PAGES - 1;
    }
    return { ok: true, orders, truncated };
  } catch (err) {
    const reason = err instanceof ValidationError ? (err.fieldErrors.form ?? '') : '';
    if (/protected customer data/i.test(reason)) {
      return {
        ok: false,
        reason: 'no-permission',
        message: 'Shopify has not approved the dashboard app to read orders yet. In the Shopify developer dashboard, open the app, go to API access and request "Protected customer data" access.',
      };
    }
    if (/permission/i.test(reason)) {
      return {
        ok: false,
        reason: 'no-permission',
        message: 'The dashboard key may not read orders yet. In Shopify, add the "read_orders" permission to the dashboard app and release the new version.',
      };
    }
    console.error('Could not read orders from Shopify:', err);
    return { ok: false, reason: 'error', message: 'Shopify could not be reached just now. Reload the page in a moment.' };
  }
}

// ---------------- Working things out from the orders (pure functions) ----------------

/** "2026-10-13" on the owners' clock */
export function shopDay(date: Date | number | string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: SHOP_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(date));
}

/**
 * The orders that count as sales: not cancelled, and not test orders once the store has real ones
 * (a store that has only ever taken test orders shows those, so the screens can be tried out).
 */
export function countedOrders(orders: ShopOrder[]): { orders: ShopOrder[]; testOnly: boolean } {
  const kept = orders.filter((o) => !o.cancelled);
  const real = kept.filter((o) => !o.test);
  return real.length > 0 ? { orders: real, testOnly: false } : { orders: kept, testOnly: kept.length > 0 };
}

export interface Tally {
  label: string;
  quantity: number;
  total: number;
}

/** Bags per flavor and size, most first. */
export function tallyBags(orders: ShopOrder[]): Tally[] {
  const tally = new Map<string, Tally>();
  for (const order of orders) {
    for (const line of order.lines) {
      const label = line.size ? `${line.flavor} · ${line.size}` : line.flavor;
      const entry = tally.get(label) ?? { label, quantity: 0, total: 0 };
      entry.quantity += line.quantity;
      entry.total += line.total;
      tally.set(label, entry);
    }
  }
  return [...tally.values()].sort((a, b) => b.quantity - a.quantity || a.label.localeCompare(b.label));
}

export const sumTotals = (orders: ShopOrder[]) => orders.reduce((sum, order) => sum + order.total, 0);
export const countBags = (orders: ShopOrder[]) => orders.reduce((sum, order) => sum + order.lines.reduce((n, line) => n + line.quantity, 0), 0);
