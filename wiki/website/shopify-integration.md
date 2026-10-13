---
title: Shopify Integration
type: website
owner: unassigned
updated: 2026-10-13
sources:
  - src/server/shopify.ts @ feature/admin-dashboard
  - src/server/shopify-admin.ts @ feature/admin-dashboard
  - src/app/actions/products.ts @ feature/admin-dashboard
  - src/app/actions/checkout.ts @ feature/admin-dashboard
  - src/app/actions/settings.ts @ feature/admin-dashboard
  - src/components/cart/CartDrawer.tsx @ feature/admin-dashboard
  - src/app/order/thank-you/ @ feature/admin-dashboard
---

# Shopify Integration

The site is a **headless storefront**: Next.js shows the catalog and the bag; Shopify takes the
payment and keeps customers, orders, receipts and refunds. The website stores none of that.

## Configuration

| Env var | Purpose |
|---|---|
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | `your-store.myshopify.com` (must end in `.myshopify.com`) |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | **Public** Storefront API token from the Headless sales channel |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | **Private** Admin API token of a custom app (optional, see below) |
| `SHOPIFY_ADMIN_CLIENT_ID` + `SHOPIFY_ADMIN_CLIENT_SECRET` | Or: a Dev Dashboard app's id and secret (store must be in the same organization) |

Only the server calls Shopify (`src/server/shopify.ts` reads, API `2025-01`; `src/server/shopify-admin.ts`
writes, API `2026-07`). If the first two variables are missing, checkout falls back to the contact form.
Values are never written in this wiki; names and scopes are in `.env.example`.

**Stores**

| Store | Use | State |
|---|---|---|
| `the-queens-popcorn.myshopify.com` | Development store (Partner account), test payments only | Connected on the developer machine (2026-10-13) |
| The owners' real store | Live orders and payouts | **Does not exist yet.** See [[open-questions]] |

## The dashboard writes products to Shopify

Decided 2026-10-13: the owners edit flavors in the dashboard ([[admin-portal]]) and never need
Shopify's product pages. With the private key set, every change on the Flavors screen is sent to
Shopify **first** and saved on the website only if Shopify accepted it.

| In the dashboard | In Shopify |
|---|---|
| Add a flavor | Product created: option `Size` = Small / Family / Party, prices from the Small price, stock not tracked (made to order), published to the Headless channel |
| Rename, description, taste category, price | Same product updated (the flavor keeps its `shopifyId`) |
| Hide / show | Unpublished from / published to the Headless channel |
| Delete | Product archived (past orders keep it) |
| Settings → "Send all flavors to Shopify" | Creates or updates every flavor; used once when a store is connected |

- A flavor whose name already exists in Shopify is linked to that product, not duplicated.
- Scopes the key needs: `write_products`, `write_publications`, `write_inventory` (and their read scopes).
- Without the key the Flavors screen only changes the website, and Settings says so.
- **Not sent:** photos (Shopify products have no image; the website shows its own).
- **Not pulled back:** changes made directly in Shopify. Settings → "Test the connection" lists any
  flavor or size that is missing, sold out or priced differently.
- Publishing takes a few seconds to reach checkout after a flavor is added or shown again.

Tested on the development store 2026-10-13: add, rename + reprice, hide, show, checkout of the new
flavor, delete (archived), and "Send all" (10 flavors, the two existing products linked, 0 issues).

> [!warning] The owners' store will need its own key. A Dev Dashboard app's id and secret only work
> for stores in the developer's own Shopify organization; for the owners' store the key has to be
> created in their admin (custom app). Not tried yet. See [[open-questions]].

## Checkout: `startCheckoutAction()`

`src/app/actions/checkout.ts`, called by the cart's "Proceed to Checkout" button.

1. Looks up each bag line again on the server (flavor by id, size, quantity 1–99).
2. Finds the Shopify variant by flavor name + `Size`. Stops with a message in the cart if it is
   missing, sold out, or **priced differently from the website**.
3. Checks the pickup market is still upcoming and the fundraiser still exists.
4. `cartCreate` with attributes, then sends the shopper to Shopify's `checkoutUrl`.

Order attributes (shown on the order in the Shopify admin):

- `Fulfillment_Method`: "Free Farmers Market Pickup" (or "Arizona / USPS Shipping" when shipping is on)
- `Pickup_Market_Event`: the event label
- `Fundraiser_Code` + `Fundraiser_50_Percent_Giveback` (organization). Attribution only: the code is
  **not** sent as a discount code any more. See [[fundraising-program]].

## After payment

Shopify's own confirmation page stays (order number, receipt, email). Its "Continue shopping" link
goes to Shopify's built-in storefront, so the Shopify theme (`layout/theme.liquid`) redirects that
storefront to the website: to `/order/thank-you` when the visitor comes from the confirmation page,
otherwise to `/shop`. The theme block has one `website_domain` value to set at launch.

## Shopify-side setup checklist (per store)

1. Payments on (test gateway on the dev store; Shopify Payments on the real one)
2. Headless sales channel installed, public token copied
3. Private key for the dashboard created and set on the server; then Settings → "Send all flavors to Shopify"
4. Redirect block in `layout/theme.liquid`
5. Local pickup on and shipping rates removed (orders are pickup only, see [[fulfillment-and-shipping]])
6. Store password removed (real store only; a development store always has one)

## Not verified yet

> [!warning] As of 2026-10-13: a completed test payment, the pickup market showing on the order, and
> the return from Shopify's confirmation page to `/order/thank-you` have not been confirmed. The dev
> store's checkout still asks for a shipping address (step 5 not done).
