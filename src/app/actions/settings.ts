'use server';

import type { Product } from '@/data/products';
import type { ActionResult } from '@/lib/action-result';
import { adminAction, publishSiteData } from '@/server/admin-action';
import { events, fundraisers, products } from '@/server/repositories';
import { ValidationError, isAllowedProductImage } from '@/server/validation';

const API_VERSION = '2025-01';
const CATEGORIES: Product['category'][] = ['Sweet', 'Savory', 'Spicy', 'Seasonal'];

export interface ShopifyStatus {
  shopName: string;
  domain: string;
  productCount: number;
  latencyMs: number;
}

/**
 * The shop address comes from the server's own settings only, and must be a *.myshopify.com
 * host: the dashboard can never make this server call an address someone typed in.
 */
function shopifyEndpoint(): { url: string; token: string } {
  const domain = (process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? '').trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const token = (process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? '').trim();
  if (!domain || !token) {
    throw new ValidationError({ form: 'Shopify is not connected yet. Add the store address and Storefront token to the server settings.' });
  }
  if (!/^[a-z0-9][a-z0-9-]{0,60}\.myshopify\.com$/i.test(domain)) {
    throw new ValidationError({ form: 'The Shopify store address must look like your-store.myshopify.com.' });
  }
  return { url: `https://${domain}/api/${API_VERSION}/graphql.json`, token };
}

async function shopifyQuery<T>(query: string): Promise<T> {
  const { url, token } = shopifyEndpoint();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({ query }),
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

export async function testShopifyConnectionAction(): Promise<ActionResult<ShopifyStatus>> {
  return adminAction(async () => {
    const started = Date.now();
    const data = await shopifyQuery<{
      shop: { name: string; primaryDomain?: { host?: string } };
      products: { edges: unknown[] };
    }>(`{ shop { name primaryDomain { host } } products(first: 50) { edges { node { id } } } }`);
    return {
      shopName: data.shop.name,
      domain: data.shop.primaryDomain?.host ?? '',
      productCount: data.products.edges.length,
      latencyMs: Date.now() - started,
    };
  });
}

/** Replaces the flavor list with the products in Shopify. */
export async function importShopifyCatalogAction(): Promise<ActionResult<{ count: number }>> {
  return adminAction(async () => {
    interface Node {
      id: string;
      title: string;
      description: string;
      productType: string;
      featuredImage?: { url?: string } | null;
      priceRange: { minVariantPrice: { amount: string } };
    }
    const data = await shopifyQuery<{ products: { edges: { node: Node }[] } }>(
      `{ products(first: 50) { edges { node { id title description productType featuredImage { url } priceRange { minVariantPrice { amount } } } } } }`
    );

    const imported: Product[] = data.products.edges.map(({ node }, index) => {
      const image = node.featuredImage?.url ?? '';
      const price = Number(node.priceRange.minVariantPrice.amount);
      return {
        id: (node.id.split('/').pop() ?? '').replace(/[^a-zA-Z0-9_-]/g, '') || `shopify-${index + 1}`,
        name: node.title.trim().slice(0, 60),
        description: (node.description || "The Queen's Corn handcrafted kettle corn.").trim().slice(0, 300),
        category: CATEGORIES.find((c) => c === node.productType) ?? 'Sweet',
        price: `$${(Number.isFinite(price) && price > 0 ? price : 6).toFixed(2)}`,
        // only Shopify's own image host is accepted; anything else gets the stock photo
        image: isAllowedProductImage(image) ? image : '/popcorn-scoop-fresh.jpg',
      };
    });

    if (imported.length === 0) throw new ValidationError({ form: 'Shopify has no products to import yet.' });
    await products.replaceAll(imported);
    publishSiteData();
    return { count: imported.length };
  }, 'Flavors imported from Shopify.');
}

/** Puts one list back to the built-in version that ships with the website. */
export async function resetCollectionAction(which: 'events' | 'products' | 'fundraisers'): Promise<ActionResult> {
  return adminAction(async () => {
    const target = { events, products, fundraisers }[which];
    if (!target) throw new ValidationError({ form: 'Unknown list.' });
    await target.reset();
    publishSiteData();
  }, 'Restored to the built-in list.');
}
