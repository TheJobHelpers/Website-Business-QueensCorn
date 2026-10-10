---
title: "Decision: Site color palette"
type: decision
owner: unassigned
updated: 2026-10-10
status: in-progress
sources:
  - implementation_plan.md @ fbdbf0b
  - origin/feature/landing-page-polish-and-real-photos @ 0c5aa79
---

# Decision: Site color palette

## History

1. **Original:** amber/yellow-centric theme.
2. **"Red & Gold" pivot** (`implementation_plan.md`): Royal Crimson Red + Brushed Gold on a dark
   background, chosen to match the original logo while feeling more premium, and to shift the focus from
   "vibe" to "welcome". This is live on `main`.
3. **Light "Buttercream" palette** (commit `0c5aa79`, 2026-10-07, feature branch): keeps crimson and
   gold as brand colors but uses warm cream backgrounds and espresso text, described as the
   "authentic" palette. It is probably closer to the existing thequeenscorn.com.

## Current status

Buttercream is in progress on the feature branch, not merged. Details: [[brand-and-design-system]].

> [!warning] Unverified: the reason for moving from dark to light isn't written down. Ask whoever
> made commit `0c5aa79` and record the reason here.
