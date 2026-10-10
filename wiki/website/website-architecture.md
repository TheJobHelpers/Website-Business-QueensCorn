---
title: Website Architecture
type: website
owner: unassigned
updated: 2026-10-10
sources:
  - package.json @ ee5b44c
  - AGENTS.md @ ee5b44c
  - src/app/layout.tsx @ ee5b44c
  - src/context/CartContext.tsx @ ee5b44c
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
> versions. Agents must read `node_modules/next/dist/docs/` before writing code. For example, admin
> route protection lives in `src/proxy.ts` (Next 16's replacement for `middleware.ts`).

> [!note] Any UI change must follow the design system in `wiki/design-system/`. See [[brand-and-design-system]].

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
| `/terms-of-service` | src/app/terms-of-service/page.tsx | Terms, privacy, shipping and returns, mirroring thequeenscorn.com. `/terms`, `/terms-and-conditions` and `/privacy-policy` redirect here (`next.config.ts`) |
| `/admin/login` | src/app/admin/login/page.tsx | Owner login. See [[admin-portal]] |
| `/admin` | src/app/admin/page.tsx | Owner portal, protected by `src/proxy.ts`. See [[admin-portal]] |
| `/design-system.html` | public/design-system.html | Old v2 spec, **publicly served**. To be deleted (replaced by `wiki/design-system/`) |

## Key code

- `src/context/CartContext.tsx`: a single global React context for the cart, drawer, fulfillment
  choice, fundraiser choice, **and** the admin store data (products/events/fundraisers).
- `src/components/cart/CartDrawer.tsx`: slide-out cart with the free-shipping progress bar and checkout.
- `src/lib/shopify.ts`: Shopify client and fallbacks.
- `src/data/*.ts`: local fallback data for products, events and fundraisers; `src/data/db.json` is the events store.
- `src/app/actions/`: server actions for auth, events and Shopify.
- `public/`: images. Real photos are the `.jpg`/`.webp` files (e.g. `bob-reina.webp`, `reina-stirring-kettle.jpg`);
  many `.png` images are AI-generated (list in the design system, section 07). `assests/` (sic) holds original brand files.

## Branches

See [[branches-and-status]].
