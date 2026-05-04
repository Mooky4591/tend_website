# AI Contract: app/page.tsx

## Purpose
Root marketing page (`Home`) that composes the public-facing landing page sections in order: Navigation, Hero, Stats, HowItWorks, Features, ForHomeowners, Pricing, FAQ, CTA, and Footer. Includes a skip-to-main-content link for accessibility.

## Allowed Responsibilities
- Import and render each marketing section component in the correct order.
- Render a visually hidden skip link targeting `#main-content`.
- Wrap page sections in `<main id="main-content">`.

## Not Allowed
- Do not add data fetching; all section components are static.
- Do not add authentication logic or redirects.
- Do not inline section content; each section belongs in its own component under `components/`.
- Do not add a `'use client'` directive; this must remain a Server Component.

## Public Interfaces
- `export default function Home(): JSX.Element`

## Required Patterns
- Skip link must have `href="#main-content"` and use the `sr-only focus:not-sr-only` pattern.
- `<main id="main-content">` wraps Hero through CTA.
- Component import order must match render order: Navigation → Hero → Stats → HowItWorks → Features → ForHomeowners → Pricing → FAQ → CTA → Footer.

## Tests Required
- Renders a skip link with `href="#main-content"`.
- `<main>` element has `id="main-content"`.
- All ten section components are present in the rendered output.

## Notes for AI Agents
- The landing page is fully static. Do not introduce dynamic data fetching or client-side hooks here.
- Adding a new section requires both a new component file and an import here in the correct position.
