---
title: Branches & Project Status
type: website
owner: unassigned
updated: 2026-10-13
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
| `feature/admin-dashboard` → **PR #6** | Owner dashboard rebuild, server-side storage, sign-in hardening, Shopify checkout with size variants, flavors and photos written to Shopify, Orders and Sales screens, `/order/thank-you`, `/privacy-policy`, Terms rewritten for pickup, Vercel Web Analytics | Open |

Merged since the snapshot above: PR #3 (design system v3.1), PR #4 (v3.1 site redesign, pickup-only
ordering, 10-flavor catalog), PR #5 (branded product photos).

## Plan to go live (updated 2026-10-13)

**Done**
- Site redesigned in v3.1 on every public page except product detail and Terms.
- Owner dashboard: events, flavors and fundraisers saved on the server and shown to every visitor. See [[admin-portal]].
- Shopify checkout wired and tested against a development store. See [[shopify-integration]].

**1. Finish testing (developer)**
1. Done 2026-10-13: three paid test orders on the development store; the pickup market shows on each.
2. Still to confirm: "Continue shopping" on Shopify's confirmation returns to `/order/thank-you`; customer
   names on the Orders screen (the app's **Name** field is not allowed yet).
3. Switch on Local pickup in Shopify and remove shipping rates: test orders were charged $14.00 for a
   $6.00 bag. See [[fulfillment-and-shipping]].
4. Merge PR #6.

**2. Hosting (developer, with the owners' go-ahead on cost)**
1. Vercel Pro (the free plan does not allow commercial use).
2. In Vercel: `ADMIN_1_*` for each super admin from `node scripts/admin-account.mjs`, a new `ADMIN_SESSION_SECRET`,
   `ADMIN_DATA_KEY` (once; other admins are then invited from the dashboard);
   delete the old `ADMIN_EMAIL` / `ADMIN_PASSWORD`; an Upstash Redis database (required for sign-in).
3. Sign in to the live dashboard, save one test event, check it shows on `/events`, delete it.

**3. Shopify (owners first, then developer)**
1. Owners: create the store in their name, choose a plan, switch on Shopify Payments with their bank details.
2. Owners: approve the developer's collaborator request.
3. Developer: the setup checklist in [[shopify-integration]] (Headless channel, private key for the
   dashboard, "Send all flavors to Shopify", theme redirect, Local pickup, remove the store password).
4. Developer: set the two Shopify variables in Vercel; run "Test the connection" in the dashboard until it
   reports nothing to fix.
5. One real order for a small bag, then refund it.

**4. Content to settle before launch** ([[open-questions]])
- Real prices, flavor descriptions and taste levels; whether the sample fundraisers are real
- Real social links in the footer; owners (ideally a lawyer) to approve the new Privacy Policy and Terms
- Product detail page and Terms are still in the old style
- Contact form opens the visitor's email app: decide whether a real mail service is needed

**Decided 2026-10-13**
- The owners edit flavors in the dashboard; each change is written to Shopify (built and tested on the
  development store, see [[shopify-integration]]). Shopify keeps orders, payments and sales reports.
- Flavors are made to order: no stock tracking.
- Visitor numbers: Vercel Web Analytics (public pages only; `/admin` is not counted), viewed in Vercel.

**After launch**
1. Only if the owners ask: an "orders to pop" list per market with fundraiser totals (needs read access to orders).
2. Send flavor photos to Shopify; photo upload from the dashboard.
3. USPS shipping within Arizona: plan in [[fulfillment-and-shipping]], waiting on the owners' decisions.
4. Real reviews, an order cut-off before a market, a lighter hero with larger photos ([[landing-page-structure]]).
