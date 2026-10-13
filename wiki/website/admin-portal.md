---
title: Admin (Owner) Dashboard
type: website
owner: unassigned
updated: 2026-10-13
sources:
  - src/app/admin/ (login + (dashboard) route group) @ feature/admin-dashboard
  - src/components/admin/ @ feature/admin-dashboard
  - src/server/ (auth, store, repositories, validation) @ feature/admin-dashboard
  - src/app/actions/ @ feature/admin-dashboard
  - src/proxy.ts, next.config.ts, .env.example @ feature/admin-dashboard
---

# Admin Dashboard (`/admin`)

The owners' tool for what the website shows. Rebuilt on 2026-10-13 (branch `feature/admin-dashboard`):
it replaced a single 1,764-line page that kept most edits in the browser only.

## Screens

| Screen | Route | What it changes on the public site |
|---|---|---|
| Overview | `/admin` | Nothing: counts, the next event, and a "needs your attention" list |
| Orders | `/admin/orders` | Nothing: what still has to be made, grouped by pickup market, read live from Shopify |
| Sales | `/admin/sales` | Nothing: totals for today / 7 / 30 days, day by day, best sellers, fundraiser shares, sales per market |
| Events | `/admin/events` | `/events`, the homepage events band, the pickup lists in the shop and cart |
| Flavors | `/admin/products` | `/shop`, `/shop/[id]`, the homepage flavor row (name, price, photo, taste meter, "on homepage", "hidden"), **and the matching product in Shopify** ([[shopify-integration]]) |
| Fundraisers | `/admin/fundraisers` | `/fundraising` and the cart's fundraiser list |
| Settings | `/admin/settings` | Shows where data is saved and how sign-in is protected; Shopify test (lists flavors and sizes that cannot be ordered) and import; "restore built-in list" |

Every change on Events, Flavors and Fundraisers is saved on the server and shows for all visitors straight away. Nothing is kept in
the browser any more. See [[events-and-markets]], [[product-catalog]], [[fundraising-program]].

**Removed:** the old "Orders & AZ Shipping" screen. Its orders were hardcoded samples and its
"print label" was a mock. Orders, customers and payments live in Shopify ([[shopify-integration]]);
until a store is connected, orders arrive through the contact form.

## How the data flows

1. Built-in lists live in `src/data/` (events, products, fundraisers). They are what the site shows
   until the owners change something.
2. `src/server/repositories.ts` reads and writes the saved copies through `src/server/store`.
3. `src/app/layout.tsx` loads the three lists on the server and hands them to `CartProvider`, so
   every public page gets the same data.
4. Admin server actions (`src/app/actions/`) save, then refresh the public pages.

## Where it is saved

| Where the site runs | Store | Notes |
|---|---|---|
| Local development | JSON files in `.data/` (git-ignored) | Nothing to set up |
| Vercel with an Upstash Redis database | Redis (`KV_REST_API_URL` + `KV_REST_API_TOKEN`) | Add it under Vercel > Storage |
| Vercel with no database | Read-only | The site shows the built-in lists; saving fails with a clear message |

> [!warning] Until a Redis database is connected in Vercel, the live dashboard cannot save anything.
> The Redis path has not been exercised against a real database yet.

## Sign-in and security

- **No built-in credentials.** `ADMIN_EMAIL`, `ADMIN_PASSWORD` (or `ADMIN_PASSWORD_HASH`) and
  `ADMIN_SESSION_SECRET` must be set, or sign-in is switched off. Variable names and how to generate
  them: `.env.example` (values are never written in this wiki).
- The old default password and session secret were in the public git history and were shown on the
  login page. They are refused even if set on purpose. **Choose new ones.**
- Session: an HMAC-signed, http-only, same-site-strict cookie limited to `/admin`, valid 7 days.
- Every admin page calls `requireAdminPage()` and every admin server action goes through
  `adminAction()` → `requireAdmin()`. `src/proxy.ts` only redirects; it is not the security boundary.
- All input is validated on the server (`src/server/validation.ts`): lengths, dates, prices, and photos
  limited to files in `/public` or Shopify's image host.
- Five wrong passwords from one address lock sign-in for 15 minutes (in memory, per server instance).
- Security headers on every page (`next.config.ts`); `/admin` is `no-store` and `noindex`.
- The Shopify test/import only calls the store address from the server settings, and only a
  `*.myshopify.com` host.

## Open items

- Connect a Redis database in Vercel and set the three sign-in variables. See [[open-questions]].
- Two owners saving the same list at the same moment: the later save wins (whole-list writes).
- The lock-out counter resets on redeploy and is not shared between server instances.
- `getSiteData()` swaps a flavor's old bag photo for its new `PRODUCT_IMAGES` photo (PR #5). Any other
  photo chosen in the dashboard is shown as chosen; picking the old bag photo again is not possible
  for those ten flavors.
