---
title: Product Catalog
type: product
owner: unassigned
updated: 2026-10-10
sources:
  - src/data/products.ts @ ee5b44c
  - src/context/CartContext.tsx @ ee5b44c
---

# Product Catalog

All products are hand-stirred kettle corn made with pure corn oil, sugar and salt
(see [[company-overview]]). This is the catalog **as coded on the website**. Actual prices charged
at markets must be confirmed with the owners.

## Flavors

| ID | Flavor | Category | Base price | Featured on homepage |
|---|---|---|---|---|
| 1 | Regular Sweet & Salty (signature) | Sweet | $6.00 | ✓ 2nd, "Original Kettle" |
| 2 | Caramel | Sweet | $6.00 | ✓ 4th, "Artisan Glaze" |
| 3 | Cheddar | Savory | $6.00 | |
| 4 | Jalapeño | Spicy | $6.00 | ✓ 3rd, "Desert Heat" |
| 5 | Caramel Apple | Sweet | $6.00 | |
| 6 | Caramel & Cheddar | Savory | $6.00 | ✓ 1st, labelled "#1 Best Seller" (unverified) |
| 7 | Holiday Mix (cinnamon, apple, sweet & salty) | Seasonal | $6.00 | |
| 8 | Patriot Mix (red, white & blue) | Seasonal | $6.00 | |

Source: `src/data/products.ts @ ee5b44c`. Shop filter categories: All Flavors, Sweet, Savory, Spicy, Seasonal.

## Bag sizes & pricing

| Size | Price (when base = $6) |
|---|---|
| Small (Individual) | $6 |
| Medium (Family) | $10 |
| Large (Party) | $15 |

The cart scales a product's base price by the same ratio (×10/6 for Medium, ×15/6 for Large), so a
price change in the admin portal scales all three sizes (`addItem` in src/context/CartContext.tsx @ ee5b44c).

- **Free Arizona shipping** at a $35 subtotal (`FREE_AZ_SHIPPING_THRESHOLD`). See [[fulfillment-and-shipping]].
- Fundraising math on the site assumes the **$10 Medium Family bag**. See [[fundraising-program]].

## How the new homepage shows products (feature/landing-page-v3)

- Cards show **"from $6"** and the three sizes up front; "+ Add to bag" adds a **Small** and opens the bag.
- Each product has a `taste` value (one meter of 1–5 kernels, e.g. Sweet 4, Heat 3) in `src/data/products.ts`.
  These were set by us, not the owners: they should review them ([[open-questions]] #14).
- The hero card adds **Caramel & Cheddar** (it matches the close-up photo).
- Planned shop: size picker and quantity on every card ([[shop-page-structure]]).

## Where product data comes from

- If Shopify is configured, products load from the Shopify Storefront API; otherwise the local list
  above is used. See [[shopify-integration]].
- Product photos are `public/flavor-*.png`. **Despite the `-real` in some filenames, these are AI-generated**
  (bags show a fake red-hat logo). Real bag photos are needed ([[open-questions]] #12); the only real
  product close-up is `public/popcorn-scoop-fresh.jpg` (caramel & cheddar mix).

> [!warning] Unverified: whether $6/$10/$15 matches real market pricing, and whether the flavor
> list is complete or current. Tracked in [[open-questions]].
