---
name: PrivacyPolicy.test
description: Smoke tests for app/privacy-policy/page — heading render, main landmark, key section headings, support email link
type: project
---

# AI Contract: __tests__/PrivacyPolicy.test.tsx

## Purpose
Smoke tests for `app/privacy-policy/page.tsx`. Verifies the page renders its heading, main landmark, key section headings, and the support email link.

## Allowed Responsibilities
- Render `PrivacyPolicyPage` directly (no async, no data fetching).
- Assert on heading text, ARIA roles, and link attributes.

## Not Allowed
- Do not test page content exhaustively — this is a static document.
- Do not make real network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders the "Privacy Policy" h1 heading.
- Renders within a `main` landmark.
- Renders key section headings (What Information Do We Collect, SMS Messaging/Consent).
- Renders a support email link pointing to `mailto:support@trytendr.org`.
