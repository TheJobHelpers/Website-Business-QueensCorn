---
title: Admin (Owner) Portal
type: website
owner: unassigned
updated: 2026-10-10
sources:
  - src/app/admin/page.tsx @ ee5b44c
  - src/app/admin/login/page.tsx @ ee5b44c
  - src/lib/auth.ts @ ee5b44c
  - src/proxy.ts @ ee5b44c
  - src/lib/db.ts @ ee5b44c
  - src/context/CartContext.tsx @ ee5b44c
---

# Admin Portal (`/admin`)

An owner dashboard for Bob & Reina with these sections: **Overview, Orders & AZ Shipping, Events,
Fundraisers, Products, Settings** (Shopify & shipping-carrier setup). Live on `main` since PR #1.

## Login

- Real login at `/admin/login`. Credentials come from the `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars,
  and the session is an HMAC-signed cookie `qc_admin_session` (secret: `ADMIN_SESSION_SECRET`).
- `src/proxy.ts` (Next 16's replacement for `middleware.ts`) redirects every `/admin` route to the
  login page when there's no valid session. Logout uses `logoutAction`.

## What it can do

| Area | Saved where | Visible to others? |
|---|---|---|
| **Events**: add, delete, toggle pickup | Server: `src/data/db.json` via `src/app/actions/events.ts` (+ localStorage cache) | Yes, but see the warning below |
| **Fundraisers**: add, update raised amount, delete | Browser localStorage only | No |
| **Products**: edit base price (scales all sizes), sync catalog from Shopify | Browser localStorage only | No |
| **Orders** | Hardcoded sample orders; "print label" is a mock | n/a |
| **Settings**: test Shopify connection / checkout | `src/app/actions/shopify.ts` | n/a |

See [[events-and-markets]], [[fundraising-program]], [[product-catalog]], [[fulfillment-and-shipping]].

> [!warning] Risks now that this is live on `main`:
> - `src/lib/auth.ts` falls back to **hardcoded default credentials and a hardcoded session secret**
>   when the env vars aren't set. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in
>   Vercel now (values not repeated here; see the rules in `wiki/CLAUDE.md`).
> - Writing to `src/data/db.json` won't persist on Vercel (read-only, ephemeral filesystem), so event
>   edits will be lost. This needs a real store (Shopify Metaobjects, a database, or Vercel KV/Blob).
> - The public footer links to the admin portal twice.
> See [[open-questions]].
