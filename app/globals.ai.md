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
