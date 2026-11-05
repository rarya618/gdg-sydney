# GDG Brand Guide — DevFest Sydney

Source: [External] Google Developer Groups - Brand Guide for Organizers

## Brand Messaging

- The program umbrella name is **Google Developer Groups** (never abbreviated on first use).
- Each group is **Google Developer Group [City]** or **GDG [City]** — e.g. GDG Sydney.
- On social media, organisers are **GDG Organizer** (not GDG Lead or Google Developer Group Lead).

## Typography

### Primary — Google Sans
The main typeface. Use **Bold** for titles and large sentences; **Regular** for body copy and smaller text. Do not use Bold for everything — the contrast between weights is intentional.

| Weight | Use |
|--------|-----|
| Regular (400) | Body copy, captions, form labels |
| Medium (500) | Nav links, small UI labels |
| Bold (700) | Headings, CTAs, hero text |

Only these three weights (plus their italics) have font files. Don't use other values such as 600 or 800: there's no file for them, so the browser substitutes Bold 700 and the CSS no longer says what actually renders.

### Secondary — Google Sans Mono (Roboto Mono substitute)
Used for short lines, speaker names, data labels, and anywhere a "code-style" feel is needed. Not for long-form body copy.

**Implementation:** Self-hosted TTF files in `public/fonts/` (`GoogleSans-*`, `GoogleSansText-*`, `GoogleSansMono-*`), declared with `@font-face` in `src/styles/global.css`. Nothing is loaded from Google Fonts. The families are applied through two CSS variables in `src/layouts/SiteLayout.astro`:

- `--sans: 'Google Sans', 'Google Sans Text', system-ui, ...` for everything
- `--mono: 'Google Sans Mono', 'Roboto Mono', monospace` for code-style accents

Roboto Mono is only a named fallback in that stack; it isn't loaded. Google Sans Text is declared but only used if Google Sans fails to load.

## Color Palette

### Core Colors (use these for all digital work)

| Name | Hex | Usage |
|------|-----|-------|
| Blue 500 | `#4285F4` | Primary CTA, links, Developer Track accent |
| Green 500 | `#34A853` | Success states, Builder Track accent |
| Yellow 600 | `#f9ab00` | Warnings, Builder Showcase accent |
| Red 500 | `#EA4335` | Errors, Speaker/CfS accent |

### Halftone Colors

| Name | Hex |
|------|-----|
| Halftone Blue | `#57caff` |
| Halftone Green | `#5cdb6d` |
| Halftone Yellow | `#ffd427` |
| Halftone Red | `#ff7daf` |

### Pastel Colors

| Name | Hex |
|------|-----|
| Pastel Blue | `#c3ecf6` |
| Pastel Green | `#ccf6c5` |
| Pastel Yellow | `#ffe7a5` |
| Pastel Red | `#f8d8d8` |

### Greyscale

| Name | Hex |
|------|-----|
| Off White | `#f0f0f0` |
| Black 02 | `#1e1e1e` |

> CMYK values are for print only. Use RGB/hex for all digital work.

## Logo

- The **horizontal logo** is preferred.
- The **stacked logo** is an alternative when space is limited.
- Both formats must maintain a strong visual affiliation with Google.
- Do not alter, recolour, or distort the logo.

## Implementation Notes

- The site is **dark only**. Colours are CSS variables defined once in `src/layouts/SiteLayout.astro`; change the palette there, not in individual pages. There are no Tailwind colour utilities (no `text-google-blue` etc.) and no `tailwind.config.*` file.
- Core colours: `--blue`, `--green`, `--yellow`, `--red`. Use them for fills, borders, bars and buttons.
- The yellow in the codebase is `#f9ab00` (Yellow 600), **not** `#FBBC05`.
- On the dark background the core blue, red and green are too dim for small text. For coloured **text**, use the text-safe tints (Google's dark-theme 300 tones): `--blue-text` `#8ab4f8`, `--red-text` `#f28b82`, `--green-text` `#81c995`, `--yellow-text` `#fdd663`.
- Text on a solid core-colour fill (for example the DevFest room blocks) uses `--on-accent` (`#1e1e1e`), since white fails contrast on yellow and green.
- Neutral tokens: `--bg` `#1e1e1e` (Black 02, the page), `--ink` `#141414` (deeper bands), `--surface` `#272727` (cards, inputs), `--surface-2` `#303030` (raised, hover), `--fg` `#f0f0f0` (Off White, headings), `--text` `#d6d6d4`, `--text-soft` `#b4b4b0`, `--muted` `#9aa0a6`, `--border` `rgba(255, 255, 255, 0.1)`.
- For code-style accents use `font-family: var(--mono)`, not Tailwind's `font-mono` class (that gives Tailwind's default monospace, not Google Sans Mono).
- The header logo is `public/gdg-logo-dark.png` (the version for dark backgrounds), picked up by `src/lib/logo.ts`. Don't recolour the light-background version.
