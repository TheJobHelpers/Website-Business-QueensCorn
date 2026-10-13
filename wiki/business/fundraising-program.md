---
title: Fundraising Program (50% Giveback)
type: business
owner: unassigned
updated: 2026-10-13
sources:
  - src/app/fundraising/page.tsx @ ee5b44c
  - src/data/fundraisers.ts @ ee5b44c
  - src/app/actions/checkout.ts @ 7b5715f
  - src/app/admin/(dashboard)/sales/page.tsx @ 7b5715f
---

# Fundraising Program

Arizona schools, youth sports teams and community clubs raise money by selling Queen's Corn.

## The offer (as stated on the website)

- **50% of attributed sales** go to the organization, paid "as soon as your campaign wraps up".
- Every bag is popped fresh to order.
- The site's earnings calculator assumes **$10 Medium Family bags**. See [[product-catalog]].

## How attribution works

1. Each campaign has a **code** (e.g. `TIGERS50`). The owners add and edit campaigns in the dashboard
   ([[admin-portal]]).
2. A shopper picks the fundraiser in the cart, which shows "$X (50%) of your order goes to <org>".
3. At checkout two notes are put on the Shopify order: `Fundraiser_Code` and
   `Fundraiser_50_Percent_Giveback` (the group's name). The code is **not** a discount code: the
   shopper pays the normal price. See [[shopify-integration]].
4. The dashboard's **Sales** screen adds up, per campaign, the orders of the last 60 days and the
   group's half. The half is worked out on the popcorn only, before discounts, shipping and tax.
5. The "raised so far" figure on the public fundraising page is typed in by the owners in the
   dashboard; it is not updated automatically from orders.

> [!warning] The Sales screen's figures are a guide. Check against Shopify before paying a group.
> How and when the 50% is paid out is still to be confirmed. See [[open-questions]].

## Sample campaigns in the code (demo data, not confirmed real)

| Organization | Code | Goal | Raised | Ends |
|---|---|---|---|---|
| Marana High School Tiger Band | TIGERS50 | $2,500 | $1,850 | Nov 15, 2026 |
| Oro Valley Youth Soccer Club | OVSOCCER | $2,000 | $1,120 | Nov 30, 2026 |
| Estrella Foothills STEM Club | STEMCORN | $1,500 | $960 | Dec 05, 2026 |

Source: `src/data/fundraisers.ts @ ee5b44c`.

## Related

[[company-overview]] · [[fulfillment-and-shipping]]
