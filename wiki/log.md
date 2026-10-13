# Wiki Log

Append-only history, **newest first**. Format and types are defined in [CLAUDE.md](CLAUDE.md).
The latest `sync` entry's `@ <hash>` is where the next code sync starts.

## 2026-10-13 | sync @ 7b5715f | Manula
- Brought the pages that were behind the code up to date with `feature/admin-dashboard` (PR #6)
- Rewrote: [[fulfillment-and-shipping]] (pickup only today, delivery options compared, USPS plan),
  [[product-catalog]] (10 flavors, a price per size, photos, Shopify), [[website-architecture]] (routes, layout, settings)
- Updated: [[fundraising-program]], [[events-and-markets]], [[company-overview]], [[landing-page-structure]]
  (hero as built; page review), [[branches-and-status]], [[admin-portal]], [[open-questions]] (1, 2, 6 reworded;
  22–26 added), index
- Still behind: [[brand-and-design-system]], [[shop-page-structure]] and the two blueprint HTML files

## 2026-10-13 | ingest | Manula
- Dashboard: new Orders screen (what to make, per pickup market) and Sales screen, read live from Shopify
  (`src/server/shopify-orders.ts`); flavor photos are uploaded to Shopify
- New `/privacy-policy` page; Terms sections 02–05 rewritten for pickup-only ordering (shipping claims removed)
- Tested on the development store with three paid test orders: the pickup market shows on each order
- Updated [[admin-portal]], [[shopify-integration]], [[open-questions]] (21 added)

## 2026-10-13 | ingest | Manula
- Each flavor now has its own Small, Family and Party price in the dashboard (`familyPrice`, `partyPrice` on a
  flavor; `sizePrice()` in `src/lib/shop.ts` is the one place prices are worked out). Flavors without them still
  scale from the Small price
- Shop cards, product page, homepage price row, cart, checkout and the Shopify product all use it
- Updated [[shopify-integration]]. Still to sync: [[product-catalog]] (prices per size)

## 2026-10-13 | ingest | Manula
- Flavors screen now writes to Shopify (`src/server/shopify-admin.ts`): add, rename, reprice, hide, delete,
  and "Send all flavors to Shopify" in Settings. Replaces this morning's decision to keep products out of the dashboard
- Tested on the development store: all ten flavors created or linked, 0 mismatches
- Updated [[shopify-integration]], [[admin-portal]], [[branches-and-status]], [[open-questions]] (20 added)

## 2026-10-13 | ingest | Manula
- Dashboard stays lean: events and fundraisers only; products, orders and sales reports are handled in Shopify.
  Flavors are made to order, so no stock tracking
- Vercel Web Analytics added for visitor numbers (`src/components/SiteAnalytics.tsx`, `/admin` excluded)
- Updated [[branches-and-status]] (decision and post-launch order of work)

## 2026-10-13 | ingest | Manula
- Shopify checkout rebuilt on `feature/admin-dashboard` (PR #6): runs on the server, matches flavor name +
  `Size` to the Shopify variant, refuses missing / sold-out / differently priced bags with a message in the cart
- Dashboard "Test the connection" now lists what cannot be ordered; new `/order/thank-you` page; `src/lib/shopify.ts` removed
- Tested against a development store (`the-queens-popcorn.myshopify.com`); a completed payment is not confirmed yet
- Rewrote [[shopify-integration]]; updated [[branches-and-status]] (plan to go live), [[open-questions]]
  (8 and 9 resolved; 16–19 added), [[admin-portal]]

## 2026-10-13 | ingest | Manula
- Admin dashboard rebuilt on `feature/admin-dashboard`: five screens under `/admin`, server-side storage
  (`src/server/`), events / flavors / fundraisers now drive the public pages for every visitor
- Security: built-in credentials and the demo login removed, every save checked on the server, input
  validation, lock-out after wrong passwords, security headers
- Rewrote [[admin-portal]]. Still to sync: [[website-architecture]], [[branches-and-status]], [[open-questions]]
  (connect a Redis database in Vercel; set new sign-in variables)

## 2026-10-12 | restructure | Manula
- Motion tokens added to `design-system/tokens.css` (`--dur-slow`, `--stagger`), mirrored in `src/app/globals.css`
- Code on `feature/landing-page-v3` moved ahead of the wiki pages; **these pages now need a sync**:
  - Hero: back to the original centered hero ("The Queen's Corn is a Happy Place", flavor chips, two buttons)
    in v3.1 tokens, with three real photos that crossfade. [[landing-page-structure]] and the homepage
    blueprint still describe the two-column food hero.
  - Shipping is "coming soon" (`SHIPPING_AVAILABLE` in `src/lib/shop.ts`); orders are market pickup only.
    [[fulfillment-and-shipping]], [[company-overview]] and the shop blueprint still describe shipping.
  - Catalog is now 10 flavors (owners' list): Holiday Mix removed, Jalapeño → Cheddar with Smoked Jalapeño,
    new Cinnamon Apple, Nacho Cheddar, BBQ Cheddar (borrowed photos). [[product-catalog]] lists the old 8.
  - Shop page built from the blueprint (pickup-only header); Events, Fundraising, Our Story, Contact and the
    footer rebuilt in v3.1. [[branches-and-status]] and [[website-architecture]] are out of date.
  - Nav label "Markets" → "Events". Contact form now opens the visitor's email app (it never sent anything).
- Open questions to add on sync: real social links, whether the sample fundraisers are real, descriptions and
  taste levels of the new flavors, a real mail backend for the contact form, Terms of Service shipping text

## 2026-10-10 | ingest | Manula
- Shop design revised after feedback ("top part is mostly empty"): delivery choice moved into a compact
  header band (247px desktop, 313px phone, was ~450px / 628px); helper cards fixed on phones
- Created [[shop-page-structure]]; refreshed [[branches-and-status]] (open PRs, done / next plan),
  [[landing-page-structure]] (built), [[website-architecture]] (new components), [[product-catalog]]
  (taste values, from-$6 cards), [[open-questions]] (#12 updated, #14 taste levels, #15 real reviews), index

## 2026-10-10 | ingest | Manula
- Created `design-system/shop-page-blueprint.html` (shop plan v1): "how do you want it" first, taste chips with
  counts, size + quantity on every card, bag bar with free-shipping progress, three helpers

## 2026-10-10 | restructure | Manula
- Responsive tokens added (`--container`, `--gutter`, `--section-space`, `--hero-min-h`, `--hero-visual`,
  `--root-size`, height-aware `--text-hero`); homepage checked at 360 → 3440px wide
- Homepage built in v3.1 on `feature/landing-page-v3` (all 9 blueprint sections)
- Hero made appetizing: food visual added (real caramel & cheddar close-up on a warm glow, Reina snapshot,
  "Hand-popped in Arizona" sticker, one-tap "+ Add" card); blueprint section 1 updated to match

## 2026-10-10 | restructure | Manula
- Design direction changed to **v3.1 "Warm Canopy"** after reviewing the built v3.0 homepage ("too different")
- Rewrote `design-system/tokens.css`, `components.css`, `design-system.html`; updated `landing-page-blueprint.html` (v1.1)
- Updated: [[design-palette-decision]], [[brand-and-design-system]], index
- Follow-up: deeper espresso-tinted shadows; hero brought back to a real photo under today's dark espresso-brown
  shade (`--scrim`), cream headline with yellow italic, dark glass pop-up pill
- Balanced the page rhythm: light trust strip floating over the hero, markets on a dark espresso band
  (dark at top, middle, bottom; never two dark blocks touching)
- Code on `feature/landing-page-v3` still uses v3.0 styles; to be moved to v3.1 after sign-off

## 2026-10-10 | ingest | Manula
- Created `design-system/landing-page-blueprint.html` (homepage plan v1) and [[landing-page-structure]]
- Split component CSS into `design-system/components.css`; trust strip spec now matches `TrustBanner.tsx`
- Redesigned `src/components/TrustBanner.tsx` (label + figure + proof; "$34,000" removed until confirmed)
- Open questions added: 1 (trust claims)

## 2026-10-10 | sync @ ee5b44c | Manula
- PR #1 (Buttercream palette, real photos, terms, admin login, server-side events) and PR #2 (wiki) merged to `main`
- Updated: [[branches-and-status]] (new rollout plan), [[admin-portal]], [[events-and-markets]],
  [[shopify-integration]], [[website-architecture]], [[product-catalog]], [[company-overview]],
  [[brand-and-design-system]], [[design-palette-decision]], [[open-questions]]
- Design system now loads photos from `public/` (they're on `main`); migration map targets `main`

## 2026-10-10 | restructure | Manula
- Created the design system v3 "Canopy": `design-system/tokens.css`, `design-system/design-system.html`,
  (photos referenced from `public/`)
- Based on a landing-page review and on colors sampled from the logo, canopy and trailer photos
- Updated: [[design-palette-decision]], [[brand-and-design-system]], [[open-questions]], index, schema
- Root `AGENTS.md` and `CLAUDE.md` now require every UI change to follow the design system
- Open questions added: 2

## 2026-10-10 | init + sync @ fbdbf0b | Manula
- Created wiki structure, schema (`CLAUDE.md`), README, templates, and the `raw/` folders
- Initial ingest from the codebase on `main` @ `fbdbf0b`, plus a read-only review of
  `origin/feature/landing-page-polish-and-real-photos` @ `a6ec144`
- Created: [[company-overview]], [[product-catalog]], [[fundraising-program]], [[events-and-markets]],
  [[fulfillment-and-shipping]], [[website-architecture]], [[shopify-integration]], [[admin-portal]],
  [[brand-and-design-system]], [[branches-and-status]], [[design-palette-decision]], [[open-questions]]
- Open questions added: 10
