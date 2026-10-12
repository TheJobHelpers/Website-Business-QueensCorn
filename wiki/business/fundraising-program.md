---
title: Fundraising Program (50% Giveback)
type: business
owner: unassigned
updated: 2026-10-10
sources:
  - src/app/fundraising/page.tsx @ ee5b44c
  - src/data/fundraisers.ts @ ee5b44c
  - src/lib/shopify.ts @ ee5b44c
  - src/components/cart/CartDrawer.tsx @ ee5b44c
---

# Fundraising Program

Arizona schools, youth sports teams and community clubs raise money by selling Queen's Corn.

## The offer (as stated on the website)

- **50% of attributed sales** go to the organization, paid "as soon as your campaign wraps up".
- Every bag is popped fresh to order.
- The site's earnings calculator assumes **$10 Medium Family bags**. See [[product-catalog]].

## How attribution works

1. Each campaign has a **code** (e.g. `TIGERS50`).
2. A customer picks the fundraiser in the cart drawer, which shows "$X (50%) of your order goes to <org>".
3. At Shopify checkout the code is applied as a **discount code**, and two cart attributes are added:
   `Fundraiser_Code` and `Fundraiser_50_Percent_Giveback` (org name). See [[shopify-integration]].
4. Owners track progress (raised vs. goal) in the admin portal. See [[admin-portal]].

> [!warning] The code is sent to Shopify as a *discount code*. If that code doesn't exist in Shopify,
> checkout may reject it. If it does exist, it may discount the customer's price as well as
> attributing the sale. The intended behavior needs confirming. See [[open-questions]].

## Sample campaigns in the code (demo data, not confirmed real)

| Organization | Code | Goal | Raised | Ends |
|---|---|---|---|---|
| Marana High School Tiger Band | TIGERS50 | $2,500 | $1,850 | Nov 15, 2026 |
| Oro Valley Youth Soccer Club | OVSOCCER | $2,000 | $1,120 | Nov 30, 2026 |
| Estrella Foothills STEM Club | STEMCORN | $1,500 | $960 | Dec 05, 2026 |

Source: `src/data/fundraisers.ts @ ee5b44c`.

## Related

[[company-overview]] · [[fulfillment-and-shipping]]
