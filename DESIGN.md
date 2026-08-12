---
name: Global Trust & Growth
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#735c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#cba72f'
  on-tertiary-container: '#4e3d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffe088'
  tertiary-fixed-dim: '#e9c349'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#574500'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  trust-blue-900: '#0F172A'
  growth-emerald-500: '#10B981'
  premium-gold: '#D4AF37'
  surface-gray-50: '#F8FAFC'
  border-gray-200: '#E2E8F0'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system for this real estate marketplace is built on the pillars of **Global Authority**, **Technological Precision**, and **Local Relatability**. It targets a dual audience: sophisticated international investors seeking stability and Nigerian real estate professionals looking for modern, efficient tools.

The visual style is **Corporate / Modern** with subtle **Minimalist** influences. It avoids the cluttered "classifieds" look of legacy platforms in favor of a clean, high-end marketplace aesthetic. The interface should feel "expensive" yet accessible—evoking the confidence of a premium consultancy while maintaining the ease of use of a consumer app.

Key attributes:
- **Trust-First:** High-contrast layouts and stable grid structures.
- **AI-Native:** Intentional use of space and subtle motion to indicate "intelligence" without feeling gimmicky.
- **Professional Growth:** A focus on clarity and data accuracy, ensuring that agents feel empowered and seekers feel secure.

## Colors

The color strategy uses **Trust Blue** (`#0F172A`) as the anchor to establish authority and professional weight. **Growth Emerald** (`#10B981`) is the primary action color, signaling opportunity and successful verification. **Premium Gold** is used sparingly as an accent for "Featured" or "Verified" statuses to denote exclusivity and high-tier value.

The background system relies on a clean, "Gallery White" approach using `surface-gray-50` to maintain a spacious, modern feel. All status indicators should adhere to this palette:
- **Verified:** Emerald / Gold.
- **Pending:** Neutral / Slate.
- **Action Required:** Deep Blue with high-contrast text.

## Typography

This design system utilizes **Inter** exclusively for its exceptional legibility and neutral, systematic tone. It provides a "software-as-a-service" professional feel that bridges the gap between a tech product and a high-end agency.

- **Headlines:** Use tight letter-spacing and heavy weights to command attention.
- **Body Text:** Generous line-heights are used to ensure long property descriptions and AI-generated match explanations remain readable.
- **Labels:** Used for metadata (price, location, square footage) and navigation; they use medium/semi-bold weights to provide hierarchy within property cards.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop (12 columns) and a **Fluid Grid** on mobile.

- **The AI Search Experience:** Centered, focused layouts are used for natural-language input to reduce distraction.
- **Property Discovery:** A standard 3-column grid for desktop listings, moving to a single-column stack on mobile.
- **Rhythm:** An 8px base unit drives all spacing. Use `stack-lg` to separate distinct property sections and `stack-sm` for related metadata within a card.
- **White Space:** High margins are encouraged to maintain the "Premium" brand positioning; avoid dense, information-heavy views that mimic old-school classifieds.

## Elevation & Depth

This design system uses **Tonal Layers** and **Low-Contrast Outlines** to create a sense of organized hierarchy without the "heavy" look of traditional shadows.

- **Level 0 (Base):** `surface-gray-50`.
- **Level 1 (Cards/Inputs):** White background with a 1px `border-gray-200`. This is the primary surface for property listings.
- **Level 2 (Hover/Active):** A very soft, diffused ambient shadow (10% opacity, 12px blur) to indicate interactivity on property cards.
- **AI Overlay:** For natural-language processing states, use a subtle "glow" or backdrop blur rather than a hard shadow to signify the "intelligence" layer of the product.

## Shapes

The shape language is **Soft (0.25rem)**. This provides a balance between the precision of a professional tool (sharp corners) and the approachability of a modern consumer app.

- **Inputs & Buttons:** 4px (0.25rem) radius.
- **Property Cards:** 8px (0.5rem) radius to feel slightly more substantial and "framed."
- **Status Pills:** Fully rounded (pill-shaped) to distinguish them from functional buttons.

## Components

### Buttons
- **Primary:** Trust Blue background, White text. High-contrast and decisive.
- **Secondary:** Growth Emerald background. Used for "Contact Agent" or "Verified" actions.
- **Tertiary:** Outline style. Used for secondary search filters.

### AI Natural-Language Input
- **Design:** Large, prominent input fields with 18px text.
- **Affordance:** Use a "sparkle" icon or a subtle gradient border to indicate this isn't a standard filter search, but an AI-powered field.
- **Placeholder:** Uses example prompts like *"3-bedroom apartment in Lekki with 24/7 power"* to guide the user.

### Property Cards
- **Structure:** Large image (aspect-ratio 16:9), followed by Price (Primary Color), then Location and Specs.
- **Verification Badge:** A small, Gold or Emerald pill in the top corner of the card to indicate "AI Verified" or "Direct Listing."

### Input Fields
- **Standard:** Clean 1px borders. Focused state uses a 2px Trust Blue border.
- **Listing Flow:** Multi-step indicators to guide agents through the AI-assisted listing process, reducing friction.

### Status Indicators
- **Verified:** Emerald checkmark + text.
- **International:** Neutral slate tag indicating the property source (e.g., "via RentCast").
- **Match Score:** A circular progress or percentage indicator in Growth Emerald, showing how well the property fits the user's natural language description.
