# Design system

Inherited from the "Hifdh Precision Tester" prototype. Do not drift without explicit discussion.

## Philosophy

Warm, grounded, dignified. Parchment background, deep ink foreground, restrained accents. The muṣḥaf tradition of illumination is suggested, not literal — subtle corner ornaments, ruled paper backdrop, a single teal-green hero.

**Never**: gaudy gradients on ayat surfaces, emoji-heavy gamification, shouty "XP" labels, aggressive red/green on every screen.

## Colors (oklch — defined in `src/index.css` under `@theme`)

### Surfaces
| Token | Value | Use |
|---|---|---|
| `bg` | `oklch(0.985 0.006 85)` | Page background (warm off-white) |
| `bg-sunk` | `oklch(0.965 0.008 85)` | Recessed surface (disabled chips) |
| `card` | `#ffffff` | Card surface |
| `hairline` | `oklch(0.90 0.008 85)` | Borders, dividers |
| `hairline-2` | `oklch(0.94 0.008 85)` | Faint grid lines (mushaf backdrop) |

### Ink (text)
| Token | Value | Use |
|---|---|---|
| `ink` | `oklch(0.22 0.015 265)` | Primary text, deep blue-black |
| `ink-soft` | `oklch(0.42 0.012 265)` | Secondary text |
| `ink-muted` | `oklch(0.58 0.010 265)` | Tertiary, metadata, eyebrows |

### Hero (brand accent — teal-green, mushaf-cover echo)
| Token | Use |
|---|---|
| `hero` | Primary CTA background |
| `hero-deep` | Emphasized hero text |
| `hero-soft` | Tinted surfaces |
| `hero-ink` | Hero-tinted text on soft backgrounds |

### Difficulty triad
Matched chroma/lightness, distinct hue — easy to recognize at a glance.
- **Easy** — sage green, hue 150
- **Medium** — warm amber, hue 70
- **Hard** — terracotta, hue 35

Each has `-soft` (background wash) and `-deep` (deep text) variants.

### Semantic
- `correct` — sage green, mirrors easy
- `incorrect` — warm red, hue 25
- `warn` — warm yellow-orange, hue 75

## Typography

| Font | Role | Package |
|---|---|---|
| **Plus Jakarta Sans** (400/500/600/700/800) | Latin UI | `@fontsource/plus-jakarta-sans` |
| **JetBrains Mono** (400/700) | Labels, numbers, eyebrows | `@fontsource/jetbrains-mono` |
| **Noto Naskh Arabic** (400/700) | Arabic UI chrome (buttons, small text) | `@fontsource/noto-naskh-arabic` |
| **Amiri** (400/700) | Arabic fallback | `@fontsource/amiri` |
| **Amiri Quran** (400) | Qurʾānic ayat — classical naskh with full tashkīl | `@fontsource/amiri-quran` |

**Rule**: Ayat always use **Amiri Quran**. UI Arabic chrome uses **Noto Naskh**. Never mix roles.

## Tailwind token access

All design tokens map to Tailwind utilities via Tailwind v4 `@theme`:
- `--color-ink` → `text-ink`, `bg-ink`, `border-ink`
- `--color-hero-deep` → `text-hero-deep`, `bg-hero-deep`
- `--font-arabic-ayah` → `font-arabic-ayah`
- `--radius-lg` → `rounded-lg` (overrides default)

## Radii

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 10px | small chips |
| `radius-md` | 14px | buttons |
| `radius-lg` | 20px | cards |
| `radius-xl` | 28px | hero cards |

## Shadows

Three tiers, all soft, no drama:
- `shadow-soft-sm` — chips, resting buttons
- `shadow-soft-md` — elevated cards
- `shadow-soft-lg` — modals, drawers

## Motion

Favor restraint. Default transition: `all 0.15s` on interactive elements. Cards: `all 0.2s`. No bouncy springs, no exaggerated easing.

## RTL

Arabic text always `dir="rtl"`. Use `text-right` for layout. Do not flip the entire app — the UI chrome stays LTR; only ayat content is RTL.

## Accessibility

- Color contrast: `ink` on `bg` passes WCAG AA (oklch(0.22) vs oklch(0.985)).
- Target size: min 44×44px for interactive elements.
- Focus ring: always visible, defaults to `hero` color.
- Arabic screen-reader labels: provide transliteration + translation as `aria-label`.

## Mushaf grid backdrop

A subtle ruled-paper motif appears behind Home / Onboarding / Results screens. Not a literal mushaf page — just a ghost of one. Implementation in `src/components/layout/MushafGrid.tsx`, uses CSS mask to fade at top and bottom.

## Illuminated corner ornaments

Small SVG filigrees appear in corners of "hero" cards (onboarding welcome, results). Four-fold symmetric, teal, hairline weight. See `IlluminatedCorners` in the prototype for reference — we port this in v1.
