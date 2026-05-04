# AI Contract: components/HowItWorks.tsx

## Purpose
Marketing section component (`HowItWorks`) that renders three numbered process steps (01, 02, 03) in a card grid, with a decorative connector line on desktop. Anchored at `id="how-it-works"`.

## Allowed Responsibilities
- Define the `steps` array of `{ number, title, description, detail }` objects.
- Render a 3-column grid of step cards, each with a numbered bubble, title, description, and detail with a `CheckIcon`.
- Render the decorative horizontal connector line (hidden on mobile, `aria-hidden` on desktop).

## Not Allowed
- Do not add a `'use client'` directive; this is a static Server Component.
- Do not fetch step content; it is hardcoded.
- Do not add interactive behaviors to the steps.

## Public Interfaces
- `export default function HowItWorks(): JSX.Element`
- `function CheckIcon(): JSX.Element` — local, not exported.

## Required Patterns
- `<section id="how-it-works" aria-labelledby="how-it-works-heading">` for the Navigation anchor link.
- `id="how-it-works-heading"` on the `<h2>`.
- Connector line div has `aria-hidden="true"`.
- `CheckIcon` SVG has `aria-hidden="true"`.

## Tests Required
- Section has `id="how-it-works"`.
- Three step cards are rendered with step numbers "01", "02", "03".
- Each card shows title, description, and detail text.
- Connector line has `aria-hidden="true"`.

## Notes for AI Agents
- Step content lives in the `steps` array. Update that array for copy changes; do not change component structure.
- Navigation links `href="#how-it-works"` must match the `id` attribute on the section.
