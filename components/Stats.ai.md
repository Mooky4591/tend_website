# AI Contract: components/Stats.tsx

## Purpose
Marketing section component (`Stats`) that renders four platform highlight statistics ("30+", "0", "100%", "Multi-tenant") using a `<dl>` definition list for proper screen-reader semantics. Each stat has a value, label, and detail line.

## Allowed Responsibilities
- Define the `stats` array of `{ value, label, detail }` objects.
- Render a 4-column `<dl>` grid.
- Use `<dt class="sr-only">` for the machine-readable label and a separate `aria-hidden` `<span>` for the visual label, avoiding double-announcement.

## Not Allowed
- Do not add a `'use client'` directive; this is a static Server Component.
- Do not fetch stat data; all values are hardcoded.
- Do not use `<dt>` for visual display (it is `sr-only`); the visual label span is `aria-hidden`.

## Public Interfaces
- `export default function Stats(): JSX.Element`

## Required Patterns
- `<section aria-label="Platform highlights">` (no `id` needed; this section has no Navigation anchor).
- `<dl>` with `<dt class="sr-only">{stat.label}</dt>` and `<dd>` containing the value and `aria-hidden` visual label.
- The visual label `<span>` has `aria-hidden="true"` to prevent double-announcement.

## Tests Required
- Four stat items are rendered.
- `<dt>` elements have the `sr-only` class.
- Visual label spans have `aria-hidden="true"`.
- `stat.value` is rendered in a `<span>` with `text-brand-600`.
- `stat.detail` is rendered below the value.

## Notes for AI Agents
- The dual `<dt sr-only>` + `aria-hidden` visual span pattern is intentional to prevent screen readers from announcing the label twice. Do not collapse them into a single visible `<dt>`.
- Stat values are strings ("30+", "Multi-tenant"), not numbers. Do not apply `toLocaleString()`.
