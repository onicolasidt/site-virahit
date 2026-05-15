---
version: alpha
name: ViraHit
description: Warm editorial minimalism for personalized music. Cream canvas, teal ink, gold accent — where love stories become songs.
colors:
  primary: "#2C5D63"
  secondary: "#3D7A81"
  accent: "#EAA115"
  neutral: "#F4EEDC"
  whatsapp: "#25D366"
  dark: "#121212"
  on-primary: "#FFFFFF"
  on-accent: "#FFFFFF"
  on-neutral: "#2C5D63"
typography:
  h1:
    fontFamily: "Open Sans"
    fontSize: "4rem"
    fontWeight: 800
    lineHeight: "1.1"
    letterSpacing: "-0.02em"
    textTransform: "uppercase"
  h2:
    fontFamily: "Open Sans"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: "1.2"
    letterSpacing: "-0.02em"
    textTransform: "uppercase"
  h3:
    fontFamily: "Open Sans"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: "1.2"
    letterSpacing: "-0.02em"
    textTransform: "uppercase"
  body-lg:
    fontFamily: "Merriweather"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: "1.625"
  body-md:
    fontFamily: "Merriweather"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.5"
  caption:
    fontFamily: "Open Sans"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.08em"
    textTransform: "uppercase"
  price:
    fontFamily: "Open Sans"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: "1"
rounded:
  sm: "4px"
  md: "8px"
  lg: "16px"
  xl: "48px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "80px"
  hero: "128px"
elevation:
  sm: "0 1px 2px rgba(0,0,0,0.05)"
  md: "0 4px 6px rgba(0,0,0,0.07)"
  lg: "0 10px 15px rgba(0,0,0,0.10)"
  editorial: "20px 20px rgba(44,93,99,0.05)"
  gold-glow: "drop-shadow(0 0 15px rgba(234,161,21,0.4))"
components:
  cta-button:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.full}"
    padding: "20px 32px"
    typography: "body-lg"
  cta-button-hover:
    backgroundColor: "#C99A3C"
  whatsapp-button:
    backgroundColor: "{colors.whatsapp}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  card-default:
    backgroundColor: "rgba(244,238,220,0.4)"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "32px"
  card-editorial:
    backgroundColor: "rgba(255,255,255,0.5)"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "40px"
  input:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  badge:
    backgroundColor: "rgba(234,161,21,0.1)"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  page-background:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
---

## Overview

ViraHit transforms love stories into custom songs. The visual identity mirrors
this warmth: a cream canvas that feels like parchment, teal ink that feels
personal, and gold accents that signal precious moments. Every element should
feel like opening a handwritten letter — intimate, intentional, and impossible
to ignore.

The design language is editorial minimalism with emotional weight. Asymmetric
borders, offset shadows, and serif body text evoke craftsmanship. Sans-serif
headings in bold uppercase provide modern clarity without coldness. The overall
mood is warm, confident, and celebratory.

## Colors

- **Primary / Teal ({colors.primary}):** Primary text, headings, and UI
  structure. Deep enough for legibility on cream, calm enough to never feel
  aggressive.
- **Secondary / Teal-light ({colors.secondary}):** Secondary text, hover states,
  subtle borders, and metadata. Lighter than primary but from the same family.
- **Accent / Gold ({colors.accent}):** The only accent. CTAs, primary buttons,
  highlights, hover states. Used sparingly so it always signals "action" or
  "precious." Hover darkens to #C99A3C.
- **Neutral / Cream ({colors.neutral}):** The soul of the brand. Page
  background, canvas, and negative space. Never use pure white (#FFFFFF) —
  cream is warmer, more human, more memorable.
- **WhatsApp ({colors.whatsapp}):** Reserved exclusively for WhatsApp-related
  UI. Never used as a primary CTA color.

## Typography

Open Sans (weight 800, uppercase, -0.02em tracking) drives all headings.
It provides modern confidence without corporate coldness. Merriweather serif
(weight 400) handles all body text — it adds warmth and editorial gravitas
that sans-serif body text would kill.

The hero title uses a fluid `clamp()` so it scales gracefully from mobile
(40px) to desktop (64px) without breakpoint jumps. Price displays use the
largest scale (48px) in gold to anchor value perception.

## Layout

Spacing follows a warm, generous rhythm. Sections breathe with 80px vertical
padding as a baseline. The hero gets 128px to establish presence. Cards and
grids use 24px gaps. Nothing should feel cramped — the page should read like
poetry with generous line breaks.

Containers max out at 896px (max-w-4xl) for reading comfort, or 1024px
(max-w-5xl) for layouts with side-by-side elements. Horizontal padding goes
from 16px on mobile to 24px on tablet to 32px on desktop.

## Elevation & Depth

Shadows are soft and warm. The editorial shadow is the signature: offset
20px right and 20px down in teal at 5% opacity. It creates depth without
coldness. Gold glow uses `drop-shadow` filter for CTAs that need to pulse
with importance. No harsh drop shadows — everything should feel like paper
in soft light.

## Shapes

Most elements use standard rounded corners (4px–16px). The asymmetric border
(2px 40px 4px 60px) is the brand signature — used on feature cards, photo
frames, and editorial elements. It signals craft and human touch. Pill shapes
(round-full) are reserved for CTAs and badges.

## Components

- `cta-button` is the only high-emphasis action per screen. Gold, pill-shaped,
  with shimmer animation. Minimum 280px width on mobile.
- `card-editorial` uses the asymmetric border and offset shadow for feature
  highlights and testimonial cards.
- `card-default` is the standard surface: cream-tinted background, subtle
  teal border at 10% opacity, generous 32px padding.
- `input` uses white background for contrast against cream, teal border that
  turns gold on focus.
- `badge` is pill-shaped with gold-tinted background — used for labels,
  tags, and proof points.

## Do's and Don'ts

- **Do** use cream (#F4EEDC) as the page background. Never pure white.
- **Do** use Open Sans 800 uppercase for all headings. Never regular weight.
- **Do** use Merriweather serif for body text. Never sans-serif body.
- **Do** use gold only for CTAs and highlights. Never for body text.
- **Do** use asymmetric borders on at least one element per page.
- **Don't** introduce colors outside the palette. No blue, no green CTA.
- **Don't** use border-radius uniformly everywhere. Asymmetry is intentional.
- **Don't** use dark mode by default. The v2-theme is light and warm.
- **Don't** nest component variants. `cta-button-hover` is a sibling, not a child.
- **Don't** use placeholder names in static automation blocks.
