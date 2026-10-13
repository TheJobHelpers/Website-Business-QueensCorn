---
title: Product Catalog
type: product
owner: unassigned
updated: 2026-10-13
sources:
  - src/data/products.ts @ 7b5715f
  - src/lib/shop.ts @ 7b5715f
  - src/server/shopify-admin.ts @ 7b5715f
---

# Product Catalog

All products are hand-stirred kettle corn made with pure corn oil, sugar and salt
([[company-overview]]), popped to order: no stock is kept.

## Flavors

The built-in list in `src/data/products.ts` (the owners' list of 2026-10-12). The owners change it in
the dashboard's Flavors screen ([[admin-portal]]); the saved list then replaces this one.

| ID | Flavor | Taste | On the homepage |
|---|---|---|---|
| 1 | Sweet & Salty | Sweet | ✓ |
| 2 | Caramel | Sweet | ✓ |
| 5 | Caramel Apple | Sweet | |
| 6 | Caramel Cheddar | Savory | ✓ |
| 3 | Cheddar | Savory | |
| 4 | Cheddar with Smoked Jalapeño | Spicy | ✓ |
| 9 | Cinnamon Apple | Sweet | |
| 8 | Patriot (Red-White-Blue) | Seasonal | |
| 10 | Nacho Cheddar | Savory | |
| 11 | BBQ Cheddar | Savory | |

Shop filters: All Flavors, Sweet, Savory, Spicy, Seasonal. A flavor can be **hidden** (kept but not
shown or sold) and up to four are shown on the homepage.

## Bag sizes and prices

| Size | Built-in price |
|---|---|
| Small | $6.00 |
| Family | $10.00 |
| Party | $15.00 |

- Each flavor has **its own price for each size**, set in the dashboard (`price`, `familyPrice`,
  `partyPrice`). A flavor without its own Family / Party price scales them from the Small price
  (×10/6 and ×15/6).
- `sizePrice()` in `src/lib/shop.ts` is the one place a bag price is worked out; the shop cards, product
  page, homepage price row, cart, checkout and the Shopify product all use it.
- Fundraising math on the site assumes the $10 Family bag. See [[fundraising-program]].

## Photos

- Each flavor has a branded bag photo, `public/product-*.webp` (1254×1254, added in PR #5).
- The older `public/flavor-*.png` images are AI-generated and are still selectable in the dashboard.
- The dashboard's photo picker lists files in `/public`; uploading a new photo from the dashboard is
  not built.

## In Shopify

Every flavor is a Shopify product with a `Size` option (Small / Family / Party), kept in step by the
dashboard: name, description, taste (product type), the three prices and the photo. See
[[shopify-integration]].

> [!warning] Unverified with the owners: the real prices, the descriptions and taste levels of the
> newer flavors (written by us), and whether Patriot is seasonal only. See [[open-questions]].
