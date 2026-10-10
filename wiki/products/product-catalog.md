---
title: Product Catalog
type: product
owner: unassigned
updated: 2026-10-10
sources:
  - src/data/products.ts @ fbdbf0b
  - src/context/CartContext.tsx @ fbdbf0b
---

# Product Catalog

All products are hand-stirred kettle corn made with pure corn oil, sugar and salt
(see [[company-overview]]). This is the catalog **as coded on the website**. Actual prices charged
at markets must be confirmed with the owners.

## Flavors

| ID | Flavor | Category | Base price | Featured on homepage |
|---|---|---|---|---|
| 1 | Regular Sweet & Salty (signature) | Sweet | $6.00 | |
| 2 | Caramel | Sweet | $6.00 | ✓ |
| 3 | Cheddar | Savory | $6.00 | ✓ |
| 4 | Jalapeño | Spicy | $6.00 | ✓ (shown first) |
| 5 | Caramel Apple | Sweet | $6.00 | |
| 6 | Caramel & Cheddar | Savory | $6.00 | |
| 7 | Holiday Mix (cinnamon, apple, sweet & salty) | Seasonal | $6.00 | |
| 8 | Patriot Mix (red, white & blue) | Seasonal | $6.00 | |

Source: `src/data/products.ts @ fbdbf0b`. Shop filter categories: All Flavors, Sweet, Savory, Spicy, Seasonal.

## Bag sizes & pricing

| Size | Price (when base = $6) |
|---|---|
| Small (Individual) | $6 |
| Medium (Family) | $10 |
| Large (Party) | $15 |

The cart scales a product's base price by the same ratio (×10/6 for Medium, ×15/6 for Large), so a
price change in the admin portal scales all three sizes (`addItem` in src/context/CartContext.tsx @ fbdbf0b).

- **Free Arizona shipping** at a $35 subtotal (`FREE_AZ_SHIPPING_THRESHOLD`). See [[fulfillment-and-shipping]].
- Fundraising math on the site assumes the **$10 Medium Family bag**. See [[fundraising-program]].

## Where product data comes from

- If Shopify is configured, products load from the Shopify Storefront API; otherwise the local list
  above is used. See [[shopify-integration]].
- Product photos are in `public/flavor-*-real.png`. Some flavors still use non-"real" images
  (Caramel & Cheddar, Holiday Mix).

> [!warning] Unverified: whether $6/$10/$15 matches real market pricing, and whether the flavor
> list is complete or current. Tracked in [[open-questions]].
