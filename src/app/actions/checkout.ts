'use server';

import { getUpcomingEvents, pickupLabel } from '@/lib/events';
import { BAG_SIZES, SHIPPING_AVAILABLE, sizePrice } from '@/lib/shop';
import { getSiteData } from '@/server/repositories';
import { fetchShopifyCatalog, findVariant, isShopifyConnected, samePrice, shopifyQuery } from '@/server/shopify';

export type CheckoutResult =
  | { ok: true; url: string }
  /** no Shopify store yet: the cart falls back to the contact form */
  | { ok: false; reason: 'not-connected' }
  | { ok: false; reason: 'problem'; error: string };

const MAX_LINES = 40;
const MAX_QUANTITY = 99;
const UNAVAILABLE = 'Checkout is not available right now. Please try again in a moment, or message us to order.';

const problem = (error: string): CheckoutResult => ({ ok: false, reason: 'problem', error });
const text = (value: unknown, max: number) => (typeof value === 'string' ? value.slice(0, max) : '');

/**
 * Turns the shopper's bag into a Shopify checkout and returns its address.
 * This is a public endpoint, so nothing from the browser is trusted: flavors, sizes, the pickup
 * market and the fundraiser are all looked up again on the server, and the variants and prices
 * come from Shopify itself.
 */
export async function startCheckoutAction(input: unknown): Promise<CheckoutResult> {
  if (!isShopifyConnected()) return { ok: false, reason: 'not-connected' };

  const raw = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>;
  const rawLines = Array.isArray(raw.lines) ? raw.lines : [];
  if (rawLines.length === 0) return problem('Your bag is empty.');
  if (rawLines.length > MAX_LINES) return problem('That is a lot of popcorn. Please message us for an order this size.');

  try {
    const site = await getSiteData();
    const catalog = await fetchShopifyCatalog();

    const lines: { merchandiseId: string; quantity: number }[] = [];
    for (const rawLine of rawLines) {
      const line = (typeof rawLine === 'object' && rawLine !== null ? rawLine : {}) as Record<string, unknown>;
      const flavor = site.products.find((p) => p.id === text(line.productId, 80));
      const size = BAG_SIZES.find((s) => s.key === text(line.size, 40));
      const quantity = Number(line.quantity);
      if (!flavor || !size) return problem('Something in your bag is no longer available. Remove it and try again.');
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
        return problem(`Please choose between 1 and ${MAX_QUANTITY} of each bag.`);
      }

      const name = `${flavor.name} (${size.label})`;
      const variant = findVariant(catalog, flavor.name, size.label);
      if (!variant) return problem(`${name} cannot be ordered online yet. Remove it, or message us to order.`);
      if (!variant.available) return problem(`${name} is sold out right now. Remove it to continue.`);
      // never send a shopper to pay a different price from the one the website showed
      if (!samePrice(variant.price, sizePrice(flavor, size))) {
        console.error(`Checkout blocked: ${name} is priced differently on the website and in Shopify.`);
        return problem(`The price of ${name} is being updated. Please try again later, or message us to order.`);
      }
      lines.push({ merchandiseId: variant.id, quantity });
    }

    const wantsShipping = SHIPPING_AVAILABLE && raw.fulfillmentMethod === 'shipping';
    const attributes = [
      { key: 'Fulfillment_Method', value: wantsShipping ? 'Arizona / USPS Shipping' : 'Free Farmers Market Pickup' },
    ];

    if (!wantsShipping) {
      const chosen = text(raw.pickupEvent, 200);
      const markets = getUpcomingEvents(site.events).filter((e) => e.pickupAvailable !== false);
      if (chosen) {
        if (!markets.some((e) => pickupLabel(e) === chosen)) {
          return problem('That market is no longer open for pickup. Choose another one in your bag.');
        }
        attributes.push({ key: 'Pickup_Market_Event', value: chosen });
      } else if (markets.length > 0) {
        return problem('Choose the market where you will pick up your order.');
      }
    }

    const code = text(raw.fundraiserCode, 40);
    if (code) {
      const fundraiser = site.fundraisers.find((f) => f.code === code);
      if (!fundraiser) return problem('That fundraiser is no longer running. Choose another, or none.');
      attributes.push({ key: 'Fundraiser_Code', value: fundraiser.code });
      attributes.push({ key: 'Fundraiser_50_Percent_Giveback', value: fundraiser.organization });
    }

    const data = await shopifyQuery<{
      cartCreate?: { cart?: { checkoutUrl?: string } | null; userErrors?: { message: string }[] };
    }>(
      `mutation CartCreate($input: CartInput!) {
        cartCreate(input: $input) { cart { checkoutUrl } userErrors { message } }
      }`,
      { input: { lines, attributes } }
    );

    const url = data.cartCreate?.cart?.checkoutUrl;
    if (!url || !url.startsWith('https://')) {
      console.error('Shopify did not return a checkout:', data.cartCreate?.userErrors);
      return problem(UNAVAILABLE);
    }
    return { ok: true, url };
  } catch (err) {
    // details stay in the server log, not in the browser
    console.error('Checkout failed:', err);
    return problem(UNAVAILABLE);
  }
}
