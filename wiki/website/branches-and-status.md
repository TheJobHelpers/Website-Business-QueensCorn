---
title: Branches & Project Status
type: website
owner: unassigned
updated: 2026-10-10
sources:
  - git log main @ fbdbf0b
  - git log origin/feature/landing-page-polish-and-real-photos @ a6ec144
---

# Branches & Project Status

_Snapshot as of 2026-10-10. Update on every "sync"._

## `main` @ `fbdbf0b` (2026-09-29)

Timeline:
- **2026-04-28**: project init; shop, product detail, contact, homepage sections, events, layout
- **2026-05-28**: Hero styling/animations
- **2026-09-28**: UI fixes, cart drawer, fundraising page, Shopify client; Queen's Corn branding + `/admin`
- **2026-09-29**: admin expanded with orders, events, fundraisers, products

State: storefront works on local data. Shopify isn't wired to a real store (unverified). Admin is a
demo. See [[admin-portal]].

## `feature/landing-page-polish-and-real-photos` @ `a6ec144` (2026-10-07), not merged

5 commits ahead of main, 64 files changed:
- Light **buttercream** design system across the site. See [[brand-and-design-system]]
- Real photography on the landing page; Bob & Reina photo restored in the Story section
- **Terms of Service** page (`/terms-of-service`) "matching thequeenscorn.com", with redirects from
  `/terms`, `/terms-and-conditions`, `/privacy-policy`
- New `UpcomingEvents` homepage component
- Real admin auth (`/admin/login`, `src/proxy.ts`), server actions for events and Shopify, and a JSON store.
  See [[admin-portal]] and [[shopify-integration]]

## `docs/llm-wiki`

Adds this `wiki/` folder.

## Next steps (inferred, not confirmed)

1. Review and merge the feature branch, after setting the `ADMIN_*` env vars.
2. Connect a real Shopify store and map products and sizes to variant ids.
3. Replace the JSON/localStorage admin storage with persistent storage.

See [[open-questions]].
