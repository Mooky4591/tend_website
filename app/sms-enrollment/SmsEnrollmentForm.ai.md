# AI Contract: app/sms-enrollment/SmsEnrollmentForm.tsx

## Purpose
Client Component (`SmsEnrollmentForm`) that collects homeowner SMS enrollment data, validates it client-side, and posts to `/api/sms-enrollment`. Uses `CONSENT_LANGUAGE`, `TERMS_URL`, and `PRIVACY_POLICY_URL` from `@/lib/sms-consent` to render the A2P consent checkbox.

## Allowed Responsibilities
- Manage `FormState` and `FieldErrors` state.
- Client-side validate required fields (`full_name`, `phone`, `home_address`, `warranty_provider`) and optional fields (`email`, `system_or_appliance`).
- Validate email format when provided; validate phone has at least 10 digits.
- POST `FormState` JSON to `/api/sms-enrollment`.
- Render success state with different copy depending on `form.sms_consent`.
- Render the consent checkbox using `CONSENT_LANGUAGE` from `lib/sms-consent`.

## Not Allowed
- Do not hardcode the consent language text; always import from `@/lib/sms-consent`.
- Do not pre-check the `sms_consent` checkbox; it must start `false`.
- Do not call Supabase directly.
- Do not normalize the phone number to E.164 here; that normalization belongs in the API route.

## Public Interfaces
- `export default function SmsEnrollmentForm(): JSX.Element`
- `interface FormState` — local interface.
- `interface FieldErrors` — local interface.

## Required Patterns
- `'use client'` directive required.
- `sms_consent` starts as `false` in the `empty` constant.
- Each required field input has `aria-invalid` and `aria-describedby` pointing to a `role="alert"` error paragraph.
- Success state uses `role="status"` on the outer div.
- Global error alert uses `role="alert"`.
- Terms and Privacy Policy links use `TERMS_URL` and `PRIVACY_POLICY_URL` from `lib/sms-consent`.

## Tests Required
- `sms_consent` checkbox starts unchecked.
- Submitting without `full_name` shows a field-level error.
- Submitting with a phone under 10 digits shows a phone error.
- Submitting with an invalid email format shows an email error.
- Successful submission shows the success state.
- Success copy differs when `sms_consent === true` vs `false`.
- Submit button is disabled while `submitting === true`.
- Network error displays a generic error message.

## Notes for AI Agents
- The consent language must always come from `lib/sms-consent.ts`. Never inline or paraphrase it in this component.
- The `sms_consent` checkbox must not be pre-checked — this is a regulatory requirement (A2P 10DLC).
