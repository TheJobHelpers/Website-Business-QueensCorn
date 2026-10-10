---
title: Website Architecture
type: website
owner: unassigned
updated: 2026-10-10
sources:
  - package.json @ fbdbf0b
  - AGENTS.md @ fbdbf0b
  - src/app/layout.tsx @ fbdbf0b
  - src/context/CartContext.tsx @ fbdbf0b
---

# Website Architecture

Repo: https://github.com/TheJobHelpers/Website-Business-QueensCorn

## Stack

- **Next.js 16.2.4** (App Router, `src/` directory), **React 19.2.4**, TypeScript, ESLint 9
- Styling: plain **CSS Modules** + global CSS variables (no Tailwind). See [[brand-and-design-system]]
- Icons: `lucide-react`. Fonts: Outfit (sans) + Instrument Serif (headings) via `next/font/google`
- Hosting: Vercel (`https://the-queens-corn.vercel.app`)
- Commerce: Shopify Storefront API, optional with local fallback. See [[shopify-integration]]

> [!warning] `AGENTS.md` warns that this Next.js version has breaking changes compared with older
> versions. Agents must read `node_modules/next/dist/docs/` before writing code. For example, the
> feature branch uses `src/proxy.ts` (Next 16's replacement for `middleware.ts`).

## Commands

`npm run dev` (localhost:3000) · `npm run build` · `npm run start` · `npm run lint`

## Routes

| Route | File | Purpose |
|---|---|---|
| `/` | src/app/page.tsx | Homepage: Hero, Process, Story, FeaturedProducts, TrustBanner, Testimonials… |
| `/shop` | src/app/shop/page.tsx | Catalog with category filter. See [[product-catalog]] |
| `/shop/[id]` | src/app/shop/[id]/page.tsx | Product detail + size/qty (`ProductActions.tsx`) |
| `/story` | src/app/story/page.tsx | "Meet Bob & Reina". See [[company-overview]] |
| `/events` | src/app/events/page.tsx | Market calendar. See [[events-and-markets]] |
| `/fundraising` | src/app/fundraising/page.tsx | 50% giveback program + calculator. See [[fundraising-program]] |
| `/contact` | src/app/contact/page.tsx | Contact form; also the manual-order fallback |
| `/admin` | src/app/admin/page.tsx | Owner portal. See [[admin-portal]] |

## Key code

- `src/context/CartContext.tsx`: a single global React context for the cart, drawer, fulfillment
  choice, fundraiser choice, **and** the admin store data (products/events/fundraisers).
- `src/components/cart/CartDrawer.tsx`: slide-out cart with the free-shipping progress bar and checkout.
- `src/lib/shopify.ts`: Shopify client and fallbacks.
- `src/data/*.ts`: local fallback data for products, events and fundraisers.
- `public/`: images (`*-real.png` = real photography). `assests/` (sic) holds original brand files.

## Branches

See [[branches-and-status]].
