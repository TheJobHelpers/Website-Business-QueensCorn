// Shop constants shared by server and client components.
export const FREE_AZ_SHIPPING_THRESHOLD = 35;

// Bag sizes. `key` is the size name stored in the cart. A Small costs the flavor's base price.
// Family and Party have their own prices when the owners set them (dashboard > Flavors);
// otherwise they scale from the Small price ($6 / $10 / $15).
export const BAG_SIZES = [
  { key: 'Small (Individual)', label: 'Small', multiplier: 1 },
  { key: 'Medium (Family)', label: 'Family', multiplier: 10 / 6 },
  { key: 'Large (Party)', label: 'Party', multiplier: 15 / 6 },
] as const;

/** Price of one bag of a flavor in a given size, from the flavor's "$6.00"-style base price. */
export function bagPrice(basePrice: string, multiplier: number): number {
  const base = parseFloat(basePrice.replace(/[^0-9.]/g, '')) || 6;
  return Math.round(base * multiplier * 100) / 100;
}

type Priced = { price: string; familyPrice?: string; partyPrice?: string };
const amount = (text: string | undefined) => {
  const value = parseFloat((text ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(value) && value > 0 ? value : null;
};

/** What one bag of this flavor costs in this size. The one place every page and the checkout ask. */
export function sizePrice(flavor: Priced, size: { label: string; multiplier: number }): number {
  const own = size.label === 'Family' ? amount(flavor.familyPrice) : size.label === 'Party' ? amount(flavor.partyPrice) : null;
  return own ?? bagPrice(flavor.price, size.multiplier);
}

/** The bag size for a cart line's size name (Small if the name is unknown). */
export function bagSize(key: string) {
  return BAG_SIZES.find((size) => size.key === key) ?? BAG_SIZES[0];
}

/** "$6" or "$7.50" */
export function formatPrice(amount: number): string {
  return `$${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}`;
}

// Shipping is not open yet: the site shows it as "coming soon" and orders are market pickup only.
// Set to true to bring back the shipping option, the free-shipping bar and the shipping copy.
export const SHIPPING_AVAILABLE = false;
