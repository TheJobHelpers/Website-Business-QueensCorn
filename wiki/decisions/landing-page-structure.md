---
title: "Decision: Landing page structure"
type: decision
owner: unassigned
updated: 2026-10-13
status: built and merged (PR #4), awaiting owner sign-off
sources:
  - wiki/design-system/landing-page-blueprint.html (v1)
  - src/app/page.tsx @ ee5b44c
---

# Decision: Landing page structure

## Context
The homepage (`src/app/page.tsx` @ ee5b44c) leads with an emotional slogan ("The Queen's Corn is a
Happy Place"), tells the founders' story twice, and hides the three ways to buy (shipping, market
pickup, group orders) in the cart drawer and other pages. A visitor can't tell in five seconds what
is sold, how to get it, or when the next market is.

## Decision
Rebuild `/` around one goal, **selling popcorn**, in this order:
1. Hero: "Hand-popped kettle corn, fit for royalty." + how to get it + the **next market** ticket
2. Trust strip (done)
3. **Three ways to get your corn** (new): shipped · market pickup · for your school or event
4. Flavors: 4 cards, sizes $6/$10/$15 shown up front, 2 per row on phones
5. Where to find us: next 3 markets as tickets with pre-order
6. Fundraising: "Your team keeps 50%", with a worked $500 example
7. Meet Bob & Reina: one section (merges 4) + a 3-photo process strip
8. Reviews: real ones only, else hidden
9. Questions (phone + message) + footer without admin links

Actions in priority order: online order → market visit → group order.
Full mockups, final copy, data sources, mobile rules and "done when" checks:
[landing-page-blueprint.html](../design-system/landing-page-blueprint.html).

## Why
- Each section answers one visitor question and ends in one action.
- The three ways to buy are the real selling points and were invisible on the homepage.
- The next-market ticket turns the business's strongest channel (markets) into a homepage hook.

## Consequences
- Removed from home: hero flavor pills, "scroll to explore", text marquee, three process sections,
  duplicate story, invented testimonials, unconfirmed claims, fade-in hiding content.
- **Blocker:** online checkout needs Shopify connected; until then orders fall back to the contact form.
- Build order in the blueprint's "Build plan"; depends on owner sign-off of v3 ([[design-palette-decision]]).
- Open items tracked in [[open-questions]].

## Status (2026-10-10)
Built on `feature/landing-page-v3` in design system v3.1. Changes made while building:
- Hero made appetizing: a round close-up of real caramel & cheddar kettle corn on a warm glow, a snapshot
  of Reina at the kettle, a "Hand-popped in Arizona" sticker and a one-tap "+ Add" card, on today's
  espresso-brown shade.
- Trust strip floats over the hero's edge; markets sit on a dark band (balanced rhythm).
- Responsive: hero fills the screen at any size; headline and food plate scale with width and height.

## Status (2026-10-13)
Merged in PR #4, with two changes to the plan above:
- **Hero:** back to the centered "The Queen's Corn is a Happy Place" hero (flavor chips, two buttons) in
  v3.1, with three real photos that crossfade. The two-column food hero described above was dropped.
- **Three ways to buy** now reflects pickup only: shipping shows as "coming soon"
  ([[fulfillment-and-shipping]]).

Review of the live page (developer, 2026-10-13): about 7/10.
- The hero reads as a near-black panel: the dark overlay almost hides the photo, and the hero photos
  are only 830px wide. No food is visible on the first screen.
- Reviews are still hidden (no real ones yet); footer social links go nowhere; the hero's chip row
  shows six of the ten flavors.
- Suggested order: lighten the overlay, larger hero photos, three real reviews, real social links.
  See [[open-questions]].
