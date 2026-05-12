---
name: Terms.test
description: Smoke tests for app/terms/page — heading render, main landmark, support email link
type: project
---

# AI Contract: __tests__/Terms.test.tsx

## Purpose
Smoke tests for `app/terms/page.tsx`. Verifies the page renders its heading, main landmark, and support email link.

## Allowed Responsibilities
- Render `TermsPage` directly (no async, no data fetching).
- Assert on heading text, ARIA roles, and link attributes.

## Not Allowed
- Do not test page content exhaustively — this is a static document.
- Do not make real network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders a heading containing "Terms of Use".
- Renders within a `main` landmark.
- Renders a support email link pointing to `mailto:support@trytendr.org`.
