---
name: page.test
description: Tests for app/page — marketing home page structure, section anchors, CTAs, accessibility (skip link, main landmark)
type: project
---

# AI Contract: __tests__/page.test.tsx

## Purpose
Smoke and structure tests for `app/page.tsx` (marketing home page). Verifies the page renders, contains required landmarks (main, banner, contentinfo), H1 headline, all section anchor IDs, Book a Demo CTAs, section headings, no "undefined" text, skip-to-main-content link, and matching main landmark ID.

## Allowed Responsibilities
- Render `Home` and assert on DOM structure, roles, and text.

## Not Allowed
- Do not test individual section component internals — those are covered in dedicated tests.
- Do not make network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders without crashing.
- Renders the main landmark.
- Renders navigation (banner role).
- Renders footer (contentinfo role).
- Renders the hero headline (h1).
- Renders all section anchors: how-it-works, features, pricing, faq, contact.
- Renders at least one "Book a Demo" CTA link.
- Page contains at least 5 section headings (h2).
- Does not render any "undefined" text.
- Renders a skip-to-main-content link pointing to `#main-content` (WCAG 2.4.1).
- Main landmark has `id="main-content"` matching the skip link target.
