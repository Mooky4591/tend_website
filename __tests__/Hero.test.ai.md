---
name: Hero.test
description: Tests for components/Hero — h1 headline, CTA links, phone mockup accessibility, section landmark, disclaimer text, SMS badge
type: project
---

# AI Contract: __tests__/Hero.test.tsx

## Purpose
Unit tests for `components/Hero.tsx`. Verifies main headline (h1 with "homeowners" text), SMS subheadline, "Book a Demo" link to `#contact`, "See How It Works" link to `#how-it-works`, phone mockup accessible image, section landmark with aria-labelledby, no-commitment disclaimer, and SMS "No App Required" badge.

## Allowed Responsibilities
- Render `Hero` and assert on headings, link hrefs, ARIA roles/labels, and text content.

## Not Allowed
- Do not make network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders the main headline (h1).
- Headline contains "homeowners".
- Renders the subheadline with SMS mention.
- Renders a "Book a Demo" CTA link pointing to `#contact`.
- Renders a "See How It Works" link pointing to `#how-it-works`.
- Phone mockup has an accessible role and label (img role, "SMS conversation").
- Renders the section landmark named by the hero headline.
- Renders the "No commitment required" disclaimer text.
- Renders the "No App Required" SMS badge.
