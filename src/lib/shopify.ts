import { ALL_PRODUCTS, Product } from '@/data/products';
import { UPCOMING_EVENTS, EventItem } from '@/data/events';
import { ACTIVE_FUNDRAISERS, FundraiserCampaign } from '@/data/fundraisers';

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = '2025-01';

export function isShopifyConfigured(): boolean {
  return Boolean(SHOPIFY_DOMAIN && SHOPIFY_TOKEN);
}

async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T | null> {
  if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
    return null;
  }

  try {
    const endpoint = `https://${SHOPIFY_DOMAIN.replace(/^https?:\/\//, '')}/api/${API_VERSION}/graphql.json`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data as T;
  } catch {
    return null;
  }
}

/**
 * Fetches products from Shopify Storefront API, falling back to local catalog if not configured.
 */
export async function getProducts(): Promise<Product[]> {
  if (!isShopifyConfigured()) return ALL_PRODUCTS;

  const query = `
    query GetProducts {
      products(first: 20) {
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

  interface ShopifyProductsData {
    products: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          description: string;
          productType: string;
          featuredImage?: { url: string };
          priceRange: { minVariantPrice: { amount: string } };
        };
      }>;
    };
  }

  const data = await shopifyFetch<ShopifyProductsData>(query);
  if (!data?.products?.edges?.length) return ALL_PRODUCTS;

  return data.products.edges.map(({ node }, idx) => ({
    id: node.id.split('/').pop() || String(idx + 1),
    name: node.title,
    price: `$${Number(node.priceRange.minVariantPrice.amount).toFixed(2)}`,
    image: node.featuredImage?.url || '/flavor-regular-real.png',
    category: (['Sweet', 'Savory', 'Spicy', 'Seasonal'].includes(node.productType)
      ? node.productType
      : 'Sweet') as Product['category'],
    description: node.description,
  }));
}

/**
 * Fetches upcoming events from Shopify Metaobjects (type: "event"), falling back to UPCOMING_EVENTS.
 */
export async function getEvents(): Promise<EventItem[]> {
  if (!isShopifyConfigured()) return UPCOMING_EVENTS;

  const query = `
    query GetEvents {
      metaobjects(type: "event", first: 20) {
        edges {
          node {
            id
            fields {
              key
              value
            }
          }
        }
      }
    }
  `;

  interface ShopifyMetaobjectsData {
    metaobjects: {
      edges: Array<{
        node: {
          id: string;
          fields: Array<{ key: string; value: string }>;
        };
      }>;
    };
  }

  const data = await shopifyFetch<ShopifyMetaobjectsData>(query);
  if (!data?.metaobjects?.edges?.length) return UPCOMING_EVENTS;

  return data.metaobjects.edges.map(({ node }, idx) => {
    const fieldMap = Object.fromEntries(node.fields.map((f) => [f.key, f.value]));
    return {
      id: node.id || `evt-${idx}`,
      month: fieldMap.month || 'Oct',
      day: fieldMap.day || '10',
      year: fieldMap.year || '2026',
      title: fieldMap.title || 'Farmers Market Event',
      desc: fieldMap.description || '',
      time: fieldMap.time || '9:00 am - 1:00 pm',
      location: fieldMap.location || 'Arizona',
      pickupAvailable: fieldMap.pickup_available !== 'false',
    };
  });
}

/**
 * Fetches active fundraising campaigns from Shopify Metaobjects (type: "fundraiser"), falling back to ACTIVE_FUNDRAISERS.
 */
export async function getFundraisers(): Promise<FundraiserCampaign[]> {
  if (!isShopifyConfigured()) return ACTIVE_FUNDRAISERS;

  const query = `
    query GetFundraisers {
      metaobjects(type: "fundraiser", first: 20) {
        edges {
          node {
            id
            fields {
              key
              value
            }
          }
        }
      }
    }
  `;

  interface ShopifyMetaobjectsData {
    metaobjects: {
      edges: Array<{
        node: {
          id: string;
          fields: Array<{ key: string; value: string }>;
        };
      }>;
    };
  }

  const data = await shopifyFetch<ShopifyMetaobjectsData>(query);
  if (!data?.metaobjects?.edges?.length) return ACTIVE_FUNDRAISERS;

  return data.metaobjects.edges.map(({ node }, idx) => {
    const fieldMap = Object.fromEntries(node.fields.map((f) => [f.key, f.value]));
    return {
      id: node.id || `fund-${idx}`,
      organization: fieldMap.organization || 'Community Fundraiser',
      category: fieldMap.category || 'School & Community',
      code: fieldMap.code || 'ROYAL50',
      description: fieldMap.description || '',
      goalAmount: Number(fieldMap.goal_amount || 2000),
      raisedAmount: Number(fieldMap.raised_amount || 0),
      endDate: fieldMap.end_date || 'Ongoing',
      location: fieldMap.location || 'Arizona',
    };
  });
}

export interface CheckoutOrderMetadata {
  fulfillmentMethod: 'shipping' | 'pickup';
  pickupEventTitle?: string;
  fundraiserCode?: string;
  fundraiserOrganization?: string;
}

/**
 * Creates a Shopify Checkout URL with custom order attributes for Arizona Shipping vs Market Pickup and Fundraiser attribution.
 * Returns null if Shopify environment variables are not yet configured.
 */
export async function createShopifyCheckout(
  lines: Array<{ merchandiseId: string; quantity: number }>,
  meta: CheckoutOrderMetadata
): Promise<string | null> {
  if (!isShopifyConfigured()) return null;

  const attributes = [
    {
      key: 'Fulfillment_Method',
      value: meta.fulfillmentMethod === 'pickup' ? 'Free Farmers Market Pickup' : 'Arizona / USPS Shipping',
    },
  ];

  if (meta.fulfillmentMethod === 'pickup' && meta.pickupEventTitle) {
    attributes.push({ key: 'Pickup_Market_Event', value: meta.pickupEventTitle });
  }

  if (meta.fundraiserCode) {
    attributes.push({ key: 'Fundraiser_Code', value: meta.fundraiserCode });
  }

  if (meta.fundraiserOrganization) {
    attributes.push({
      key: 'Fundraiser_50_Percent_Giveback',
      value: meta.fundraiserOrganization,
    });
  }

  const mutation = `
    mutation CartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          checkoutUrl
        }
      }
    }
  `;

  interface CartCreateResponse {
    cartCreate?: {
      cart?: {
        checkoutUrl?: string;
      };
    };
  }

  const data = await shopifyFetch<CartCreateResponse>(mutation, {
    input: {
      lines,
      attributes,
      discountCodes: meta.fundraiserCode ? [meta.fundraiserCode] : [],
    },
  });

  return data?.cartCreate?.cart?.checkoutUrl || null;
}
