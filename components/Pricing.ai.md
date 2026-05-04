# AI Contract: components/Pricing.tsx

## Purpose
Marketing section component (`Pricing`) that explains the per-active-user pricing model through three highlight cards and a contact CTA. No price figures are displayed; visitors are directed to contact sales for a quote. Anchored at `id="pricing"`.

## Allowed Responsibilities
- Define and render the `highlights` array (3 items: "Pay per active user", "Scales with your business", "Everything included").
- Render the pricing headline and explanation copy.
- Render a branded CTA box with a "Contact us for a quote" link pointing to `#contact`.

## Not Allowed
- Do not add a `'use client'` directive; this is a static Server Component.
- Do not display specific price amounts or tiers.
- Do not add a pricing form or payment integration.
- Do not fetch pricing data.

## Public Interfaces
- `export default function Pricing(): JSX.Element`

## Required Patterns
- `<section id="pricing" aria-labelledby="pricing-heading">` for Navigation anchor.
- `id="pricing-heading"` on the `<h2>`.
- "Contact us for a quote" link points to `href="#contact"`.
- Highlight card icons are inline SVGs with `aria-hidden="true"`.

## Tests Required
- Section has `id="pricing"`.
- Three highlight cards are rendered.
- "Contact us for a quote" link has `href="#contact"`.
- SVG icons have `aria-hidden="true"`.

## Notes for AI Agents
- If specific pricing tiers are added in the future, the contract and component structure must be updated.
- The `#contact` anchor targets `components/CTA.tsx`'s `id="contact"` section.
