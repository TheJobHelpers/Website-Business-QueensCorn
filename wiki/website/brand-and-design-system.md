---
title: Brand & Design System
type: website
owner: unassigned
updated: 2026-10-10
sources:
  - wiki/design-system/tokens.css (v3.0)
  - wiki/design-system/design-system.html (v3.0)
  - src/app/globals.css @ ee5b44c
---

# Brand & Design System

**Source of truth:** [design-system.html](../design-system/design-system.html) (open in a browser)
and [tokens.css](../design-system/tokens.css). This page is only a summary. Why we chose it:
[[design-palette-decision]].

## v3.1 "Warm Canopy" in one minute

- **Idea:** today's warm Buttercream site, made clearer, with the stand's red and canopy yellow as accents.
- **Colors:** `--paper` cream background · `--white` cards · `--ink` espresso text · `--red` the one main
  action and prices · `--yellow` one highlight per view · `--butter` one highlight band · `--espresso` dark bands.
- **Type:** Instrument Serif (400, never bold) for headlines, prices and numbers, with one red italic phrase;
  Outfit for everything else.
- **Hero:** real photo under today's dark espresso-brown shade (`--scrim`), cream headline, yellow italic tagline.
- **Rhythm:** dark hero → light trust strip floating over its edge → cream → dark markets band → butter fundraising → cream → dark footer.
- **Shapes:** cards with warm, deep shadows (1px warm border, 20px radius), pill buttons, the event ticket.
- **Components:** Button (red / kettle / dark / outline), Stamp, Next pop-up pill, Flavor tag, Taste meter,
  Size options, Product card, Event ticket, Trust strip, Highlight band.
- **Imagery & voice:** real photos only; Bob & Reina's own words, confirmed claims only.

## What the code uses today (not migrated yet)

`main` @ ee5b44c (live since PR #1): light **"Buttercream"** palette (`--background` #FAF6EF, espresso
text #241B13, crimson #D9232A, Kettle Gold #F5BA31, sage, copper), Instrument Serif + Outfit, soft
blurred shadows, and the old v2 spec at `public/design-system.html` (publicly served; delete when migrating).

The migration map (old variable → v3 token) is in section 10 of the design system; the rollout order is
in [[branches-and-status]].
