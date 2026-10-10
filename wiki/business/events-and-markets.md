---
title: Events & Farmers' Markets
type: business
owner: unassigned
updated: 2026-10-10
sources:
  - src/data/events.ts @ ee5b44c
  - src/lib/shopify.ts @ ee5b44c
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

All have pickup enabled. Source: `src/data/events.ts @ ee5b44c`.

> [!warning] Unverified: these may be demo data. Confirm the real schedule with the owners.
> The Marana entry calls Marana "our hometown". Confirm. See [[open-questions]].

## How events are managed

- **Today (`main` @ ee5b44c):** the owners edit events in the [[admin-portal]]. Edits are saved to a
  server-side JSON file (`src/data/db.json`) through server actions in `src/app/actions/events.ts`,
  with the code list above as the fallback. The homepage shows them in the `UpcomingEvents` section.
- **Problem:** on Vercel that file can't be written permanently, so edits will be lost. See [[open-questions]].
- **Planned:** events stored as Shopify Metaobjects (type `event`, fields `month, day, year, title,
  description, time, location, pickup_available`). See [[shopify-integration]].
