import 'server-only';
import type { Product } from '@/data/products';
import { BAG_SIZES, sizePrice } from '@/lib/shop';
import { ValidationError } from './validation';

// Talking to the Shopify store (Storefront API). Only the server calls Shopify: the browser
// never does, so the shopper cannot choose which variants or prices are sent.

// Shopify supports each version for about a year: keep this in step with shopify-admin.ts.
const API_VERSION = '2026-07';

const setting = (name: string) => (process.env[name] ?? '').trim();

export function isShopifyConnected(): boolean {
  return Boolean(setting('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN') && setting('NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN'));
}

/**
 * The shop address comes from the server's own settings only, and must be a *.myshopify.com
 * host: nothing typed into a page can make this server call another address.
 */
export function shopifyDomain(): string {
  const domain = setting('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN').replace(/^https?:\/\//, '').replace(/\/+$/, '');
  if (!domain) {
    throw new ValidationError({ form: 'Shopify is not connected yet. Add the store address to the server settings.' });
  }
  if (!/^[a-z0-9][a-z0-9-]{0,60}\.myshopify\.com$/i.test(domain)) {
    throw new ValidationError({ form: 'The Shopify store address must look like your-store.myshopify.com.' });
  }
  return domain;
}

function shopifyEndpoint(): { url: string; token: string } {
  const token = setting('NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN');
  if (!token) {
    throw new ValidationError({ form: 'Shopify is not connected yet. Add the store address and Storefront token to the server settings.' });
  }
  return { url: `https://${shopifyDomain()}/api/${API_VERSION}/graphql.json`, token };
}

export async function shopifyQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const { url, token } = shopifyEndpoint();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new ValidationError({ form: `Shopify answered with an error (HTTP ${res.status}). Check the store address and token.` });
  const json = (await res.json()) as { data?: T; errors?: { message?: string }[] };
  if (json.errors?.length || !json.data) {
    throw new ValidationError({ form: 'Shopify rejected the request. Check the Storefront token and its permissions.' });
  }
  return json.data;
}

export interface ShopifyVariant {
  /** e.g. "gid://shopify/ProductVariant/123" */
  id: string;
  /** value of the product's "Size" option: "Small", "Family" or "Party" */
  size: string;
  price: number;
  available: boolean;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  productType: string;
  image: string;
  variants: ShopifyVariant[];
}

interface ProductNode {
  id: string;
  title: string;
  description: string;
  productType: string;
  featuredImage?: { url?: string } | null;
  variants: {
    edges: {
      node: {
        id: string;
        availableForSale: boolean;
        price: { amount: string };
        selectedOptions: { name: string; value: string }[];
      };
    }[];
  };
}

/** Every product published to the website's sales channel, with its bag sizes. */
export async function fetchShopifyCatalog(): Promise<ShopifyProduct[]> {
  const data = await shopifyQuery<{ products: { edges: { node: ProductNode }[] } }>(
    `{ products(first: 100) { edges { node {
        id title description productType featuredImage { url }
        variants(first: 20) { edges { node { id availableForSale price { amount } selectedOptions { name value } } } }
    } } } }`
  );
  return data.products.edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    description: node.description,
    productType: node.productType,
    image: node.featuredImage?.url ?? '',
    variants: node.variants.edges.map(({ node: variant }) => ({
      id: variant.id,
      size: variant.selectedOptions.find((o) => same(o.name, 'Size'))?.value ?? '',
      price: Number(variant.price.amount),
      available: variant.availableForSale,
    })),
  }));
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** The Shopify variant for a flavor (matched by name) in one bag size (matched by the "Size" option). */
export function findVariant(catalog: ShopifyProduct[], flavorName: string, sizeLabel: string): ShopifyVariant | undefined {
  return catalog.find((p) => same(p.title, flavorName))?.variants.find((v) => same(v.size, sizeLabel));
}

export const samePrice = (a: number, b: number) => Math.abs(a - b) < 0.005;

/** What would stop a shopper from checking out: flavors or sizes missing in Shopify, sold out, or priced differently. */
export function catalogIssues(flavors: Product[], catalog: ShopifyProduct[]): string[] {
  const issues: string[] = [];
  for (const flavor of flavors) {
    if (flavor.hidden) continue;
    if (!catalog.some((p) => same(p.title, flavor.name))) {
      issues.push(`${flavor.name}: not in Shopify (or not published to the Headless channel).`);
      continue;
    }
    for (const size of BAG_SIZES) {
      const variant = findVariant(catalog, flavor.name, size.label);
      const sitePrice = sizePrice(flavor, size);
      if (!variant) {
        issues.push(`${flavor.name}: no "${size.label}" size in Shopify.`);
      } else if (!samePrice(variant.price, sitePrice)) {
        issues.push(`${flavor.name} (${size.label}): $${sitePrice.toFixed(2)} on the website, $${variant.price.toFixed(2)} in Shopify.`);
      } else if (!variant.available) {
        issues.push(`${flavor.name} (${size.label}): sold out in Shopify (check the stock count, or switch off "Track quantity").`);
      }
    }
  }
  return issues;
}
