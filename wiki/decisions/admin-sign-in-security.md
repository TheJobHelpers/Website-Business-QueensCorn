---
title: "Decision: Two-step, per-person sign-in for the owner dashboard"
type: decision
owner: Manula
updated: 2026-10-26
status: in-progress
sources:
  - src/server/auth/ @ feature/admin-auth-hardening
  - src/app/actions/auth.ts @ feature/admin-auth-hardening
  - scripts/admin-account.mjs @ feature/admin-auth-hardening
---

# Decision: Two-step, per-person sign-in for the owner dashboard

## Context
The dashboard can change prices, products in Shopify and what the public site shows. Its sign-in
(2026-10-13) was one shared email + password, a 7-day signed cookie that logout could not cancel on
the server, and a guess limit kept in each server copy's memory (weak on Vercel). Live used a
plain-text password. Measured against OWASP ASVS L2 and NIST SP 800-63B, the main gaps were: no
second factor, no server-side logout, sessions too long, no shared attempt limit, no audit trail.

## Options considered
1. Authenticator-app codes (TOTP, RFC 6238) plus one-time backup codes.
2. Passkeys (WebAuthn): phishing-proof, but more setup per device, a library, and harder recovery
   for a non-technical owner.
3. Keep one shared login, or give each person their own.

## Decision
Manula, 2026-10-26: TOTP + backup codes; one login per person (`ADMIN_1_*` … `ADMIN_9_*`); sessions
of at most 12 hours with a 30-minute idle limit (NIST AAL2); a 30-day activity log of sign-ins and
changes on a new "Admins & activity" screen.

## Why
- A stolen or guessed password alone no longer opens the dashboard.
- Separate logins show who did what, and one person can be removed without changing the others.
- Accounts stay in the server settings (Vercel), not the database: a database leak cannot add an
  admin, and there is no sign-up page to attack. The cost: adding a person means running
  `scripts/admin-account.mjs` and updating Vercel.
- Sessions, attempt counters, used codes and the log are in Redis, so they are shared by every
  server copy and survive redeploys; logout really ends a session.

## Update 2026-10-26: super admins and invite links
The owner asked to manage people from the dashboard and for a clear first-time flow. Decided:
super admins stay in the server settings (cannot be locked out); other admins are added from the
dashboard with one-time invite links where they choose their own password and scan a QR code;
everyone can replace their phone, renew backup codes and change their password after confirming
with their password and a current code (re-authentication, as Google and GitHub do). Showing the
same QR code again was rejected: a signed-in browser left open would be enough to copy the second
factor. Database records are sealed (AES-256-GCM, `ADMIN_DATA_KEY`) so database access alone cannot
create or change an admin.

## Consequences
- Production needs `ADMIN_1_*`, `ADMIN_DATA_KEY` and the Redis database before this ships; the old `ADMIN_EMAIL` /
  `ADMIN_PASSWORD` stop working. See [[admin-portal]], [[open-questions]].
- Not covered by code: anyone with access to the Vercel, GitHub or Shopify accounts can change the
  login. Those accounts need their own two-step sign-in.
