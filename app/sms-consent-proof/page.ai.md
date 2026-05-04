# AI Contract: app/sms-consent-proof/page.tsx

## Purpose
Static Server Component page (`SmsConsentProofPage`) that documents the Tendr A2P 10DLC SMS consent flow for carrier/TCR compliance review. Shows a mockup enrollment form, confirmation screen, example confirmation SMS, stored record fields, and consent requirements — all as non-interactive UI.

## Allowed Responsibilities
- Export `metadata` with title and description.
- Render the four-step consent proof documentation: enrollment form mockup, confirmation screen, example SMS, stored fields list, and consent requirements.
- Display the full `consentDisclosure` string (sourced from a local constant, not from `lib/sms-consent`).
- Link to `https://trytendr.org/terms` and `https://trytendr.org/privacy-policy`.

## Not Allowed
- Do not add a `'use client'` directive; this is a static Server Component.
- Do not submit any data; all form elements use `readOnly`.
- Do not import from `lib/sms-consent`; the consent language is duplicated here intentionally as a self-contained proof document.
- Do not add interactivity to the mockup form.

## Public Interfaces
- `export const metadata: { title: string; description: string }`
- `export default function SmsConsentProofPage(): JSX.Element`
- `const consentDisclosure: string` — local constant matching A2P disclosure language.

## Required Patterns
- All form inputs in the mockup use `readOnly`.
- The SMS consent checkbox in the mockup is unchecked (`type="checkbox" readOnly` without `defaultChecked`).
- The page renders without any data fetching or dynamic content.

## Tests Required
- Page renders without throwing.
- `<h1>` contains "Tendr SMS Consent Flow".
- The enrollment form mockup contains a checkbox that is not checked.
- Terms and Privacy Policy URLs link to `https://trytendr.org/terms` and `https://trytendr.org/privacy-policy`.
- The list of stored opt-in record fields is present (name, phone, consent timestamp, source URL, etc.).

## Notes for AI Agents
- This page is a proof-of-compliance document, not a production enrollment flow. The real enrollment form is at `app/sms-enrollment/`.
- If the consent language changes in `lib/sms-consent.ts`, the `consentDisclosure` constant here must also be updated to stay consistent with the live form.
