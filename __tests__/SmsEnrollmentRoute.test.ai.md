# AI Contract: __tests__/SmsEnrollmentRoute.test.ts

## Purpose
Integration tests for `app/api/sms-enrollment/route.ts` (POST handler). Verifies required-field validation, phone/email validation via `@/lib/validators`, E.164 normalization, consent field storage, IP/UA capture, consent-constant sourcing, and DB error handling.

## Allowed Responsibilities
- Mock `@/lib/supabase/server` to control DB insert outcomes.
- Mock `next/headers` to inject test IP and user-agent values.
- Assert on HTTP status codes, response bodies, and insert call arguments.

## Not Allowed
- Do not mock `@/lib/validators` — test that the route uses the real implementation.

## Public Interfaces
- No exports — test file only.

## Required Patterns
- `@jest-environment node` directive required.

## Tests Required
- Returns 201 on valid submission.
- Returns 400 for each missing required field and for blank required fields, including `first_name` and `last_name`.
- Writes `first_name`, `last_name`, and a computed `full_name` (`${first_name} ${last_name}`) to the inserted row.
- Trims whitespace on `first_name` and `last_name` (and the derived `full_name`) before storage.
- Returns 400 for malformed JSON body.
- Returns 400 when phone has fewer than 10 digits or no dialable digits.
- Returns 400 when email is provided but invalid.
- Accepts a phone with formatting characters and normalizes to E.164.
- Normalizes 11-digit phone to E.164.
- Stores IP address and user agent from headers.
- Stores consent constants from `lib/sms-consent`, not from the request body.
- Stores `sms_consent: true/false` correctly, including when field is omitted.
- Stores `null` for optional fields when omitted.
- Returns 500 when DB insert fails.
- Falls back to `x-real-ip` header for IP when `x-forwarded-for` is absent.
- Stores `null` for `ip_address` when both `x-forwarded-for` and `x-real-ip` are absent.
- Stores `null` for `user_agent` when the `user-agent` header is absent.
