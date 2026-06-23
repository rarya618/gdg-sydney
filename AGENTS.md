# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run dev        # Start dev server at localhost:4321
npm run build      # Build to ./dist/
npm run preview    # Preview production build
npm run astro ...  # Run Astro CLI commands (e.g. astro add, astro check)
```

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Architecture

This is an [Astro 7](https://astro.build) project with React and Tailwind CSS 4.

**Key integrations:**
- **React** (`@astrojs/react`) — React components can be used inside `.astro` files with island hydration directives (`client:load`, `client:visible`, etc.)
- **Tailwind CSS 4** — configured via `@tailwindcss/vite` Vite plugin (not PostCSS); no `tailwind.config.*` file needed
- **TypeScript** — strict mode via `astro/tsconfigs/strict`; JSX is configured for React (`react-jsx`)

**Routing:** File-based. Files in `src/pages/` become routes automatically (`.astro` or `.md`).

**Styling:** Global styles live in `src/styles/global.css`. Tailwind utility classes work in both `.astro` and React components.

**Static assets:** Files in `public/` are served at the root path.

## Branding

See [BRANDING.md](./BRANDING.md) for the full brand guide. Key points:

- Typefaces: **Google Sans** (headings bold, body regular) and **Google Sans Mono / Roboto Mono** for code-style accents (`font-mono`)
- Core colors: Blue `#4285F4`, Green `#34A853`, Yellow `#f9ab00`, Red `#EA4335` — available as Tailwind utilities (`text-google-blue`, `bg-google-red`, etc.)
- The yellow is `#f9ab00` (Yellow 600), **not** `#FBBC05`
- Name: **GDG Sydney** (not abbreviated on first use: Google Developer Group Sydney)

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
