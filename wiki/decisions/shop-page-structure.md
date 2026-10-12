---
title: "Decision: Shop page structure"
type: decision
owner: unassigned
updated: 2026-10-10
status: proposed
sources:
  - wiki/design-system/shop-page-blueprint.html (v1, compact header revision)
  - src/app/shop/page.tsx @ ee5b44c
---

# Decision: Shop page structure

## Context
The current shop (`src/app/shop/page.tsx` @ ee5b44c) makes shoppers work too hard:
- a tall "The Flavor Vault" banner pushes the flavors below the fold;
- there is no way to choose a bag size on a card; "Quick add" silently adds a Family bag;
- pickup vs shipping only appears as a banner after it was chosen somewhere else;
- on phones the category filter hides in a dropdown;
- every card fades in on scroll, and the bottom promo card uses an AI-generated image.

## Decision
Build the shop around the three questions every shopper answers, in order, on one screen:

1. **How do you want it?** Ship it to me (anywhere in Arizona, free over $35) or pick up at a market
   (choose which, always free). Built into a **compact header band**: title and facts on the left,
   the choice on the right.
2. **Which flavor?** One row of taste chips with counts (All 8 · Sweet 3 · Savory 2 · Spicy 1 · Seasonal 2),
   sideways-scrolling on phones, sticky while browsing.
3. **Which size?** Small $6 · Family $10 · Party $15 **on every card**, a quantity stepper, and
   "Add · $line-total".

Plus a **bag bar** (count, total, free-shipping progress or "free pickup at {market}", one red
"View bag & check out" button; sticky on phones) and three **helpers** under the grid: a Caramel &
Cheddar starter for the undecided, a fundraiser-code box, and "Big order?" for parties and gifts.

Mockups, copy, data and mobile rules: [shop-page-blueprint.html](../design-system/shop-page-blueprint.html).

## Why
- People come to the shop to buy; every element answers one of their questions or helps them finish.
- Showing sizes and prices up front removes the surprise of a $10 bag when they expected $6.
- Settling delivery first makes totals and the free-shipping message make sense.

### Revision (2026-10-10): compact header
The first draft had a dark photo header with an empty right side and the delivery choice in a separate
card below it (~450px before any flavor). Feedback: "top part is mostly empty". The choice moved into
the header's right side: **247px on desktop, 313px on phones (was 628px)**, chips right after.

## Consequences
- Removed: "The Flavor Vault" banner, the phone dropdown, silent Family quick-add, the interstitial and
  AI-image promo card, fade-ins, and the separate pickup/fundraiser context banners.
- New components planned: `ShopHeader`, `FulfillmentPicker`, `FlavorFilter`, `ShopProductCard`, `BagBar`,
  `ShopHelpers`. The homepage keeps its compact `ProductCard`.
- Needs real bag photos for 7 of 8 flavors ([[open-questions]] #12).
- Related: [[landing-page-structure]], [[product-catalog]], [[fulfillment-and-shipping]].
