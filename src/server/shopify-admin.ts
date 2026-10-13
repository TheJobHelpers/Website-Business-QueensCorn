import 'server-only';
import type { Product } from '@/data/products';
import { BAG_SIZES, sizePrice } from '@/lib/shop';
import { shopifyDomain } from './shopify';
import { ValidationError } from './validation';

// Writing flavors into the Shopify store (Admin API). The dashboard stays where the owners edit;
// every save is sent on to Shopify first, so the product that shoppers pay for always matches
// what the website shows. The key used here can change the store: it is read from the server
// settings only and never reaches the browser.

const API_VERSION = '2026-07';
/** The sales channel the website's Storefront token belongs to. */
const WEBSITE_CHANNEL = /headless/i;

const setting = (name: string) => (process.env[name] ?? '').trim();

/** true when the server has a key that may change products in Shopify */
export function isShopifyAdminConnected(): boolean {
  const hasKey = Boolean(setting('SHOPIFY_ADMIN_ACCESS_TOKEN')) || Boolean(setting('SHOPIFY_ADMIN_CLIENT_ID') && setting('SHOPIFY_ADMIN_CLIENT_SECRET'));
  return hasKey && Boolean(setting('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN'));
}

// A Dev Dashboard app has no fixed token: it trades its id and secret for one that lasts a day.
let granted: { token: string; expiresAt: number } | null = null;

async function adminToken(): Promise<string> {
  const fixed = setting('SHOPIFY_ADMIN_ACCESS_TOKEN');
  if (fixed) return fixed;
  if (granted && granted.expiresAt > Date.now()) return granted.token;

  const res = await fetch(`https://${shopifyDomain()}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: setting('SHOPIFY_ADMIN_CLIENT_ID'),
      client_secret: setting('SHOPIFY_ADMIN_CLIENT_SECRET'),
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  const json = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number };
  if (!res.ok || !json.access_token) {
    throw new ValidationError({ form: `Shopify did not accept the app's id and secret (HTTP ${res.status}). Check the server settings and that the app is installed on the store.` });
  }
  // renew a little early
  granted = { token: json.access_token, expiresAt: Date.now() + ((json.expires_in ?? 3600) - 300) * 1000 };
  return granted.token;
}

interface UserError {
  field?: string[] | null;
  message: string;
}

async function adminQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(`https://${shopifyDomain()}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': await adminToken() },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  if (res.status === 401 || res.status === 403) {
    granted = null;
    throw new ValidationError({ form: 'Shopify refused the dashboard key. Check it in the server settings.' });
  }
  if (!res.ok) throw new ValidationError({ form: `Shopify answered with an error (HTTP ${res.status}). Nothing was changed.` });
  const json = (await res.json()) as { data?: T; errors?: { message?: string }[] };
  if (json.errors?.length || !json.data) {
    console.error('Shopify Admin API error:', json.errors);
    const denied = json.errors?.some((e) => /access denied|scope/i.test(e.message ?? ''));
    throw new ValidationError({
      form: denied
        ? 'The dashboard key is missing a permission in Shopify (it needs products, publications and inventory).'
        : 'Shopify rejected the change. Nothing was saved.',
    });
  }
  return json.data;
}

function failOn(errors: UserError[] | undefined, what: string): void {
  if (!errors?.length) return;
  console.error(`Shopify refused to ${what}:`, errors);
  throw new ValidationError({ form: `Shopify could not ${what}: ${errors[0].message}` });
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The Shopify product with exactly this title, if there is one (so a flavor is never created twice). */
async function findProductByTitle(title: string): Promise<string | undefined> {
  const data = await adminQuery<{ products: { nodes: { id: string; title: string; status: string }[] } }>(
    `query FindProduct($query: String!) { products(first: 25, query: $query) { nodes { id title status } } }`,
    { query: `title:"${title.replace(/["\\]/g, ' ')}"` }
  );
  const matches = data.products.nodes.filter((p) => same(p.title, title));
  return (matches.find((p) => p.status === 'ACTIVE') ?? matches[0])?.id;
}

let websiteChannelId: string | null = null;

async function websiteChannel(): Promise<string> {
  if (websiteChannelId) return websiteChannelId;
  const data = await adminQuery<{ publications: { nodes: { id: string; name: string }[] } }>(
    `{ publications(first: 50) { nodes { id name } } }`
  );
  const channel = data.publications.nodes.find((p) => WEBSITE_CHANNEL.test(p.name));
  if (!channel) {
    throw new ValidationError({ form: 'The Headless sales channel is not installed in Shopify, so the website cannot sell this flavor yet.' });
  }
  websiteChannelId = channel.id;
  return channel.id;
}

const PRODUCT_SET = `
  mutation SetProduct($input: ProductSetInput!, $identifier: ProductSetIdentifiers) {
    productSet(synchronous: true, input: $input, identifier: $identifier) {
      product { id }
      userErrors { field message }
    }
  }`;

/**
 * Creates or updates the Shopify product for a flavor: title, description, type, and one variant
 * per bag size at that size's price on the website, always available (the popcorn is made to order).
 * Hidden flavors are taken off the website's sales channel. Returns the Shopify product id.
 */
export async function pushFlavorToShopify(flavor: Omit<Product, 'id'>): Promise<string> {
  const input = {
    title: flavor.name,
    descriptionHtml: `<p>${escapeHtml(flavor.description)}</p>`,
    productType: flavor.category,
    status: 'ACTIVE',
    productOptions: [{ name: 'Size', position: 1, values: BAG_SIZES.map((size) => ({ name: size.label })) }],
    variants: BAG_SIZES.map((size) => ({
      optionValues: [{ optionName: 'Size', name: size.label }],
      price: sizePrice(flavor, size).toFixed(2),
      inventoryPolicy: 'CONTINUE',
      inventoryItem: { tracked: false },
    })),
  };

  type SetResult = { productSet: { product: { id: string } | null; userErrors: UserError[] } };
  const set = (id?: string) => adminQuery<SetResult>(PRODUCT_SET, { input, identifier: id ? { id } : null });

  let result = await set(flavor.shopifyId ?? (await findProductByTitle(flavor.name)));
  if (flavor.shopifyId && !result.productSet.product) {
    // the linked product was deleted in Shopify: make it again rather than fail the save
    console.warn(`Shopify product for "${flavor.name}" is gone; creating it again.`, result.productSet.userErrors);
    result = await set(await findProductByTitle(flavor.name));
  }
  failOn(result.productSet.userErrors, `save "${flavor.name}"`);
  const productId = result.productSet.product?.id;
  if (!productId) throw new ValidationError({ form: `Shopify did not save "${flavor.name}". Nothing was changed on the website.` });

  const channel = await websiteChannel();
  const action = flavor.hidden ? 'publishableUnpublish' : 'publishablePublish';
  const published = await adminQuery<Record<string, { userErrors: UserError[] }>>(
    `mutation Channel($id: ID!, $input: [PublicationInput!]!) { ${action}(id: $id, input: $input) { userErrors { field message } } }`,
    { id: productId, input: [{ publicationId: channel }] }
  );
  failOn(published[action]?.userErrors, flavor.hidden ? `hide "${flavor.name}"` : `publish "${flavor.name}"`);

  return productId;
}

/** A deleted flavor is archived in Shopify, not erased: past orders keep their product. */
export async function archiveFlavorInShopify(flavor: Pick<Product, 'name' | 'shopifyId'>): Promise<void> {
  const id = flavor.shopifyId ?? (await findProductByTitle(flavor.name));
  if (!id) return;
  const data = await adminQuery<{ productUpdate: { userErrors: UserError[] } }>(
    `mutation Archive($product: ProductUpdateInput!) { productUpdate(product: $product) { userErrors { field message } } }`,
    { product: { id, status: 'ARCHIVED' } }
  );
  const errors = data.productUpdate.userErrors;
  // already gone in Shopify is fine: there is nothing left to archive
  if (errors.some((e) => /not exist|not found/i.test(e.message))) return;
  failOn(errors, `archive "${flavor.name}"`);
}
