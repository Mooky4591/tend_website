---
name: sms-enrollment.spec
description: E2E tests for the public SMS enrollment form — field rendering, A2P compliance (consent unchecked by default), validation, and success/error states with mocked API
type: project
---

# AI Contract: e2e/sms-enrollment.spec.ts

## Purpose
End-to-end tests for the /sms-enrollment page. Covers form field presence, A2P compliance requirement that the consent checkbox is unchecked by default, client-side validation errors, and both success and error states from the POST /api/sms-enrollment endpoint.

## Allowed Responsibilities
- Assert all form fields are present.
- Assert consent checkbox is unchecked by default (A2P requirement).
- Assert empty-form submission shows required-field errors for full_name, phone, home_address, warranty_provider.
- Assert invalid phone shows phone format error.
- Assert invalid email shows email format error.
- Mock POST /api/sms-enrollment to test success and error states.
- Assert success screen differs based on whether consent was checked.
- Assert API error message appears in role=alert.

## Not Allowed
- Do not require authentication.
- Do not make real calls to POST /api/sms-enrollment (use page.route to mock).
- Do not test server-side validation logic (covered by SmsEnrollmentRoute.test.ts).

## Public Interfaces
- No exports — test file only.

## Tests Required
- All six form fields plus consent checkbox and submit button visible.
- Consent checkbox unchecked by default.
- Empty submit shows full_name, phone, home_address, warranty_provider errors.
- Invalid phone shows phone-error.
- Invalid email shows email-error.
- Success with consent shows opted-in confirmation (role=status).
- Success without consent shows non-consent confirmation (role=status).
- API 400 error shows the error message in role=alert.
