---
title: Open Questions
type: overview
owner: unassigned
updated: 2026-10-10
---

# Open Questions

Things to confirm, contradictions, and known risks. When one is resolved, move it to **Resolved**
with the answer and source, and update the related page.

## Business: ask Bob & Reina
1. **Real prices:** are $6 / $10 / $15 (Small / Medium / Large) correct? Are all flavors the same price? See [[product-catalog]]
2. **Flavor list:** is the list of 8 flavors complete and current? Are Holiday and Patriot only seasonal? See [[product-catalog]]
3. **Service area:** the story page says Phoenix, Payson, East Valley; the events are Avondale, Oro Valley,
   Phoenix, Litchfield, Marana ("hometown"). Which is right? See [[company-overview]]
4. **Event schedule:** are the fall 2026 events real or placeholder? See [[events-and-markets]]
5. **Fundraising:** are the 3 sample campaigns real? How and when is the 50% paid out? See [[fundraising-program]]
6. **Shipping:** Arizona only? Is the free threshold $35? See [[fulfillment-and-shipping]]

## Website: technical
7. **Shopify:** does a store exist, and are the env vars set in Vercel? See [[shopify-integration]]
8. **Checkout variant ids:** the cart sends local/product ids as `ProductVariant` ids, and sizes aren't
   mapped to variants. Real checkout will likely fail. See [[shopify-integration]]
9. **Fundraiser code as a discount code:** do matching discount codes exist in Shopify, and should the
   customer get a discount, or is this only for attribution? See [[fundraising-program]]
10. **Admin security & storage:** `main` has no real auth and stores edits in localStorage only. The feature
    branch has hardcoded fallback credentials/secret, and its JSON file store won't persist on Vercel.
    See [[admin-portal]]

## Resolved
_(none yet)_
