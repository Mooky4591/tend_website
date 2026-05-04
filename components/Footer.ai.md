# AI Contract: components/Footer.tsx

## Purpose
Marketing `<footer>` component (`Footer`) that renders three navigation link groups (Product, Company, Legal) plus a brand column and a copyright bar. Legal links point to `/privacy-policy` and `/terms`; product links point to page section anchors.

## Allowed Responsibilities
- Define `productLinks`, `companyLinks`, and `legalLinks` arrays.
- Render four columns: brand, Product nav, Company nav, Legal nav.
- Apply `target="_blank" rel="noopener noreferrer"` for external links (detected by `href.startsWith('http')`).
- Render copyright year via `new Date().getFullYear()`.

## Not Allowed
- Do not add a `'use client'` directive; this is a static Server Component.
- Do not fetch navigation data; all links are hardcoded.
- Do not render `<Link>` from Next.js; use plain `<a>` elements.

## Public Interfaces
- `export default function Footer(): JSX.Element`

## Required Patterns
- `role="contentinfo"` on `<footer>`.
- Each nav group has `aria-label` ("Product links", "Company links", "Legal links").
- Copyright notice uses `new Date().getFullYear()`.
- About and Contact company links are currently placeholders (`href="#"` and `href="#contact"`); comments mark them as such.

## Tests Required
- `<footer>` has `role="contentinfo"`.
- Privacy Policy link has `href="/privacy-policy"`.
- Terms of Use link has `href="/terms"`.
- External links (`href.startsWith('http')`) have `target="_blank"` and `rel="noopener noreferrer"`.
- Copyright year matches the current year.

## Notes for AI Agents
- The Company "About" link (`href="#"`) is a placeholder. When an About page is built, update `companyLinks`.
- Product links target section anchor IDs (`#features`, `#how-it-works`, `#pricing`, `#faq`). These must match the `id` attributes on the corresponding section components.
