---
title: Shopify Integration
type: website
owner: unassigned
updated: 2026-10-10
sources:
  - src/lib/shopify.ts @ fbdbf0b
  - src/components/cart/CartDrawer.tsx @ fbdbf0b
---

# Shopify Integration

The site is a **headless storefront**: Next.js UI, with Shopify handling products and checkout.

## Configuration

| Env var | Purpose |
|---|---|
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | e.g. `your-store.myshopify.com` |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Storefront API token (public-scope token, OK in the browser) |

API version `2025-01`, GraphQL endpoint `/api/2025-01/graphql.json`, cached 60s (`revalidate: 60`).
**If either variable is missing, everything falls back to local data** in `src/data/`, and checkout
falls back to the contact form. See [[fulfillment-and-shipping]].

> [!warning] Unverified: whether a Shopify store exists and the env vars are set in Vercel.
> See [[open-questions]].

## What's read from Shopify

| Function | Shopify source | Fallback |
|---|---|---|
| `getProducts()` | `products(first: 20)`; `productType` maps to category (Sweet/Savory/Spicy/Seasonal, default Sweet) | `ALL_PRODUCTS` |
| `getEvents()` | Metaobjects type **`event`**: `month, day, year, title, description, time, location, pickup_available` | `UPCOMING_EVENTS` |
| `getFundraisers()` | Metaobjects type **`fundraiser`**: `organization, category, code, description, goal_amount, raised_amount, end_date, location` | `ACTIVE_FUNDRAISERS` |

## Checkout: `createShopifyCheckout()`

Uses the `cartCreate` mutation and redirects to `checkoutUrl`. Adds cart attributes:

- `Fulfillment_Method`: "Free Farmers Market Pickup" or "Arizona / USPS Shipping"
- `Pickup_Market_Event`: event label (pickup only)
- `Fundraiser_Code` + `Fundraiser_50_Percent_Giveback` (org name), and the code as a **discount code**.
  See [[fundraising-program]].

> [!warning] Known gap: the cart sends `gid://shopify/ProductVariant/<product.id>`, where `id` is the
> local id ("1", "2"…) or a Shopify *product* id. Neither is a variant id, and bag size isn't mapped
> to a variant, so real checkout will likely fail until variants are wired up. See [[open-questions]].

## Feature branch additions

`src/app/actions/shopify.ts` adds server actions: `testShopifyConnectionAction`,
`syncShopifyCatalogAction`, `testShopifyCheckoutAction` (used by the admin Settings screen).
See [[branches-and-status]].
