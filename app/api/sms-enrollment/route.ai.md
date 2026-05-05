# AI Contract: app/api/sms-enrollment/route.ts

## Purpose
Public (unauthenticated) route handler that records a homeowner's SMS enrollment submission into the `sms_enrollments` table, including consent metadata from `@/lib/sms-consent`.

## Allowed Responsibilities
- Parse and validate the `SmsEnrollmentBody` request payload.
- Delegate phone normalization to `normalizePhone` from `@/lib/validators`.
- Delegate email format validation to `isValidEmail` from `@/lib/validators`.
- Capture `ip_address` and `user_agent` from request headers.
- Insert one row into `sms_enrollments` with all consent fields populated from `lib/sms-consent` constants.
- Return 201 on success.

## Not Allowed
- Do not require authentication; this is a public endpoint called by homeowners.
- Do not send an SMS confirmation from this route; that is handled by a background process.
- Do not accept or store `consent_language` or `consent_language_version` from the request body; always use `CONSENT_LANGUAGE` and `CONSENT_LANGUAGE_VERSION` from `@/lib/sms-consent`.
- Do not render JSX or HTML.

## Public Interfaces
- `export interface SmsEnrollmentBody` — the typed shape of the POST body.
- `export async function POST(request: NextRequest): Promise<NextResponse>`

## Required Patterns
- Required fields: `full_name`, `phone`, `home_address`, `warranty_provider`. Return 400 if any are missing/blank.
- Call `normalizePhone(phone)` from `@/lib/validators`; return 400 with `phoneResult.error` if `'error' in phoneResult`.
- Call `isValidEmail(email)` from `@/lib/validators` when email is provided; return 400 if invalid.
- `sms_consent` must be stored as `sms_consent === true` (boolean coercion).
- IP is extracted from `x-forwarded-for` (first entry) or `x-real-ip`.
- `CONSENT_LANGUAGE`, `CONSENT_LANGUAGE_VERSION`, `TERMS_URL`, `PRIVACY_POLICY_URL`, `ENROLLMENT_SOURCE_URL` must all be written to the row.

## Tests Required
- POST returns 400 when `full_name` is missing.
- POST returns 400 when `phone` has fewer than 10 digits.
- POST returns 400 when `email` is provided but invalid.
- POST normalizes a 10-digit phone to `+1` prefix.
- POST stores `sms_consent: false` when the field is omitted or falsy.
- POST stores consent constants from `lib/sms-consent`, not from request body.
- POST returns 201 `{ ok: true }` on success.
- POST returns 400 for a malformed JSON body.

## Notes for AI Agents
- The consent text and version live exclusively in `lib/sms-consent.ts`. Never hardcode them here or accept them from the client.
- Email is optional; a missing email field should insert `null`, not an empty string.
- If the A2P consent language changes, update `lib/sms-consent.ts` and bump `CONSENT_LANGUAGE_VERSION` — this route picks it up automatically.
