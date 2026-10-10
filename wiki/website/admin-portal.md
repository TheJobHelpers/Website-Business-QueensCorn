---
title: Admin (Owner) Portal
type: website
owner: unassigned
updated: 2026-10-10
sources:
  - src/app/admin/page.tsx @ fbdbf0b
  - src/context/CartContext.tsx @ fbdbf0b
  - origin/feature/landing-page-polish-and-real-photos @ a6ec144 (src/lib/auth.ts, src/proxy.ts, src/lib/db.ts)
---

# Admin Portal (`/admin`)

An owner dashboard for Bob & Reina with these sections: **Overview, Orders & AZ Shipping, Events,
Fundraisers, Products, Settings** (Shopify & shipping-carrier setup).

## What it can do (main @ fbdbf0b)

- **Events:** add, delete, toggle pickup. See [[events-and-markets]]
- **Fundraisers:** add, update the raised amount, delete. See [[fundraising-program]]
- **Products:** edit the base price, which scales all sizes. See [[product-catalog]]
- **Orders:** shows **hardcoded sample orders**, with mock "print label" / status changes. See [[fulfillment-and-shipping]]
- **Reset store data**

## ⚠️ Important limitations on `main`

1. **No real login.** The login form accepts *any* non-empty email and password; it is client-side
   only. Anyone can open `/admin`.
2. **Edits are saved only in the browser's localStorage** (`queens_corn_*_v1` keys). They are not
   visible to customers or other devices. They are **demo-only**.
3. Default credentials are prefilled in the source code (not repeated here; see the rules in `wiki/CLAUDE.md`).

## Feature branch improvements (`feature/landing-page-polish-and-real-photos`)

- Real login at `/admin/login`: credentials from `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars,
  an HMAC-signed session cookie `qc_admin_session` (secret: `ADMIN_SESSION_SECRET`), and route
  protection in `src/proxy.ts`.
- Events persisted server-side in `src/data/db.json` via server actions.

> [!warning] Feature-branch risks:
> - `src/lib/auth.ts` has **fallback default credentials and a fallback session secret hardcoded**
>   if the env vars aren't set. These must be set in Vercel before going live.
> - Writing to `src/data/db.json` won't persist on Vercel (read-only, ephemeral filesystem). It needs a
>   real store (Shopify Metaobjects, a database, or Vercel KV/Blob).
> See [[open-questions]].
