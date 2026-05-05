---
name: CTA.test
description: Tests for components/CTA — section heading, contact anchor, Book a Demo link, Contact Sales link, disclaimer text
type: project
---

# AI Contract: __tests__/CTA.test.tsx

## Purpose
Unit tests for `components/CTA.tsx`. Verifies section heading (h2 with "Ready" text), `#contact` anchor ID, "Book a Demo" and "Contact Sales" links, 30-minute demo description, no-commitment disclaimer, and that Book a Demo has a non-empty href.

## Allowed Responsibilities
- Render `CTA` and assert on heading text, link presence/attributes, and body copy.

## Not Allowed
- Do not make network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders the section heading.
- Heading asks about readiness (contains "Ready").
- Section has the `contact` id.
- Renders a "Book a Demo" link.
- Renders a "Contact Sales" link.
- Renders the 30-minute demo description.
- Renders the "No commitment required" disclaimer.
- "Book a Demo" link has a non-empty href.
