---
title: Fulfillment — Market Pickup (shipping planned)
type: business
owner: unassigned
updated: 2026-10-13
sources:
  - src/lib/shop.ts @ 7b5715f
  - src/app/actions/checkout.ts @ 7b5715f
  - src/components/cart/CartDrawer.tsx @ 7b5715f
  - src/app/admin/(dashboard)/orders/page.tsx @ 7b5715f
  - src/app/terms-of-service/page.tsx @ 7b5715f
---

# Fulfillment: Market Pickup (shipping planned)

## How an order is fulfilled today

Orders are **pickup only**. Nothing is posted or delivered.

1. The shopper chooses flavors and a market in the cart ([[events-and-markets]]).
2. They pay on Shopify's checkout ([[shopify-integration]]). The order carries `Fulfillment_Method`
   and `Pickup_Market_Event`.
3. The order shows on the dashboard's **Orders** screen under that market, with a bag count per
   flavor and size ([[admin-portal]]).
4. The popcorn is made to order (no stock is kept). The customer collects it at the stand by name.
5. The owners mark the order fulfilled in Shopify; it leaves the Orders screen.

Shipping is switched off in the code (`SHIPPING_AVAILABLE = false` in `src/lib/shop.ts`); the site shows
"Shipping · Coming soon". If Shopify is not connected, checkout falls back to the contact form.

> [!warning] Shopify's checkout still asks for a delivery address and adds a shipping fee (test orders:
> $14.00 for one $6.00 bag). Fix in Shopify: Settings → Shipping and delivery → switch on **Local
> pickup** and remove the shipping rates. Not done yet (2026-10-13). See [[open-questions]].

## Delivery options looked at (2026-10-13)

| Option | Fit | Why |
|---|---|---|
| USPS through Shopify Shipping | **Best next step** | Light, shelf-stable bags to homes; works without a fixed shop; no extra subscription |
| UPS / FedEx | Later, for heavy boxes | Usually dearer than USPS for 1–3 lb parcels to homes |
| Owners deliver (Shopify Local Delivery) | Ruled out | The owners will not deliver themselves |
| DoorDash / Uber Eats / Grubhub (and DoorDash Drive) | Only with a fixed address | Popcorn shops do use them, but every example is a shop with a street address and hours; this business pops from a trailer at markets |
| Goldbelly | Maybe much later | Curated marketplace, commission, ships across state lines |

Web research was a handful of examples (popcorn shops shipping by USPS / UPS / FedEx, and shops with
storefronts listed on the delivery apps), not a survey.

## Plan: USPS shipping within Arizona (not started)

**1. Owners decide first**
- Whether their food licence allows shipping at all, and to where (cottage-food rules may limit it)
- Fee and free-shipping threshold. `FREE_AZ_SHIPPING_THRESHOLD = 35` and "$4.95" in the code are
  **placeholders**; real postage for a bulky box is probably $8–12
- Lead time ("popped fresh and shipped within 2–3 business days"), ship days (Mon–Wed), box sizes,
  which flavors ship in summer heat

**2. Shopify (about an hour):** Arizona shipping zone with a flat rate, saved package sizes, processing
time, bag weights; Local pickup stays on.

**3. Website (about a day):** set `SHIPPING_AVAILABLE` to true, real fee and threshold, send the pickup /
shipping choice through to checkout, bag weights on products created from the dashboard, shipping
section back in the Terms, addresses in the Privacy Policy.

**4. Dashboard (about half a day):** a "To ship" group on the Orders screen; needs the **Address** field
allowed for the Shopify app.

**5. Test:** Arizona address, free-shipping threshold, out-of-state address refused, pickup still free,
one real label posted to ourselves.

Made-to-order works with shipping: state the lead time, pop and ship on fixed days, keep "Track
quantity" off in Shopify.
