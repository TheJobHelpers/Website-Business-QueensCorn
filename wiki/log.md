# Wiki Log

Append-only history, **newest first**. Format and types are defined in [CLAUDE.md](CLAUDE.md).
The latest `sync` entry's `@ <hash>` is where the next code sync starts.

## 2026-10-10 | restructure | Manula (with Claude)
- Design direction changed to **v3.1 "Warm Canopy"** after reviewing the built v3.0 homepage ("too different")
- Rewrote `design-system/tokens.css`, `components.css`, `design-system.html`; updated `landing-page-blueprint.html` (v1.1)
- Updated: [[design-palette-decision]], [[brand-and-design-system]], index
- Follow-up: deeper espresso-tinted shadows; hero brought back to a real photo under today's dark espresso-brown
  shade (`--scrim`), cream headline with yellow italic, dark glass pop-up pill
- Balanced the page rhythm: light trust strip floating over the hero, markets on a dark espresso band
  (dark at top, middle, bottom; never two dark blocks touching)
- Code on `feature/landing-page-v3` still uses v3.0 styles; to be moved to v3.1 after sign-off

## 2026-10-10 | ingest | Manula (with Claude)
- Created `design-system/landing-page-blueprint.html` (homepage plan v1) and [[landing-page-structure]]
- Split component CSS into `design-system/components.css`; trust strip spec now matches `TrustBanner.tsx`
- Redesigned `src/components/TrustBanner.tsx` (label + figure + proof; "$34,000" removed until confirmed)
- Open questions added: 1 (trust claims)

## 2026-10-10 | sync @ ee5b44c | Manula (with Claude)
- PR #1 (Buttercream palette, real photos, terms, admin login, server-side events) and PR #2 (wiki) merged to `main`
- Updated: [[branches-and-status]] (new rollout plan), [[admin-portal]], [[events-and-markets]],
  [[shopify-integration]], [[website-architecture]], [[product-catalog]], [[company-overview]],
  [[brand-and-design-system]], [[design-palette-decision]], [[open-questions]]
- Design system now loads photos from `public/` (they're on `main`); migration map targets `main`

## 2026-10-10 | restructure | Manula (with Claude)
- Created the design system v3 "Canopy": `design-system/tokens.css`, `design-system/design-system.html`,
  (photos referenced from `public/`)
- Based on a landing-page review and on colors sampled from the logo, canopy and trailer photos
- Updated: [[design-palette-decision]], [[brand-and-design-system]], [[open-questions]], index, schema
- Root `AGENTS.md` and `CLAUDE.md` now require every UI change to follow the design system
- Open questions added: 2

## 2026-10-10 | init + sync @ fbdbf0b | Manula (with Claude)
- Created wiki structure, schema (`CLAUDE.md`), README, templates, and the `raw/` folders
- Initial ingest from the codebase on `main` @ `fbdbf0b`, plus a read-only review of
  `origin/feature/landing-page-polish-and-real-photos` @ `a6ec144`
- Created: [[company-overview]], [[product-catalog]], [[fundraising-program]], [[events-and-markets]],
  [[fulfillment-and-shipping]], [[website-architecture]], [[shopify-integration]], [[admin-portal]],
  [[brand-and-design-system]], [[branches-and-status]], [[design-palette-decision]], [[open-questions]]
- Open questions added: 10
