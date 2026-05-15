---
version: alpha
name: ViraHit
description: >
  Emotional music personalization studio — warm cream & deep teal palette
  with gold accents. Serif + sans-serif pairing for editorial warmth and
  functional clarity. Designed for a 50+ audience: high contrast, large
  type, zero dark mode, no generic social proof in hero.
colors:
  primary: "#2C5D63"
  cream: "#F4EEDC"
  cream-alt: "#F5F3EC"
  teal: "#2C5D63"
  teal-dark: "#1A3D42"
  gold: "#EAA115"
  gold-dark: "#D9900B"
  white: "#FFFFFF"
  whatsapp: "#25D366"
  stripe-green: "#33A854"
typography:
  heading-serif:
    fontFamily: Merriweather
    fontSize: 3rem
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  heading-sans:
    fontFamily: Open Sans
    fontSize: 2rem
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: 0.05em
  body-serif:
    fontFamily: Merriweather
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.75
  body-sans:
    fontFamily: Open Sans
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: Open Sans
    fontSize: 0.75rem
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0.25em
  display-script:
    fontFamily: Great Vibes
    fontStyle: italic
  display-hand:
    fontFamily: Caveat
    fontWeight: 500
  obra-heading:
    fontFamily: Outfit
    fontSize: 30px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
rounded:
  none: 0px
  xs: 4px
  sm: 8px
  md: 10px
  lg: 12px
  xl: 16px
  "2xl": 20px
  "3xl": 28px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  "2xl": 48px
  "3xl": 64px
  "4xl": 80px
  "5xl": 120px
shadows:
  soft: "0 8px 32px rgba(44, 93, 99, 0.06)"
  medium: "0 20px 60px rgba(44, 93, 99, 0.1)"
  heavy: "0 20px 60px rgba(44, 93, 99, 0.15)"
  cta: "0 8px 20px rgba(234, 161, 21, 0.3)"
  whatsapp: "0 8px 20px rgba(37, 211, 102, 0.3)"
  stripe: "0 8px 20px rgba(51, 168, 84, 0.3)"
  inner: "inset 0 2px 4px rgba(0, 0, 0, 0.04)"
components:
  page-body:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.primary}"
    typography: "{typography.body-serif}"
  button-cta-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.white}"
    typography: "{typography.heading-sans}"
    rounded: "{rounded.sm}"
    padding: 20px
    height: 56px
  button-cta-primary-hover:
    backgroundColor: "{colors.gold-dark}"
  button-whatsapp:
    backgroundColor: "{colors.whatsapp}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: 16px
    height: 54px
  button-whatsapp-hover:
    backgroundColor: "{colors.whatsapp}"
  button-stripe:
    backgroundColor: "{colors.stripe-green}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: 16px
    height: 56px
  button-stripe-hover:
    backgroundColor: "{colors.stripe-green}"
  button-copy:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    height: 56px
  button-copy-hover:
    backgroundColor: "{colors.teal-dark}"
  card-quiz-option:
    backgroundColor: "{colors.white}"
    textColor: "{colors.teal}"
    rounded: "{rounded.none}"
    padding: 20px
  card-quiz-selected:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.teal-dark}"
    rounded: "{rounded.none}"
    padding: 16px
  card-benefit:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.2xl}"
    padding: 24px
  input-text:
    backgroundColor: "{colors.cream-alt}"
    textColor: "{colors.teal}"
    rounded: "{rounded.xl}"
    padding: 14px
  player-card-obra:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.3xl}"
    padding: 28px
  capa-obra:
    backgroundColor: "{colors.teal}"
    rounded: "{rounded.xl}"
  divider-ornamental:
    height: 1px
    rounded: "{rounded.none}"
  header-quiz:
    backgroundColor: "{colors.white}"
    textColor: "{colors.teal}"
    rounded: "{rounded.none}"
    padding: 16px
---

## Overview

ViraHit is an emotional music personalization studio. The visual identity
balances **editorial warmth** (serif typography, cream backgrounds, gold
accents) with **functional clarity** (sans-serif headings, sharp quiz cards,
high-contrast CTAs).

The brand targets a 50+ Brazilian audience — legibility and trust are
paramount. No dark mode. No tiny text. No generic social proof.

**Brand personality:** Intimate, premium, trustworthy. Like a letterpress
card meets a modern streaming app.

**Design philosophy:**
- Cream background (#F4EEDC) everywhere — never white page, never dark
- Teal (#2C5D63) for all primary text and labels — never pure black
- Gold (#EAA115) exclusively for CTAs and selected states — the only
  high-saturation color users should click
- Serif (Merriweather) for emotional body copy — letter spacing tight
- Sans-serif (Open Sans / Outfit) for headings and UI labels — uppercase,
  bold, tracking wide

**Section background alternation (landing page):**
- Light sections: cream (#F4EEDC)
- Impact sections ("Como Funciona", "Imagine"): dark teal gradient
  (#2C5D63 → #153438 or #2D545E)
- This rhythm creates visual breathing room and draws attention to key
  conversion moments

---

## Colors

### Core Palette

| Token | Hex | Usage |
|---|---|---|
| `cream` | `#F4EEDC` | Default page background across all pages |
| `cream-alt` | `#F5F3EC` | Input field backgrounds, subtle overlays |
| `cream-ivory` | `#F8F4E1` | Quiz page background (slightly warmer variant) |
| `teal` | `#2C5D63` | Primary text color, labels, borders, section headings |
| `teal-dark` | `#1A3D42` | Darker teal for gradients, hover states, obra title |
| `teal-deeper` | `#153438` | Deepest teal, gradient endpoints, dark section bg |
| `teal-light` | `#3D7A81` | Secondary text, placeholder text, subtle borders |
| `gold` | `#EAA115` | Primary CTA buttons, selected states, accents |
| `gold-dark` | `#D9900B` | CTA hover state, gradient endpoint |
| `gold-light` | `#EFC078` | Quiz page button, softer gold variant |
| `gold-mustard` | `#D6A956` | Header accent line, decorative elements |
| `white` | `#FFFFFF` | Card backgrounds, header bar, input focus |

### Functional Colors

| Token | Hex | Usage |
|---|---|---|
| `whatsapp` | `#25D366` | WhatsApp button (recovery, support) |
| `stripe-green` | `#33A854` | Stripe/Apple Pay checkout button |
| `error` | `#E53935` | Validation errors, stop recording button |
| `google-blue` | `#4285F4` | Google Pay button |
| `border-beige` | `#B7B19B` | Quiz card default border |
| `border-divider` | `#DED8CD` | Horizontal dividers, table borders |

### Glass & Overlay (Obra page)

| Token | Value | Usage |
|---|---|---|
| `glass-bg` | `rgba(255, 255, 255, 0.45)` | Player card background |
| `glass-border` | `rgba(234, 161, 21, 0.15)` | Player card border |
| `gold-glow` | `rgba(234, 161, 21, 0.3)` | Selected state glow, shadow tint |
| `muted` | `rgba(44, 93, 99, 0.55)` | Secondary/italic text |

### Text Colors

| Token | Hex | Usage |
|---|---|---|
| `text-primary` | `#333333` | Landing page headings (legacy) |
| `text-muted` | `#666666` | Landing page body text (legacy) |
| `text-secondary` | `#5C7E84` | Quiz subtext, placeholder, footer text |

---

## Typography

### Font Families

| Font | Role | Source |
|---|---|---|
| **Merriweather** (serif) | Body copy, emotional text, landing hero | Google Fonts |
| **Open Sans** (sans-serif) | UI labels, headings, quiz, checkout | Google Fonts |
| **Outfit** (sans-serif) | Obra page headings, registry labels | Google Fonts |
| **Inter** (sans-serif) | Landing page body (fallback) | Google Fonts |
| **Great Vibes** (script) | Obra decorative titles | Google Fonts |
| **Caveat** (handwriting) | Obra handwritten accents | Google Fonts |

### Typographic Scale

| Style | Font | Size | Weight | Line Height | Letter Spacing | Used In |
|---|---|---|---|---|---|---|
| Hero H1 | Merriweather | 48–64px | 700 | 1.1 | -0.02em | Landing hero |
| Section H2 | Merriweather | 32–40px | 700 | 1.2 | 0 | Landing sections |
| Section H3 | Merriweather | 20–24px | 700 | 1.3 | 0 | Landing sub-sections |
| Quiz title | Open Sans | 32px | 800 | 1.2 | 0.05em | Quiz page H1 |
| Quiz label | Open Sans | 14px | 800 | 1 | 0.05em | Quiz card labels |
| Quiz input label | Open Sans | 18px | 800 | 1.2 | 0 | Quiz step labels |
| Body serif | Merriweather | 16px | 400 | 1.75 | 0 | Landing body copy |
| Body sans | Open Sans | 16px | 400 | 1.6 | 0 | Quiz/checkout body |
| CTA button | Open Sans | 14.5–20px | 700 | 1 | 0.05em | All CTA buttons |
| Micro label | Open Sans | 12px | 600 | 1 | 0.25em | Section overlabels |
| Obra H1 | Outfit | 30–44px | 400 | 1.1 | -0.02em | Obra page title |
| Obra label | Outfit | 10–12px | 500–600 | 1 | 0.2–0.25em | Obra registry, sections |
| Obra carta | Merriweather | 18px | italic | 1.75 | 0 | Composer's letter |
| Obra letra | Merriweather | 17px | 400 | 1.9 | 0 | Song lyrics |

### Typography Rules

1. **Merriweather** is the emotional voice — used for body copy on landing,
   song lyrics, and the composer's letter on the obra page
2. **Open Sans** is the functional voice — all UI labels, quiz options,
   checkout text, and buttons
3. **Outfit** is the ceremonial voice — reserved for the obra page to
   give it a distinct "album cover" feel
4. All quiz and checkout labels are **UPPERCASE** with wide letter-spacing
5. Hero headlines use **tightened letter-spacing** (-0.02em) for impact
6. Micro labels (section overlabels like "SIMPLES E RAPIDO") use
   **extra-wide letter-spacing** (0.25em) for editorial feel
7. Minimum font size: **15px** for body text (50+ audience requirement)
8. No font below 12px anywhere in the system

---

## Layout

### Spacing Scale

All spacing follows an 8px grid system:

| Token | Value | Usage |
|---|---|---|
| `xs` | 4px | Icon gaps, tight element spacing |
| `sm` | 8px | Between inline elements, small gaps |
| `md` | 16px | Between form elements, card internal padding |
| `lg` | 24px | Section internal padding, obra page horizontal |
| `xl` | 32px | Between major component groups |
| `2xl` | 48px | Between quiz steps, obra stanzas |
| `3xl` | 64px | Landing section vertical padding (mobile) |
| `4xl` | 80px | Landing section vertical padding (desktop) |
| `5xl` | 120px | Major section breaks on landing |

### Container Widths

| Page | Max Width | Behavior |
|---|---|---|
| Landing | Full-width with centered content | Responsive, ~80% viewport |
| Quiz | 600–700px | Centered, fixed-width container |
| Checkout | 440px | Centered, narrow for focus |
| Obra | 520px | Centered, album-like presentation |

### Grid Patterns

- **Quiz option cards:** 2-column grid, ~10px gap
- **Landing benefits:** 3-column (desktop), 1-column (mobile)
- **Comparison table:** 3-column (resource, normal, ViraHit)
- **Obra page:** Single-column, max-width centered

---

## Elevation & Depth

### Shadow System

| Token | Value | Usage |
|---|---|---|
| `soft` | `0 8px 32px rgba(44, 93, 99, 0.04–0.06)` | Benefit cards, input containers |
| `medium` | `0 20px 60px rgba(44, 93, 99, 0.1)` | Obra player card |
| `heavy` | `0 20px 60px rgba(44, 93, 99, 0.15)` | Obra capa + player combined |
| `cta` | `0 8px 20px rgba(234, 161, 21, 0.3)` | Gold CTA buttons |
| `whatsapp` | `0 8px 20px rgba(37, 211, 102, 0.3)` | WhatsApp buttons |
| `stripe` | `0 8px 20px rgba(51, 168, 84, 0.3)` | Stripe/Apple Pay buttons |
| `inner` | `inset 0 2px 4px rgba(0, 0, 0, 0.04)` | Input fields (inner shadow) |
| `gold-ring` | `0 0 20px rgba(234, 161, 21, 0.3)` | Gold icon buttons |

### Glassmorphism (Obra page only)

The obra page uses glassmorphism for the audio player card:
- Background: `rgba(255, 255, 255, 0.45)`
- Backdrop blur: `20px`
- Border: `1px solid rgba(234, 161, 21, 0.15)`
- This is the ONLY place glassmorphism is used — it gives the player
  a premium, "floating album" feel

---

## Shapes

### Border Radius Strategy

| Context | Radius | Rationale |
|---|---|---|
| Quiz option cards | **0px** (sharp) | Functional, form-like feel |
| Quiz text inputs | **0px** (sharp) | Matches card aesthetic |
| Quiz CTA button | **0px** (sharp) | Matches quiz boxy aesthetic |
| Landing CTA button | **8px** (sm) | Warm but professional |
| Landing benefit cards | **12–15px** (lg) | Friendly, approachable |
| Checkout inputs | **12–16px** (xl) | Modern, rounded |
| Checkout cards | **16–20px** (2xl) | Soft, premium |
| Obra capa | **16px** (xl) | Album cover feel |
| Obra player card | **28px** (3xl) | Premium, distinctive |
| Icon buttons | **full** (circle) | Play, back, action icons |
| Selected quiz options | **0px** (sharp) | Maintains quiz consistency |

**Key distinction:** The quiz flow uses **sharp corners (0px)** for a
structured, form-like experience. The landing and obra pages use **rounded
corners (8–28px)** for warmth and premium feel. This is intentional —
the quiz is functional; the landing and obra are emotional.

### Special Shapes

- **Ornamental divider** (obra): 1px gradient line, transparent → gold
  glow → transparent, max-width 200px, centered
- **Grain overlay** (obra): SVG noise texture at 3% opacity, animated
- **Ambient glow** (obra): Radial gradients of gold at 3–5% opacity
  positioned at corners

---

## Components

### button-cta-primary
The primary conversion button across all pages.

- Background: gold (#EAA115)
- Text: white, uppercase, Open Sans Bold 14.5–20px
- Border radius: 8px (landing) or 0px (quiz)
- Padding: 20px vertical, 40px horizontal
- Shadow: gold glow (0 8px 20px rgba(234, 161, 21, 0.3))
- States: hover → gold-dark (#D9900B), active → scale(0.95)
- Always includes icon (arrow-forward or sparkle)

### button-whatsapp
Support and recovery button.

- Background: WhatsApp green (#25D366)
- Text: white, uppercase, 14–15px
- Border radius: 10px
- Height: 54px
- Shadow: green glow
- States: hover → #20BD5A, active → scale(0.98)

### button-stripe
Payment button (Stripe/Apple Pay).

- Background: Stripe green (#33A854)
- Text: white, uppercase, extrabold
- Border radius: 12px
- Height: 56px
- Shadow: green glow
- States: hover → #2D954B

### card-quiz-option
Selectable option in the quiz flow.

- Default: white bg, beige border (#B7B19B), 0px radius, 20px padding
- Selected: gold border (2px), gold/10 bg, gold text on cream
- Layout: emoji icon + uppercase label
- Grid: 2 columns, 10px gap

### card-benefit
Benefit/differentiator card on landing page.

- Background: white
- Border radius: 12–15px
- Shadow: soft (0 10px 30px rgba(0, 0, 0, 0.05))
- Padding: 24–32px
- Content: heading + body copy

### input-text
Form input for name, email, WhatsApp, story.

- Background: cream-alt (#F5F3EC)
- Border: 1px solid teal/10
- Border radius: 12–16px
- Padding: 14–16px
- Text: teal (#2C5D63), 16px
- Focus: transparent border + gold ring (2px)
- Placeholder: italic, 15px, teal-light/40

### player-card-obra
Audio player on the obra page.

- Background: glass (rgba(255, 255, 255, 0.45))
- Backdrop blur: 20px
- Border: 1px gold/15
- Border radius: 28px
- Padding: 28px
- Max-width: 380px
- Shadow: medium
- Contains: artwork, progress bar, controls, time display

### header-quiz
Top bar of the quiz flow.

- Background: white
- Bottom border: 1px gold-mustard (#D6A956)
- Content: ViraHit logo (left), "Comecar do Zero" reset (right)
- Height: ~60px
- Text: teal, Merriweather serif

### section-dark-landing
Impact section on landing page (Como Funciona, Imagine).

- Background: gradient from teal (#2C5D63) to teal-deeper (#153438)
- Text: white
- Border radius: 16–20px (rounded cards within dark section)
- Padding: 48–80px vertical
- Step numbers in gold circles

### comparison-table
Feature comparison table on landing.

- Headers: uppercase, teal text
- Rows: alternating subtle backgrounds
- Borders: border-divider (#DED8CD), 1px
- ViraHit column highlighted with gold accent
- Clean, minimal — no fills, just lines

---

## Do's and Don'ts

### Do

- **Use cream (#F4EEDC) as the default background** — never pure white pages
- **Use teal (#2C5D63) for all primary text** — never pure black (#000000)
- **Reserve gold (#EAA115) for interactive elements only** — it's the click color
- **Use Merriweather for emotional copy** — body text, lyrics, letters
- **Use Open Sans for functional text** — labels, buttons, UI elements
- **Alternate cream and dark-teal sections on landing** — creates rhythm
- **Keep minimum font at 15px** — audience is 50+
- **Use uppercase for labels and CTAs** — adds authority and clarity
- **Use glassmorphism ONLY on the obra page** — it's the premium signature
- **Use sharp corners (0px) in the quiz** — functional, focused feel
- **Use rounded corners (8–28px) in landing/obra** — warm, premium feel

### Don't

- **Never use dark mode** — the brand is warm cream and gold
- **Never use pure black text** — it's harsh on cream; use teal instead
- **Never use gold as body text color** — it's for CTAs and accents only
- **Never use fonts below 12px** — accessibility for 50+ audience
- **Never mix serif and sans-serif in the same element** — pick one role
- **Never use generic social proof in the hero** — no "1,200+ customers" above the fold
- **Never use placeholder names in copy** — use variables, not "Joao"
- **Never use negative framing at checkout** — "para facilitar", not "para nao dar erro"
- **Never use glassmorphism outside the obra page** — it dilutes the premium feel
- **Never use rounded corners in the quiz flow** — sharp = focused, rounded = casual
- **Never use emojis in the landing page** — use icons (Lucide) instead
- **Never use informal language** ("pra", "a gente", "pro") — audience values formality
