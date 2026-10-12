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
11. **Design v3 sign-off:** do Bob & Reina approve the "Canopy" direction? Do they have the printer's exact
    red/yellow codes for the banners? See [[design-palette-decision]]
12. **Real product photos:** can we shoot each flavor bag (real label) for the shop? 7 of 8 flavors use
    AI-generated images with a fake logo; the shop design shows a placeholder until real photos exist.
    See [[brand-and-design-system]], [[shop-page-structure]]
13. **Trust strip claims:** is "100% Non-GMO" (mushroom kernels) true for every flavor? Is there a real total
    donated through fundraisers (the old banner said "Over $34,000", removed until confirmed)?
    See `src/components/TrustBanner.tsx`
14. **Taste levels:** do Bob & Reina agree with the 1–5 taste meters per flavor (e.g. Caramel sweet 5,
    Jalapeño heat 3)? Set by us in `src/data/products.ts`. See [[product-catalog]]
15. **Real reviews:** 3 reviews from Google/Facebook (with permission) to switch the reviews section on.
    See [[landing-page-structure]]

## Website: technical
7. **Shopify:** does a store exist, and are the env vars set in Vercel? See [[shopify-integration]]
8. **Checkout variant ids:** the cart sends local/product ids as `ProductVariant` ids, and sizes aren't
   mapped to variants. Real checkout will likely fail. See [[shopify-integration]]
9. **Fundraiser code as a discount code:** do matching discount codes exist in Shopify, and should the
   customer get a discount, or is this only for attribution? See [[fundraising-program]]
10. **Admin security & storage (now live on `main`):** are `ADMIN_EMAIL`, `ADMIN_PASSWORD` and
    `ADMIN_SESSION_SECRET` set in Vercel? If not, the hardcoded fallbacks are active. Event edits go to
    `src/data/db.json`, which won't persist on Vercel; fundraiser and product edits are localStorage only.
    See [[admin-portal]]

## Resolved
_(none yet)_
