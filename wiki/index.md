# Wiki Index

Catalog of every page. **Agents: read this first.** Keep it to one line per page; add new pages here.
How to use the wiki: [README](README.md) · Rules for agents: [CLAUDE.md](CLAUDE.md)

## Start here
- [[company-overview]]: who The Queen's Corn is: founders, story, contact, where they sell
- [[open-questions]]: unresolved issues and things to confirm with the owners

## Business
- [[fundraising-program]]: 50% giveback for schools and teams; codes, attribution, sample campaigns
- [[events-and-markets]]: farmers' markets and festivals schedule; how events are managed
- [[fulfillment-and-shipping]]: AZ USPS shipping (free over $35) vs free market pickup; manual-order fallback

## Products
- [[product-catalog]]: 8 flavors, categories, $6/$10/$15 bag sizes, data sources

## Website
- [[website-architecture]]: Next.js 16 stack, routes, key files, commands
- [[shopify-integration]]: headless Shopify: env vars, metaobjects, checkout attributes, known gaps
- [[admin-portal]]: `/admin` owner dashboard, its limitations, the feature-branch auth
- [[brand-and-design-system]]: short summary of the v3.1 "Warm Canopy" design system and what the code still uses
- [[branches-and-status]]: what's live on `main`, open branches & PRs, and the **plan** (done / next)

## Design system (source of truth for the look)
- [design-system.html](design-system/design-system.html): v3.1 "Warm Canopy": colors, type, components, imagery, voice, change rules (open in a browser)
- [tokens.css](design-system/tokens.css): all design tokens; `src/app/globals.css` must mirror it
- [components.css](design-system/components.css): reference CSS for every component (shared by both pages)
- [shop-page-blueprint.html](design-system/shop-page-blueprint.html): shop plan: delivery choice up front, taste chips, size picker on every card, bag bar, helpers
- [landing-page-blueprint.html](design-system/landing-page-blueprint.html): homepage plan: 9 sections with hi-fi mockups, final copy, data, mobile rules, build plan

## Decisions
- [[design-palette-decision]]: amber → Red & Gold → Buttercream → Canopy v3.0 → **Warm Canopy v3.1** (2026-10-10)

- [[shop-page-structure]]: shop built around 3 taps: how you get it → flavor → size; compact header, bag bar (proposed)
- [[landing-page-structure]]: homepage rebuilt around selling: food hero, three ways to buy, flavors, markets, fundraising, one story (built, awaiting sign-off)

## Templates
- `templates/`: [business](templates/business-page.md) · [product](templates/product-page.md) · [decision](templates/decision-page.md) · [meeting note](templates/meeting-note.md)
