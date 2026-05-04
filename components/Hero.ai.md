# AI Contract: components/Hero.tsx

## Purpose
Marketing hero section component (`Hero`) that renders the primary headline, subline, two CTA links, and a `PhoneMockup` sub-component showing an example SMS onboarding conversation. Does not have a section `id` anchor (it is the topmost section).

## Allowed Responsibilities
- Define `smsMessages` array used by `PhoneMockup`.
- Render the hero section with headline (`id="hero-headline"`), subline, and two CTA links.
- Render `PhoneMockup` as a decorative `role="img"` element with `aria-label`.
- Render background gradient and grid pattern decorations as `aria-hidden`.

## Not Allowed
- Do not add a `'use client'` directive; this is a static Server Component.
- Do not add form or interactive elements.
- Do not fetch data.

## Public Interfaces
- `export default function Hero(): JSX.Element`
- `function PhoneMockup(): JSX.Element` — local, not exported.

## Required Patterns
- `<section aria-labelledby="hero-headline">` (no `id` anchor needed, it's the page top).
- `PhoneMockup` outer div has `role="img" aria-label="Example SMS conversation with Tendr"`.
- Background elements have `aria-hidden="true"`.
- "Book a Demo" link points to `#contact`; "See How It Works" points to `#how-it-works`.
- Bottom fade `<div>` is `aria-hidden="true"`.

## Tests Required
- Section has `aria-labelledby="hero-headline"`.
- `id="hero-headline"` is on the `<h1>`.
- "Book a Demo" `href="#contact"` is rendered.
- "See How It Works" `href="#how-it-works"` is rendered.
- `PhoneMockup` has `role="img"` with an `aria-label`.
- `smsMessages` produces the expected number of message bubbles.

## Notes for AI Agents
- `smsMessages` is the example conversation script inside `PhoneMockup`. Edit it for copy changes only.
- The "2 days later" divider uses `msg.time === '2 days later'` as a sentinel value. Do not use that literal for real timestamps.
