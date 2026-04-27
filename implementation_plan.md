# Implementation Plan - Brand Identity & Design System Pivot

Transform the website from a yellow-centric theme to a premium **Red & Gold** identity that honors the original brand heritage while delivering a world-class, welcoming e-commerce experience.

## User Review Required

> [!IMPORTANT]
> **Color Palette Shift**: We are moving from Amber/Yellow to a **Royal Crimson Red** and **Brushed Gold**. This aligns with the original logo while feeling significantly more "Premium."
> **Emotional Resonance**: The focus shifts from "vibe" to "welcome." Every section will emphasize the human connection (Bob & Reina) and the joy of the popcorn.

## Proposed Changes

### 1. Global Design System Update
- **[MODIFY] `src/app/globals.css`**: 
    - Change `--primary` to a rich crimson (`#b91c1c`).
    - Change `--accent` to a warm gold (`#eab308`).
    - Update gradients and glassmorphism tokens to use warm red/amber undertones.

### 2. Hero Section 2.0
- **[MODIFY] `src/components/Hero.tsx`**: 
    - Use the new lifestyle atmospheric background.
    - Implement a static, powerful, and welcoming headline.
    - Remove gimmick animations in favor of elegant, cinematic typography.

### 3. Component Updates
- **[MODIFY] `src/components/Story.tsx`**: Update badges and accents to the new Red/Gold scheme.
- **[MODIFY] `src/components/FeaturedProducts.tsx`**: Refine product cards with the new color tokens.
- **[MODIFY] `src/components/layout/Navbar.tsx`**: Update logo and link hover states.

### Project Initialization
- Run `npx create-next-app@latest` in the root directory.
- Options: TypeScript: Yes, ESLint: Yes, Tailwind: No, src/ directory: Yes, App Router: Yes, Import Alias: `@/*`.

---

### Phase 1: Design System & Foundation
- **[NEW] `src/styles/globals.css`**: Establish the core design system (CSS variables for colors, typography, and spacing).
- **[NEW] `src/styles/tokens.css`**: Define reusable tokens for glassmorphism and gradients.

---

### Phase 2: UI Demo Components
- **[NEW] `src/components/Hero.tsx`**: A cinematic landing section with premium typography.
- **[NEW] `src/components/ProductCard.tsx`**: High-fidelity cards for popcorn varieties.
- **[NEW] `src/components/CRM/DashboardPreview.tsx`**: A sleek administrative layout for managing the shop.

- [NEW] `src/components/Story.tsx`: A cinematic 'Meet Bob and Reina' section.
- [NEW] `src/components/Features.tsx`: Highlighting 'The Production' and quality.
- [NEW] `src/components/TrustBanner.tsx`: Highlighting the A+ rating and Arizona roots.
- [NEW] `src/app/shop/[id]/page.tsx`: Cinematic product detail view with glassmorphism.

---

### Phase 4: Assembly
- **[MODIFY] `src/app/page.tsx`**: Assemble the storefront with all new sections.
- **[NEW] `src/app/admin/page.tsx`**: Create the CRM demo entry point.

## Verification Plan

### Automated Tests
- Run `npm run dev` and verify the server starts without errors.
- Run `npm run build` to ensure production readiness.

### Manual Verification
- Visual inspection of the "Storefront" and "CRM Admin" pages.
- Verify responsive layouts on mobile and desktop viewports.
- Confirm micro-animations and hover effects are working.
