---
name: Pricing.test
description: Tests for components/Pricing — section heading, per-active-user model, highlights, inactive-user note, CTA link, no dollar amounts or tier names
type: project
---

# AI Contract: __tests__/Pricing.test.tsx

## Purpose
Unit tests for `components/Pricing.tsx`. Verifies section heading communicating the per-active-user model, `#pricing` anchor, body copy explaining the model, three highlight items, inactive-user disclaimer, contact CTA link, absence of dollar amounts, and absence of plan tier names (Starter, Growth, Enterprise).

## Allowed Responsibilities
- Render `Pricing` and assert on headings, text content, link attributes, and absent content.

## Not Allowed
- Do not make network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders the section heading.
- Section has the `pricing` id.
- Heading communicates "actually using it" (per-active-user model).
- Body copy explains "per active user, per month" model.
- Renders "Pay per active user" highlight.
- Renders "Scales with your business" highlight.
- Renders "Everything included" highlight.
- Explains that inactive users do not count.
- Renders a "Contact us for a quote" CTA link pointing to `#contact`.
- Does not display any specific prices (no `$\d` pattern).
- Does not mention Starter, Growth, or Enterprise tier names.
