---
name: SmsEnrollmentPage.test
description: Tests for app/sms-enrollment/SmsEnrollmentForm — field rendering, consent checkbox, validation, fetch call, success/error messages, loading state
type: project
---

# AI Contract: __tests__/SmsEnrollmentPage.test.tsx

## Purpose
Unit tests for `app/sms-enrollment/SmsEnrollmentForm.tsx`. Verifies field and button rendering, SMS consent checkbox state, A2P consent language display, form submission with correct `sms_consent` value, client-side phone/email validation via `@/lib/validators`, success messages (opted-in and no-consent variants), API error display, and loading state.

## Allowed Responsibilities
- Stub `global.fetch` to control submission outcomes.
- Import and assert on `CONSENT_LANGUAGE`, `TERMS_URL`, `PRIVACY_POLICY_URL` from `@/lib/sms-consent`.
- Assert on field values, button state, and rendered messages.

## Not Allowed
- Do not mock `@/lib/validators` — tests exercise the real validation path.
- Do not make real network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders all heading fields and submit button.
- SMS consent checkbox is unchecked by default.
- Renders the full A2P consent language from `CONSENT_LANGUAGE`.
- Renders the Terms link with correct href.
- Renders the Privacy Policy link with correct href.
- Allows the consent checkbox to be toggled.
- Submits with `sms_consent: true` when checkbox is checked.
- Submits with `sms_consent: false` when checkbox is left unchecked.
- Shows the opted-in success message when consent was given.
- Shows the no-consent success message when checkbox was left unchecked.
- Shows an error message when the API returns an error.
- Does not call fetch when required fields are empty.
- Shows a field error when phone has fewer than 10 digits.
- Shows a field error when email is malformed.
- Disables the submit button while submitting.
- Shows "Network error" message when fetch throws (catch-block coverage).
- Shows "Submission failed. Please try again." fallback when API error response has no `error` field.
- Includes the optional `system_or_appliance` value in the submission body when the field is filled in.
