---
name: globals.css
description: Global CSS entry point — imports Tailwind directives, defines CSS custom properties for the design token system, and applies base body styles
type: project
---

## Responsibilities

- Import `@tailwind base`, `@tailwind components`, and `@tailwind utilities`.
- Define all CSS custom properties (palette vars as raw RGB channels, semantic role vars) in `:root`.
- Apply base styles via `@layer base` (body typography, background).
- Define custom utility classes via `@layer utilities` that cannot be expressed in `tailwind.config.ts`.

## Not Allowed

- Application-level styles or component-specific rules — those belong in component files.
- Hardcoded hex color values — all colors must use the CSS custom property system defined here.
- Overriding Tailwind's preflight resets in ways that break accessibility.
- Lowering the project browser target below Chrome 65 / Firefox 61 / Safari 12.1 without adding `@supports` fallbacks — the `rgb(var(--x) / <alpha-value>)` pattern (CSS variable chaining inside `rgb()`) is not supported below these versions and will silently produce transparent/invalid colours.

## Browser Support Note

Semantic tokens use CSS variable chaining: `--background: var(--p-sand)`, consumed by Tailwind as `rgb(var(--background) / <alpha-value>)`. This requires browsers to resolve nested `var()` references inside `rgb()`, which is fully supported from Chrome 65+, Firefox 61+, Safari 12.1+. The project has no explicit browserslist config; Next.js defaults to `last 2 Chrome/Firefox/Safari versions`, which is well above this threshold. If the target baseline is ever lowered, add `@supports (color: rgb(0 0 0 / 1))` guards or provide hex fallbacks.
