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

## Open branches & PRs

| Branch | What | State |
|---|---|---|
| `docs/design-system-v3` → **PR #3** | Design system v3.1 "Warm Canopy" (`wiki/design-system/`), homepage blueprint, wiki sync, design rules in `AGENTS.md`/`CLAUDE.md` | Open. Docs only: no code changes vs `main` |
| `feature/landing-page-v3` | **New homepage built** in v3.1 + responsive layout + shop blueprint | Pushed, no PR yet. Builds and lints clean (2 lint errors already on `main`, untouched) |

## Plan (updated 2026-10-10)

Design direction: **v3.1 "Warm Canopy"** ([[design-palette-decision]]): today's cream, Instrument Serif
and Outfit, with the brand's red and canopy yellow as accents and the espresso-brown hero shade.

**Done**
- Design system v3.1 + homepage blueprint (PR #3).
- Homepage rebuilt per the blueprint ([[landing-page-structure]]): food hero, floating trust strip, three
  ways to buy, flavors with sizes up front, dark markets band, fundraising slider, one story section,
  reviews hidden until real, questions band, admin links removed from the footer.
- Responsive from 360px phones to 3440px monitors: hero fills the screen, sizes follow width *and* height,
  orphan-free grids.
- Shop page designed ([[shop-page-structure]]), compact header revision.

**Next**
1. **Urgent, separate from design:** set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` in Vercel
   (hardcoded fallbacks are live). See [[admin-portal]].
2. Owner sign-off on v3.1, the homepage and the shop design; collect real bag photos and 3 real reviews.
3. Build the shop page per `wiki/design-system/shop-page-blueprint.html`.
4. Open a PR for `feature/landing-page-v3` with before/after screenshots; merge PR #3 first.
5. Then migrate the remaining pages (product, events, fundraising, story, contact, admin last) to v3.1 tokens;
   delete `public/design-system.html`; remove the old Buttercream variables from `globals.css`.
6. Later: Shopify checkout with size variants, persistent store for events/fundraisers. See [[open-questions]].
