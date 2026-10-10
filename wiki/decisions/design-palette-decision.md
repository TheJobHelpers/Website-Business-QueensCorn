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

4. **v3.0 "Canopy"** (2026-10-10): bold full-yellow, slab type, sticker borders. Built on the homepage, then
   judged **too different** from the site customers and owners know.
5. **v3.1 "Warm Canopy"** (2026-10-10, chosen by Manula): keeps Buttercream's look, adds the brand as accents. See below.

## Decision (v3.1 "Warm Canopy")

**What:** keep the current cream (`#FAF6EF`), card white, espresso text, Instrument Serif headlines and
Outfit body, soft shadows and rounded cards. Add the brand as accents: Queen Red `#D9232A` for the one main
action and prices, Canopy Yellow `#FFD84A` for one highlight per view (the next pop-up pill), a butter tint
for one highlight band, real photos only, and the event ticket. Muted text darkened to `#6A5D4E` (AA).
The hero keeps today's look: a real photo under the dark espresso-brown shade, cream headline with a
yellow italic tagline. Shadows are warm and deeper than v3.0's soft draft.

**Why:**
- v3.0 was faithful to the stand but felt like a different company next to the site people already know.
- The real problem was clarity and selling, not the palette. v3.1 fixes the page structure and keeps the look.
- Yellow from the canopy still connects the site to the stand, just in small doses.

**Source of truth:** `wiki/design-system/tokens.css` + `components.css` + `design-system.html`.

## Current status

v3.1 chosen; HTML spec updated first. The code on `feature/landing-page-v3` was built in v3.0 and
must be moved to v3.1 next. `main` (live) uses Buttercream.
The step-by-step rollout plan is in [[branches-and-status]]; the old-to-new variable map is in
section 10 of the design system. Details: [[brand-and-design-system]].

> [!warning] To confirm with Bob & Reina: they like the direction, and the exact red/yellow match their
> printed banners (ask for the printer's color codes if they have them). See [[open-questions]].
