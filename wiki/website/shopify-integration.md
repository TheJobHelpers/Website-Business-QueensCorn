---
title: Shopify Integration
type: website
owner: unassigned
updated: 2026-10-13
sources:
  - src/server/shopify.ts @ feature/admin-dashboard
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

API version `2025-01`. Only the server calls Shopify (`src/server/shopify.ts`). If either variable is
missing, checkout falls back to the contact form.

**Stores**

| Store | Use | State |
|---|---|---|
| `the-queens-popcorn.myshopify.com` | Development store (Partner account), test payments only | Connected on the developer machine (2026-10-13) |
| The owners' real store | Live orders and payouts | **Does not exist yet.** See [[open-questions]] |

## How the catalog lines up

The website's flavor list (dashboard, see [[admin-portal]]) stays the source for what the shop shows.
Shopify must have a matching product for each flavor to be sold online:

- **Product title** = the flavor name, exactly (e.g. `Caramel`)
- **Option `Size`** with the values `Small`, `Family`, `Party`
- **Prices** equal to the website's ($6 / $10 / $15 for a $6 flavor; Family and Party scale from Small)
- Published to the **Headless** sales channel, and in stock (or "Continue selling when out of stock")

The dashboard's **Settings → Test the connection** lists every flavor or size that is missing, sold
out or priced differently.

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
2. Products as described above
3. Headless sales channel installed, products published to it, public token copied
4. Redirect block in `layout/theme.liquid`
5. Local pickup on and shipping rates removed (orders are pickup only, see [[fulfillment-and-shipping]])
6. Store password removed (real store only; a development store always has one)

## Not verified yet

> [!warning] As of 2026-10-13: a completed test payment, the pickup market showing on the order, and
> the return from Shopify's confirmation page to `/order/thank-you` have not been confirmed. The dev
> store's checkout still asks for a shipping address (step 5 not done).
