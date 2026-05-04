# AI Contract: components/Features.tsx

## Purpose
Marketing section component (`Features`) that renders a 6-card grid of platform features using the hardcoded `features` array. Each card shows an SVG icon, title, and description. Anchored at `id="features"`.

## Allowed Responsibilities
- Define the `features` array of `{ title, description, icon }` objects.
- Render a responsive 3-column grid of feature cards.
- Render inline SVG icon components (`ChatIcon`, `BellIcon`, `ShieldIcon`, `BuildingIcon`, `CheckCircleIcon`, `ChartIcon`).

## Not Allowed
- Do not add a `'use client'` directive; this is a static Server Component.
- Do not fetch feature content from an API; all content is hardcoded.
- Do not add interactive behaviors to the cards.

## Public Interfaces
- `export default function Features(): JSX.Element`
- `interface Feature { title: string; description: string; icon: React.ReactNode }` — local interface.

## Required Patterns
- `<section id="features" aria-labelledby="features-heading">` for anchor targeting from Navigation.
- `id="features-heading"` on the `<h2>`.
- All SVG icons have `aria-hidden="true"`.

## Tests Required
- Section has `id="features"`.
- Six feature cards are rendered.
- Each card contains a title and description.
- All SVG icons have `aria-hidden="true"`.

## Notes for AI Agents
- Feature content is in the `features` array. Update that array to change copy; do not add conditional rendering logic.
- The icon components are purely decorative SVGs — do not add text alternatives to them.
