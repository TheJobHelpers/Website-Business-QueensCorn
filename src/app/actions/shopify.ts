'use server';

import { Product } from '@/data/products';

const DEFAULT_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '';
const DEFAULT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
const API_VERSION = '2025-01';

export interface ShopifyConnectionResult {
  ok: boolean;
  shopName?: string;
  domain?: string;
  currency?: string;
  productCount?: number;
  latencyMs?: number;
  error?: string;
}

export interface ShopifySyncResult {
  success: boolean;
  products?: Product[];
  count?: number;
  error?: string;
}

export interface ShopifyCheckoutTestResult {
  success: boolean;
  checkoutUrl?: string;
  simulated?: boolean;
  error?: string;
}

/**
 * Diagnostic action to test live GraphQL connectivity to Shopify Storefront API.
 */
export async function testShopifyConnectionAction(
  customDomain?: string,
  customToken?: string
): Promise<ShopifyConnectionResult> {
  const domain = (customDomain || DEFAULT_DOMAIN).trim();
  const token = (customToken || DEFAULT_TOKEN).trim();

  if (!domain || !token) {
    return {
      ok: false,
      error: 'Missing Shopify Store Domain or Storefront Access Token.',
    };
  }

  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const endpoint = `https://${cleanDomain}/api/${API_VERSION}/graphql.json`;

  const query = `
    query TestShopifyAccess {
      shop {
        name
        description
        primaryDomain {
          url
          host
        }
      }
      products(first: 20) {
        edges {
          node {
            id
            title
            productType
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  const startTime = Date.now();

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({ query }),
      cache: 'no-store',
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      return {
        ok: false,
        latencyMs,
        error: `Shopify responded with HTTP ${res.status}: ${res.statusText}. Check domain and token.`,
      };
    }

    const json = await res.json();

    if (json.errors && json.errors.length > 0) {
      return {
        ok: false,
        latencyMs,
        error: json.errors[0]?.message || 'GraphQL error returned from Shopify.',
      };
    }

    const shop = json.data?.shop;
    const products = json.data?.products?.edges || [];

    return {
      ok: true,
      shopName: shop?.name || 'Shopify Storefront',
      domain: shop?.primaryDomain?.host || cleanDomain,
      currency: products[0]?.node?.priceRange?.minVariantPrice?.currencyCode || 'USD',
      productCount: products.length,
      latencyMs,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network error connecting to Shopify';
    return {
      ok: false,
      latencyMs: Date.now() - startTime,
      error: errorMsg,
    };
  }
}

/**
 * Action to sync product catalog from Shopify Storefront API.
 */
export async function syncShopifyCatalogAction(
  customDomain?: string,
  customToken?: string
): Promise<ShopifySyncResult> {
  const domain = (customDomain || DEFAULT_DOMAIN).trim();
  const token = (customToken || DEFAULT_TOKEN).trim();

  if (!domain || !token) {
    return {
      success: false,
      error: 'Cannot sync: Shopify credentials not configured.',
    };
  }

  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const endpoint = `https://${cleanDomain}/api/${API_VERSION}/graphql.json`;

  const query = `
    query GetShopifyCatalog {
      products(first: 30) {
        edges {
          node {
            id
            title
            description
            productType
            featuredImage {
              url
            }
            priceRange {
              minVariantPrice {
                amount
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({ query }),
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        success: false,
        error: `Shopify HTTP ${res.status}: ${res.statusText}`,
      };
    }

    const json = await res.json();
    if (json.errors) {
      return { success: false, error: json.errors[0]?.message };
    }

    const edges = json.data?.products?.edges || [];
    if (!edges.length) {
      return {
        success: true,
        products: [],
        count: 0,
        error: 'No products found in Shopify store catalog.',
      };
    }

    interface NodeItem {
      id: string;
      title: string;
      description: string;
      productType: string;
      featuredImage?: { url: string };
      priceRange: { minVariantPrice: { amount: string } };
    }

    const products: Product[] = edges.map(({ node }: { node: NodeItem }, idx: number) => ({
      id: node.id.split('/').pop() || String(idx + 1),
      name: node.title,
      price: `$${Number(node.priceRange.minVariantPrice.amount).toFixed(2)}`,
      image: node.featuredImage?.url || '/flavor-regular-real.png',
      category: (['Sweet', 'Savory', 'Spicy', 'Seasonal'].includes(node.productType)
        ? node.productType
        : 'Sweet') as Product['category'],
      description: node.description || "The Queen's Corn handcrafted kettle corn.",
    }));

    return {
      success: true,
      products,
      count: products.length,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Sync request failed',
    };
  }
}

/**
 * Action to test checkout creation with custom Arizona shipping / Farmers' Market pickup attributes.
 */
export async function testShopifyCheckoutAction(
  method: 'shipping' | 'pickup',
  pickupMarket?: string,
  fundraiserCode?: string
): Promise<ShopifyCheckoutTestResult> {
  if (!DEFAULT_DOMAIN || !DEFAULT_TOKEN) {
    // Provide a simulated checkout URL if Shopify is in local mode
    return {
      success: true,
      simulated: true,
      checkoutUrl: `/shop?checkout_simulated=true&method=${method}&market=${encodeURIComponent(
        pickupMarket || 'Farmers Market'
      )}&fundraiser=${encodeURIComponent(fundraiserCode || 'NONE')}`,
    };
  }

  const endpoint = `https://${DEFAULT_DOMAIN.replace(/^https?:\/\//, '')}/api/${API_VERSION}/graphql.json`;

  const attributes = [
    {
      key: 'Fulfillment_Method',
      value: method === 'pickup' ? 'Free Farmers Market Pickup' : 'Arizona / USPS Ground Advantage',
    },
    { key: 'Order_Source', value: 'Admin Operations Test' },
  ];

  if (method === 'pickup' && pickupMarket) {
    attributes.push({ key: 'Pickup_Market_Event', value: pickupMarket });
  }

  if (fundraiserCode) {
    attributes.push({ key: 'Fundraiser_Code', value: fundraiserCode });
    attributes.push({ key: 'Fundraiser_50_Percent_Giveback', value: 'Active' });
  }

  const mutation = `
    mutation CreateTestCart($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          checkoutUrl
        }
      }
    }
  `;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': DEFAULT_TOKEN,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            lines: [],
            attributes,
            discountCodes: fundraiserCode ? [fundraiserCode] : [],
          },
        },
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      return { success: false, error: `Shopify HTTP ${res.status}` };
    }

    const json = await res.json();
    const checkoutUrl = json.data?.cartCreate?.cart?.checkoutUrl;

    if (!checkoutUrl) {
      return { success: false, error: 'Could not generate Shopify checkout URL.' };
    }

    return {
      success: true,
      simulated: false,
      checkoutUrl,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create checkout',
    };
  }
}
