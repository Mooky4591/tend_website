# AI Contract: __tests__/OnboardingService.test.ts

## Purpose
Unit tests for `lib/services/onboarding.ts` — verifies the full behaviour of `triggerOnboarding` including success path, failure path, DB writes, and error returns.

## Tests Required
- Returns `null` on full success.
- Inserts a `conversations` row with `role: 'staff'` on success.
- Sets `onboarding_status = 'queued'` and `failure_reason = null` on success.
- Returns `{ status: 502 }` when SMS fails.
- Sets `onboarding_status = 'failed'` with the correct `failure_reason` (landline, carrier_blocked, network_error tested).
- Does not insert a conversation row when SMS fails.
- Returns `{ status: 404 }` when homeowner is not found.
- Returns `{ status: 500 }` when tenant has no Twilio number.
