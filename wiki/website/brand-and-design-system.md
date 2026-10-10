---
title: Brand & Design System
type: website
owner: unassigned
updated: 2026-10-10
sources:
  - src/app/globals.css @ fbdbf0b
  - implementation_plan.md @ fbdbf0b
  - origin/feature/landing-page-polish-and-real-photos @ a6ec144 (src/app/globals.css)
---

# Brand & Design System

**Name:** The Queen's Corn. **Voice:** warm, welcoming, family-run, premium-artisanal. Emphasize
the human connection (Bob & Reina), fresh hand-stirred kettle corn and Arizona roots.
See [[company-overview]].

## Typography

- Headings: **Instrument Serif** (400). Body/UI: **Outfit**.

## Color palette: two versions exist

| Token | `main` (dark "Red & Gold") | Feature branch ("Buttercream" light) |
|---|---|---|
| `--primary` | `#dc2626` crimson | `#D9232A` Heritage Crimson |
| `--accent` | `#fbbf24` Royal Gold | `#F5BA31` Kettle Gold |
| `--background` | `#0a0a0a` near-black | `#FAF6EF` Warm Buttercream |
| `--surface` | `#171717` | `#FFFDF9` Buttercream White |
| text | white | `#241B13` Roasted Espresso |
| extras | glass/gold-glow tokens | `--sage #2D5A3E`, `--copper #9B4D1B`, `--dark-espresso #1E1711` |

The direction is moving to the **light buttercream palette**. See [[design-palette-decision]].

## Visual elements

- Real photography (`public/*-real.png`, `bob-reina.webp`, `our-story-team.webp`) is preferred over
  generated imagery. The feature branch replaces more placeholders with real photos.
- Grain overlay, scroll-reveal animations (`ScrollReveal.tsx`), and a marquee (`Marquee.tsx`).
- Trust signals: BBB A+ rating (`public/bbb.png`), "royal seal" badge.
