---
name: marketing.spec
description: E2E tests for the marketing homepage (navigation, hamburger menu, anchor links) and static pages (terms, privacy-policy, sms-consent-proof)
type: project
---

# AI Contract: e2e/marketing.spec.ts

## Purpose
End-to-end tests for the public marketing site. Validates navigation rendering, mobile hamburger open/close behavior, link correctness, and that static pages load without error.

## Allowed Responsibilities
- Assert navigation renders Sign in and Book a Demo links.
- Assert desktop anchor nav links for Features, How It Works, Pricing, FAQ.
- Assert hamburger button toggles #mobile-menu visibility.
- Assert clicking Sign in navigates to /login.
- Assert /terms, /privacy-policy, and /sms-consent-proof each load and render an h1.

## Not Allowed
- Do not require authentication — all tests must work without a session.
- Do not test dashboard or API routes.
- Do not create or modify database records.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Sign in and Book a Demo links visible in header.
- Desktop nav anchor links for all four sections.
- Hamburger opens #mobile-menu on mobile viewport.
- Hamburger closes #mobile-menu when close button clicked.
- Mobile menu contains Sign in and Book a Demo links.
- Clicking Sign in navigates to /login.
- /terms renders h1.
- /privacy-policy renders h1.
- /sms-consent-proof renders h1.
