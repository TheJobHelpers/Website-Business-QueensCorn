---
title: Events & Farmers' Markets
type: business
owner: unassigned
updated: 2026-10-13
sources:
  - src/data/events.ts @ ee5b44c
  - src/app/actions/events.ts @ 7b5715f
  - src/lib/events.ts @ 7b5715f
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

- The owners add, edit and delete events in the dashboard ([[admin-portal]]), and switch pre-order
  pickup on or off per event ("Walk-up sales only" when off).
- Changes are saved on the server (Redis on Vercel, files locally) and show for every visitor straight
  away, on `/events`, the homepage band and the cart's pickup list. Finished events drop off the public
  pages by date.
- The list above is the built-in fallback the site shows until the owners change something.
- Orders are grouped by event on the dashboard's Orders screen. See [[fulfillment-and-shipping]].
