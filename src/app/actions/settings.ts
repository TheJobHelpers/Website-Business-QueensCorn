'use server';

import type { Product } from '@/data/products';
import type { ActionResult } from '@/lib/action-result';
import { adminAction, publishSiteData } from '@/server/admin-action';
import { events, fundraisers, products } from '@/server/repositories';
import { catalogIssues, fetchShopifyCatalog, shopifyQuery } from '@/server/shopify';
import { ValidationError, isAllowedProductImage } from '@/server/validation';

const CATEGORIES: Product['category'][] = ['Sweet', 'Savory', 'Spicy', 'Seasonal'];

export interface ShopifyStatus {
  shopName: string;
  domain: string;
  productCount: number;
  latencyMs: number;
  /** what would stop a shopper from checking out (empty when everything lines up) */
  issues: string[];
}

/** Reaches the store and compares its products with the website's flavors, sizes and prices. */
export async function testShopifyConnectionAction(): Promise<ActionResult<ShopifyStatus>> {
  return adminAction(async () => {
    const started = Date.now();
    const data = await shopifyQuery<{ shop: { name: string; primaryDomain?: { host?: string } } }>(
      `{ shop { name primaryDomain { host } } }`
    );
    const latencyMs = Date.now() - started;
    const catalog = await fetchShopifyCatalog();
    return {
      shopName: data.shop.name,
      domain: data.shop.primaryDomain?.host ?? '',
      productCount: catalog.length,
      latencyMs,
      issues: catalogIssues(await products.list(), catalog),
    };
  });
}

/** Replaces the flavor list with the products in Shopify. */
export async function importShopifyCatalogAction(): Promise<ActionResult<{ count: number }>> {
  return adminAction(async () => {
    const catalog = await fetchShopifyCatalog();

    const imported: Product[] = catalog.map((item, index) => {
      // a flavor's price is its Small bag; Family and Party scale from it
      const small = item.variants.find((v) => v.size.trim().toLowerCase() === 'small') ?? item.variants[0];
      const price = small?.price ?? 0;
      return {
        id: (item.id.split('/').pop() ?? '').replace(/[^a-zA-Z0-9_-]/g, '') || `shopify-${index + 1}`,
        name: item.title.trim().slice(0, 60),
        description: (item.description || "The Queen's Corn handcrafted kettle corn.").trim().slice(0, 300),
        category: CATEGORIES.find((c) => c === item.productType) ?? 'Sweet',
        price: `$${(Number.isFinite(price) && price > 0 ? price : 6).toFixed(2)}`,
        // only Shopify's own image host is accepted; anything else gets the stock photo
        image: isAllowedProductImage(item.image) ? item.image : '/popcorn-scoop-fresh.jpg',
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
