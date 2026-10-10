---
title: "Decision: Site color palette"
type: decision
owner: unassigned
updated: 2026-10-10
status: in-progress
sources:
  - implementation_plan.md @ fbdbf0b
  - commit 0c5aa79 (merged to main in PR #1)
  - wiki/design-system/tokens.css (v3.0)
---

# Decision: Site color palette

## History

1. **Original:** amber/yellow-centric theme.
2. **"Red & Gold" pivot** (`implementation_plan.md`): Royal Crimson Red + Brushed Gold on a dark
   background, chosen to match the original logo while feeling more premium, and to shift the focus from
   "vibe" to "welcome". Was live on `main` until 2026-10-10.
3. **Light "Buttercream" palette** (commit `0c5aa79`, 2026-10-07; **merged to `main` in PR #1 on
   2026-10-10, currently live**): keeps crimson and gold as brand colors but uses warm cream
   backgrounds and espresso text, described as the "authentic" palette.

4. **v3 "Canopy"** (2026-10-10, proposed by Manula with Claude): replaces Buttercream. See below.

## Decision (v3 "Canopy")

**What:** Canopy Yellow `#FFE01B`, Queen Red `#D7141C`, Arizona Sky `#0B4F9C`, Silhouette Ink `#1C1719`
on Popcorn White `#FFFDF6`. Alfa Slab One for headlines and prices, Figtree for everything else. Hard
"sticker" shadows, canopy polka dots, ticket-stub event cards. Real photos only.

**Why:**
- The colors are sampled from the brand's own physical assets: the logo (red script, black
  silhouette), the tent, flags and trailer (lemon yellow with polka dots), and the sky over the stand.
  Buttercream/Instrument Serif looked premium but generic, with no link to what customers see at markets.
- The logo tagline and canopy use heavy slab lettering, hence a slab display face.
- Contrast was checked: every text pair used meets WCAG AA (table in the design system).
- The earlier `--text-muted` #7A6E5F failed AA on cream (4.4:1).

**Source of truth:** `wiki/design-system/tokens.css` + `wiki/design-system/design-system.html`.

## Current status

Decided as the direction, **not yet applied to the code**. `main` (live) uses Buttercream.
The step-by-step rollout plan is in [[branches-and-status]]; the old-to-new variable map is in
section 10 of the design system. Details: [[brand-and-design-system]].

> [!warning] To confirm with Bob & Reina: they like the direction, and the exact red/yellow match their
> printed banners (ask for the printer's color codes if they have them). See [[open-questions]].
