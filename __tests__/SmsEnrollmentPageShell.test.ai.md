---
name: SmsEnrollmentPageShell.test
description: Shell render tests for app/sms-enrollment/page — heading, main landmark, Navigation, SmsEnrollmentForm presence
type: project
---

# AI Contract: __tests__/SmsEnrollmentPageShell.test.tsx

## Purpose
Shell render tests for `app/sms-enrollment/page.tsx`. Verifies the page composes Navigation, the main landmark with heading, and SmsEnrollmentForm correctly. SmsEnrollmentForm internals are tested separately in `SmsEnrollmentPage.test.tsx`.

## Allowed Responsibilities
- Mock `Navigation`, `Footer`, and `SmsEnrollmentForm` as stubs.
- Assert on heading text, ARIA landmarks, and child component presence.

## Not Allowed
- Do not test SmsEnrollmentForm internals — they are stubbed.
- Do not test Footer internals.
- Do not make real network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders the "Enroll in Tendr SMS Home Warranty Assistance" h1 heading.
- Renders within a `main` landmark.
- Renders the SmsEnrollmentForm stub.
- Renders the Navigation stub.
