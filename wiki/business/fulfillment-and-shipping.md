---
title: Fulfillment — Shipping & Market Pickup
type: business
owner: unassigned
updated: 2026-10-10
sources:
  - src/context/CartContext.tsx @ ee5b44c
  - src/lib/shopify.ts @ ee5b44c
  - src/components/cart/CartDrawer.tsx @ ee5b44c
  - src/app/admin/page.tsx @ ee5b44c
---

# Fulfillment: Shipping & Market Pickup

Customers choose one of two methods in the cart:

| Method | Details |
|---|---|
| **Arizona / USPS shipping** | Admin sample orders use "USPS Ground Advantage (AZ)". **Free over $35** subtotal. |
| **Free farmers' market pickup** | Customer picks an upcoming event. See [[events-and-markets]]. |

At Shopify checkout this is recorded as cart attributes: `Fulfillment_Method` and, for pickup,
`Pickup_Market_Event`. See [[shopify-integration]].

## When Shopify isn't configured

Checkout falls back to sending the customer to `/contact?subject=…` (with the fundraiser code if
chosen), so the order is taken manually by email. This is the **current behavior** until Shopify
keys are added.

## Order handling (admin portal mock-up)

Order statuses in the admin UI: `Unfulfilled` → `Label Printed` / `Ready for Pickup`. The orders
shown are **hardcoded samples**; label printing isn't connected to a carrier yet. See [[admin-portal]].

> [!warning] Open: is shipping only within Arizona? The wording suggests yes. Confirm. See [[open-questions]].
