---
title: Branches & Project Status
type: website
owner: unassigned
updated: 2026-10-10
sources:
  - git log origin/main @ ee5b44c
  - gh pr list (PR #1, PR #2)
---

# Branches & Project Status

_Snapshot as of 2026-10-10. Update on every "sync"._

## `main` @ `ee5b44c`: what's live

Timeline:
- **2026-04-28**: project init; shop, product detail, contact, homepage sections, events, layout
- **2026-05-28**: Hero styling/animations
- **2026-09-28/29**: cart drawer, fundraising page, Shopify client, Queen's Corn branding, `/admin`
- **2026-10-10, PR #1 merged** (`feature/landing-page-polish-and-real-photos`, branch deleted):
  - **Light "Buttercream" palette** across the whole site (Instrument Serif + Outfit kept)
  - Real photography (Bob & Reina, kettle, trailer, booth); hero scrim fix
  - `/terms-of-service` with redirects from `/terms`, `/terms-and-conditions`, `/privacy-policy`
  - Real admin login (`/admin/login`, `src/proxy.ts`), events saved server-side, Shopify admin actions
  - `UpcomingEvents` homepage section; 4 featured products
  - Old v2 spec `public/design-system.html`
- **2026-10-10, PR #2 merged** (`docs/llm-wiki`): this wiki.

## Open branches

- `docs/design-system-v3`: design system v3 "Canopy" in `wiki/design-system/`, wiki sync to `ee5b44c`,
  and the design-system rule in `AGENTS.md`/`CLAUDE.md`. Docs only, no site changes.

## Plan (updated 2026-10-10)

The live site is Buttercream. The agreed direction is v3 "Canopy" ([[design-palette-decision]]).

1. **Merge `docs/design-system-v3`** so every agent follows the new rules.
2. **Get Bob & Reina's sign-off** on Canopy and their printer's red/yellow codes. Tweak `tokens.css` if needed.
3. **Urgent, separate from design:** set `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in
   Vercel (the hardcoded fallbacks are live). See [[admin-portal]].
4. **Apply v3 to the code** in a `feature/design-system-v3` branch, in this order:
   1. Tokens: rewrite `:root` in `src/app/globals.css` to mirror `wiki/design-system/tokens.css`, keeping
      the old variable names as aliases for one release so nothing breaks.
   2. Fonts: swap Instrument Serif + Outfit for Alfa Slab One + Figtree in `src/app/layout.tsx`.
   3. Homepage per `wiki/design-system/landing-page-blueprint.html` ([[landing-page-structure]]); components, landing page first: Button, Navbar, Hero, TrustBanner, ProductCard, UpcomingEvents
      (ticket), Process/Story, Testimonials, Footer, CartDrawer; then the shop, product, events,
      fundraising, story and contact pages; admin last.
   4. Content fixes from the landing review: "From $6" pricing, free AZ shipping over $35 in the hero,
      2-column product cards on mobile, no fade-in hiding content, remove admin links from the footer,
      and remove unconfirmed claims and testimonials.
   5. Delete `public/design-system.html` and remove the old variable aliases.
   6. Check 375px and 1440px, run `npm run build`, open a PR with before/after screenshots.
5. **Then:** real flavor bag photos, a persistent store for events/fundraisers, and Shopify variants. See [[open-questions]].
