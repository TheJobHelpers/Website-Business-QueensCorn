<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project knowledge base

Business and website knowledge lives in `wiki/` (an LLM-maintained wiki). Start at `wiki/index.md`
for context about The Queen's Corn. Before editing anything in `wiki/`, follow `wiki/CLAUDE.md`.
After merging notable code changes, offer to "sync the wiki with the code".

## Design system (required for any UI change)

The visual source of truth is `wiki/design-system/`:
- `wiki/design-system/tokens.css`: every color, font, size, spacing, radius, shadow and motion token
- `wiki/design-system/components.css`: reference CSS for every component
- `wiki/design-system/landing-page-blueprint.html`: the homepage plan (section order, copy, data,
  mobile rules). Follow it for any change to `src/app/page.tsx` or its sections
- `wiki/design-system/design-system.html`: rules, approved contrast pairs, and reference builds of
  every component (Button, Stamp, Flavor tag, Taste meter, Size board, Product card, Event ticket,
  Trust strip, Canopy band). Open it in a browser.

Before changing anything visual (CSS, components, pages, images, copy on the page):
1. Read `tokens.css` and the matching section of `design-system.html`.
2. Use tokens (`var(--red)`, `var(--space-4)`…). No raw hex colors, ad-hoc font sizes or blurred shadows.
3. Reuse a documented component before creating a new one; match its reference build.
4. Use only real photos (never AI-generated people or product bags) and only claims the owners confirmed.
5. Check 375px and 1440px widths.

To change the design system itself: update `wiki/design-system/` first, mirror the tokens into
`src/app/globals.css` in the same commit, then record why in `wiki/decisions/` and `wiki/log.md`.
