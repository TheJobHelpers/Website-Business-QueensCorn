---
title: Website Architecture
type: website
owner: unassigned
updated: 2026-10-13
sources:
  - package.json @ 7b5715f
  - AGENTS.md @ 7b5715f
  - src/app/layout.tsx @ 7b5715f
  - src/server/ @ 7b5715f
  - next.config.ts @ 7b5715f
---

# Website Architecture

Repo: https://github.com/TheJobHelpers/Website-Business-QueensCorn

## Stack

- **Next.js 16.2.4** (App Router, `src/` directory), **React 19**, TypeScript, ESLint 9
- Styling: plain **CSS Modules** + global CSS variables (no Tailwind). See [[brand-and-design-system]]
- Icons: `lucide-react`. Fonts: Outfit + Instrument Serif via `next/font/google`
- Hosting: Vercel. Visitor numbers: Vercel Web Analytics (`src/components/SiteAnalytics.tsx`, `/admin` not counted)
- Saved data: Upstash Redis on Vercel, JSON files in `.data/` locally. See [[admin-portal]]
- Commerce: Shopify (checkout, orders, products). See [[shopify-integration]]

> [!warning] `AGENTS.md`: this Next.js version has breaking changes. Read `node_modules/next/dist/docs/`
> before writing code. Route protection lives in `src/proxy.ts` (Next 16's replacement for `middleware.ts`).

> [!note] Any UI change must follow the design system in `wiki/design-system/`. See [[brand-and-design-system]].

## Commands

`npm run dev` · `npm run build` · `npm run start` · `npm run lint` · `node scripts/hash-password.mjs`

## Routes

| Route | Purpose |
|---|---|
| `/` | Homepage: Hero, TrustBanner, WaysToBuy, FeaturedProducts, UpcomingEvents, FundraisingBand, Story, QuestionsBand. See [[landing-page-structure]] |
| `/shop` | Catalog with taste filters; size and quantity on every card. See [[product-catalog]], [[shop-page-structure]] |
| `/shop/[id]` | Product page (old style); 404 for unknown or hidden flavors |
| `/events` | Upcoming events with pre-order. See [[events-and-markets]] |
| `/fundraising` | 50% giveback program. See [[fundraising-program]] |
| `/story` | Meet Bob & Reina. See [[company-overview]] |
| `/contact` | Contact form (opens the visitor's email app); the order fallback when Shopify is not connected |
| `/order/thank-you` | Where shoppers land when they come back from Shopify's order confirmation |
| `/privacy-policy` | What is collected, who handles it (`/privacy` redirects here) |
| `/terms-of-service` | Terms (`/terms`, `/terms-and-conditions` redirect here) |
| `/admin/login`, `/admin/*` | Owner dashboard: Overview, Orders, Sales, Events, Flavors, Fundraisers, Settings. See [[admin-portal]] |

## How the code is laid out

- `src/server/` (server only):
  - `auth/` sign-in, session cookie, lock-out, guards
  - `store/` where saved data lives (Redis / files / read-only)
  - `repositories.ts` events, flavors, fundraisers; `getSiteData()` for the public pages
  - `validation.ts` every dashboard input
  - `shopify.ts` reads (Storefront API), `shopify-admin.ts` writes products and photos (Admin API),
    `shopify-orders.ts` reads orders for the Orders and Sales screens
- `src/app/actions/`: server actions. `auth`, `events`, `products`, `fundraisers`, `settings` go through
  `adminAction()` (session checked first); `checkout.ts` is public and re-checks everything it is sent.
- `src/app/layout.tsx` loads the three lists once and hands them to `CartProvider`
  (`src/context/CartContext.tsx`), which holds the shopper's bag. Nothing is kept in the browser.
- `src/lib/`: `shop.ts` (bag sizes, `sizePrice()`, `SHIPPING_AVAILABLE`), `events.ts`, `action-result.ts`.
- `src/data/*.ts`: the built-in lists the site shows until the owners change something.
- `src/components/admin/`: the dashboard screens and shared form parts.
- `next.config.ts`: security headers on every page, `/admin` never cached or indexed, redirects.
- `public/`: images. `product-*.webp` are the bag photos; real photos of the owners and trailer are
  `.jpg` / `.webp`; many older `.png` images are AI-generated.

## Settings the site needs

Names only; values are never written here. See `.env.example`.

| Group | Variables |
|---|---|
| Dashboard sign-in | `ADMIN_EMAIL`, `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET` |
| Saved data | `KV_REST_API_URL`, `KV_REST_API_TOKEN` (Upstash Redis) |
| Shopify checkout | `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`, `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` |
| Shopify dashboard key | `SHOPIFY_ADMIN_ACCESS_TOKEN`, or `SHOPIFY_ADMIN_CLIENT_ID` + `SHOPIFY_ADMIN_CLIENT_SECRET` |

## Branches

See [[branches-and-status]].
