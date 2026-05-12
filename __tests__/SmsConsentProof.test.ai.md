---
name: SmsConsentProof.test
description: Smoke tests for app/sms-consent-proof/page — heading render, main landmark, consent disclosure text, form mockup
type: project
---

# AI Contract: __tests__/SmsConsentProof.test.tsx

## Purpose
Smoke tests for `app/sms-consent-proof/page.tsx`. Verifies the page renders its heading, main landmark, the A2P consent disclosure text, and the enrollment form mockup.

## Allowed Responsibilities
- Render `SmsConsentProofPage` directly (no async, no data fetching).
- Assert on heading text, ARIA roles, and static content.

## Not Allowed
- Do not test page content exhaustively — this is a static documentation page.
- Do not make real network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders the "Tendr SMS Consent Flow" h1 heading.
- Renders within a `main` landmark.
- Renders the consent disclosure text beginning with "By checking this box, I agree to receive SMS messages from Tendr".
- Renders the enrollment form mockup with its accessible label.
