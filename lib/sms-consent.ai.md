# AI Contract: lib/sms-consent.ts

## Purpose
Single source of truth for A2P 10DLC SMS consent constants: the consent disclosure text, its version string, and the canonical URLs for Terms, Privacy Policy, and the enrollment source. Imported by both the API route and the client form.

## Allowed Responsibilities
- Export `CONSENT_LANGUAGE` (the full A2P-compliant consent disclosure string).
- Export `CONSENT_LANGUAGE_VERSION` (a date string, e.g., `'2026-05-04'`).
- Export `TERMS_URL` and `PRIVACY_POLICY_URL` as absolute URLs.
- Export `ENROLLMENT_SOURCE_URL` derived from `process.env.NEXT_PUBLIC_SITE_URL` with fallback to `'https://trytendr.org'`.

## Not Allowed
- Do not add runtime logic beyond the constant definitions.
- Do not import from Supabase, Twilio, or any other service.
- Do not accept parameters or export functions; only constants.

## Public Interfaces
- `export const CONSENT_LANGUAGE: string`
- `export const CONSENT_LANGUAGE_VERSION: string`
- `export const TERMS_URL: string`
- `export const PRIVACY_POLICY_URL: string`
- `export const ENROLLMENT_SOURCE_URL: string`

## Required Patterns
- `CONSENT_LANGUAGE` must include all required A2P 10DLC disclosure elements: message type description, frequency variation warning, data rates notice, STOP/HELP instructions, and the statement that consent is not required.
- `ENROLLMENT_SOURCE_URL` must use `process.env.NEXT_PUBLIC_SITE_URL` with a `https://trytendr.org` fallback.
- `CONSENT_LANGUAGE_VERSION` must be updated whenever `CONSENT_LANGUAGE` is changed.

## Tests Required
- `CONSENT_LANGUAGE` contains the string "Reply STOP to cancel".
- `CONSENT_LANGUAGE` contains "not required to purchase or use warranty services".
- `CONSENT_LANGUAGE_VERSION` is a non-empty string.
- `TERMS_URL` and `PRIVACY_POLICY_URL` are absolute HTTPS URLs.
- `ENROLLMENT_SOURCE_URL` includes `/sms-enrollment`.

## Notes for AI Agents
- Changing `CONSENT_LANGUAGE` requires bumping `CONSENT_LANGUAGE_VERSION` and re-reviewing A2P 10DLC compliance requirements.
- Both `app/api/sms-enrollment/route.ts` and `app/sms-enrollment/SmsEnrollmentForm.tsx` import from this file. Changing exports here has immediate effect on both the stored consent record and the rendered form.
- `app/sms-consent-proof/page.tsx` has a local copy of the consent language for documentation purposes — keep it synchronized manually if the language changes.
