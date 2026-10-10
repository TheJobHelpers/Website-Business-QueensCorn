---
title: Events & Farmers' Markets
type: business
owner: unassigned
updated: 2026-10-10
sources:
  - src/data/events.ts @ fbdbf0b
  - src/lib/shopify.ts @ fbdbf0b
---

# Events & Farmers' Markets

Markets and festivals are the core sales channel. Customers can also **pre-order online and pick
up free** at an event. See [[fulfillment-and-shipping]].

## Upcoming events listed on the site (fall 2026)

| Date | Event | Location | Hours |
|---|---|---|---|
| Oct 10 | Desert West Farmers' Market (Estrella Mountain CC) | Avondale, AZ 85392 | 9am–1pm |
| Oct 17–18 | Oro Valley Fine Art & Wine Festival | James D. Kriegh Park, Oro Valley | 10am–5pm |
| Oct 24–25 | High Street Arts Festival | Desert Ridge Marketplace, Phoenix | 10am–5pm |
| Nov 7–8 | Litchfield Park Fall Art & Wine Festival | Litchfield Park Square | 10am–4pm |
| Nov 14 | Marana Harvest & Heritage Market | Marana, AZ ("our hometown") | 9am–2pm |

All have pickup enabled. Source: `src/data/events.ts @ fbdbf0b`.

> [!warning] Unverified: these may be demo data. Confirm the real schedule with the owners.
> The Marana entry calls Marana "our hometown". Confirm. See [[open-questions]].

## How events are managed

- **Today (main branch):** fallback list in code, editable in the [[admin-portal]] but saved only in
  that browser's localStorage, so other people and devices do not see the edits.
- **Planned:** events stored as Shopify Metaobjects (type `event`, fields `month, day, year, title,
  description, time, location, pickup_available`). See [[shopify-integration]].
- **Feature branch:** a server-side JSON store (`src/data/db.json`) with server actions. See [[branches-and-status]].
