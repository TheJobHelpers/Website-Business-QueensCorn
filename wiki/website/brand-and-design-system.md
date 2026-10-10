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

## v3 "Canopy" in one minute

- **Idea:** a county-fair kettle corn stand under the Arizona sky. Everything comes from the real
  logo, canopy, flags and trailer.
- **Colors:** `--yellow` Canopy Yellow (big fields, kettle buttons) · `--red` Queen Red (the one main
  action, prices) · `--sky` Arizona Sky (links, events, seasonal) · `--ink` Silhouette (text, borders)
  · `--paper` Popcorn White (background). Proportion roughly 60 paper / 20 ink / 12 yellow / 6 red / 2 sky.
- **Type:** Alfa Slab One for headlines, prices and dates; Figtree for everything else. The script is only
  in the logo image.
- **Shapes:** hard "sticker" border + shadow on things you press; polka dots only on yellow fields; a
  ticket stub for events.
- **Components:** Button (red / kettle / sky / ghost), Stamp, Flavor tag, Taste meter (5 kernels), Size
  board ($6 / $10 / $15), Product card, Event ticket, Trust strip, Canopy band.
- **Imagery:** real photos only. The AI-generated hero, flavor and story images are retired (list in the
  design system). Voice: Bob & Reina at the stand: friendly, proud, factual.

## What the code uses today (not migrated yet)

`main` @ ee5b44c (live since PR #1): light **"Buttercream"** palette (`--background` #FAF6EF, espresso
text #241B13, crimson #D9232A, Kettle Gold #F5BA31, sage, copper), Instrument Serif + Outfit, soft
blurred shadows, and the old v2 spec at `public/design-system.html` (publicly served; delete when migrating).

The migration map (old variable → v3 token) is in section 10 of the design system; the rollout order is
in [[branches-and-status]].
