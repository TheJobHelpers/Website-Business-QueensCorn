---
title: Admin (Owner) Dashboard
type: website
owner: unassigned
updated: 2026-10-26
sources:
  - src/app/admin/ (login + (dashboard) route group) @ feature/admin-dashboard
  - src/components/admin/ @ feature/admin-dashboard
  - src/server/ (store, repositories, validation) @ feature/admin-dashboard
  - src/server/auth/, src/app/actions/auth.ts, scripts/admin-account.mjs @ feature/admin-auth-hardening
  - src/app/admin/(dashboard)/admins/ @ feature/admin-auth-hardening
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
| Admins & activity | `/admin/admins` | Nothing: who can sign in (role, last sign-in, devices signed in now, phone set up, backup codes left); super admins add, reset and remove admins here; a 30-day log of every sign-in, failed try and change, day by day |
| Set up (invite link) | `/admin/setup?token=…` | Nothing: an invited admin chooses a password, scans the QR code and gets their backup codes. Open without signing in; the link is the permission |
| Settings | `/admin/settings` | Shows where data is saved and how sign-in is protected ("Sign out on every device"); Shopify test (lists flavors and sizes that cannot be ordered) and import; "restore built-in list" |

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

Rebuilt 2026-10-26 to meet OWASP ASVS L2 / NIST SP 800-63B AAL2. Why: [[admin-sign-in-security]].

- **Two roles.** *Super admins* are defined in the server settings: `ADMIN_<n>_EMAIL`, `_PASSWORD_HASH`,
  `_TOTP_SECRET`, `_BACKUP_CODES` (n = 1–9), made with `node scripts/admin-account.mjs`. They cannot be
  removed or locked out from the dashboard. *Admins* are added by a super admin on Admins & activity:
  each gets a one-time **invite link** (48 h, newest link only) to choose their own password, scan the
  QR code and get 10 backup codes. Super admins can also make a new link, **reset** someone (signed out
  at once, old password/phone/codes stop working, new link) or **remove** them (signed out at once).
  Admins can use the dashboard but not manage people.
- Admins added from the dashboard live in Redis, **sealed with AES-256-GCM** using `ADMIN_DATA_KEY`
  (server settings only): encrypted and tamper-proof, so database access alone cannot add an admin,
  raise a role or swap in a password or backup codes. Without the key, people cannot be managed here.
- **Sign-in** asks for email, password **and** the 6-digit code from an authenticator app (or a
  one-time backup code), all checked together with one error message. A super admin made with the
  script sees their QR code once, at their first sign-in (code left empty).
- **Settings > Your sign-in** (everyone): replace my phone, new backup codes, change password. Each
  first asks for the password and a current code. Changing the password signs out other devices.
- Passwords are stored only as scrypt hashes (N=2^17, r=8, p=1); plain-text passwords are no longer
  accepted. The old `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_PASSWORD_HASH` are ignored (Settings
  lists them to delete). The old public session secret is still refused.
- Each code works once (used TOTP steps and backup codes are remembered in Redis).
- **Sessions live on the server** (Redis, only a hash of the id). The cookie (http-only, same-site
  strict, `/admin` only) carries a random id + HMAC. Signed out after 30 minutes idle and always after
  12 hours; logout ends the session on the server; "Sign out on every device" ends all of a person's.
- Sign-in needs the Redis database: on Vercel without it, sign-in is switched off (locally it falls
  back to memory).
- Every admin page calls `requireAdminPage()` and every admin server action goes through
  `adminAction()` → `requireAdmin()`. `src/proxy.ts` only redirects; it is not the security boundary.
- All input is validated on the server (`src/server/validation.ts`): lengths, dates, prices, and photos
  limited to files in `/public` or Shopify's image host.
- Failed tries are counted in Redis: 5 from one address, or 10 for one account from anywhere, pause
  sign-in for 15 minutes.
- Activity log (Redis, 30 days, max 5,000 entries): sign-ins, failed tries, sign-outs, and every
  change saved through `adminAction()` with who made it (e.g. `Changed flavor "Caramel"`).
- Security headers on every page (`next.config.ts`); `/admin` is `no-store` and `noindex`.
- The Shopify test/import only calls the store address from the server settings, and only a
  `*.myshopify.com` host.

## Open items

- Set `ADMIN_1_*` (and `ADMIN_SESSION_SECRET`) in Vercel before deploying this: the old single login stops working. See [[open-questions]].
- Two owners saving the same list at the same moment: the later save wins (whole-list writes).
- `getSiteData()` swaps a flavor's old bag photo for its new `PRODUCT_IMAGES` photo (PR #5). Any other
  photo chosen in the dashboard is shown as chosen; picking the old bag photo again is not possible
  for those ten flavors.
