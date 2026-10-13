---
title: Open Questions
type: overview
owner: unassigned
updated: 2026-10-13
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
7. **Shopify store for the owners:** a development store is connected for testing, but the owners' real
   store does not exist yet. They create it (their email, Basic plan, Shopify Payments), then approve a
   collaborator request. See [[shopify-integration]]
10. **Live admin settings:** `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` must be set in Vercel
    with new values, and an Upstash Redis database added, or the live dashboard cannot sign in or save.
    See [[admin-portal]]
16. **Hosting plan:** Vercel's free plan does not allow commercial use; a business site needs Pro. Who pays,
    and under whose account?
17. **Live domain:** what is the website's final address? It goes into the Shopify theme redirect and
    `metadataBase`. See [[shopify-integration]]
18. **Test order:** a completed test payment, the pickup market on the order and the return to
    `/order/thank-you` are not confirmed yet. See [[shopify-integration]]
19. **Pickup-only checkout:** Shopify still asks for a shipping address until Local pickup is switched on
    and shipping rates are removed. See [[fulfillment-and-shipping]]
20. **Dashboard key for the owners' store:** the development store uses a Dev Dashboard app, which only
    works inside the developer's Shopify organization. How the key is created in the owners' store is
    not tried yet. See [[shopify-integration]]
21. **Privacy Policy and Terms wording:** `/privacy-policy` is new and Terms sections 02–05 were rewritten
    for pickup-only ordering (2026-10-13). Written by the developer from what the site does; the owners (and
    ideally a lawyer) should read and approve both, including the 30-day answer promise.

## Resolved
- **8. Checkout variant ids** (2026-10-13): checkout now runs on the server and matches flavor name + `Size`
  to the Shopify variant. See [[shopify-integration]]
- **9. Fundraiser code as a discount code** (2026-10-13): no longer sent as a discount code; it is recorded
  on the order for attribution only. See [[shopify-integration]]
