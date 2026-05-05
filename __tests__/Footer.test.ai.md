---
name: Footer.test
description: Tests for components/Footer — contentinfo role, brand name, nav links, legal links, copyright year, accessibility
type: project
---

# AI Contract: __tests__/Footer.test.tsx

## Purpose
Unit tests for `components/Footer.tsx`. Verifies contentinfo landmark, brand name, tagline, copyright notice with current year, product/company/legal nav links with correct hrefs, no new-tab attributes on legal links, and labelled navigation regions.

## Allowed Responsibilities
- Render `Footer` and assert on landmark roles, text, link hrefs, and ARIA attributes.

## Not Allowed
- Do not make network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders with `contentinfo` role.
- Renders the "Tendr" brand name.
- Renders the tagline mentioning "AI-powered home care".
- Renders copyright notice with "All rights reserved".
- Copyright year matches current year.
- Renders all four product nav links (Features, How It Works, Pricing, FAQ).
- Product links point to correct section anchors (#features, #how-it-works, #pricing, #faq).
- Renders company nav links (About, Contact).
- Renders legal links (Privacy Policy, Terms of Use).
- Legal links point to `/privacy-policy` and `/terms`.
- Legal policy links stay internal (no `target="_blank"` or `rel="noopener noreferrer"`).
- Has labelled navigation regions (Product links, Company links, Legal links).
