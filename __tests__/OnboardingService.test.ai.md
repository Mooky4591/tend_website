# AI Contract: __tests__/OnboardingService.test.ts

## Purpose
Unit tests for `lib/services/onboarding.ts` — verifies the full behaviour of `triggerOnboarding` including success path, SMS failure path, DB writes, and error returns. Failure status writes (`onboarding_status = 'failed'`, `failure_reason`) are not tested here because that responsibility was moved to a separate service repo.

## Tests Required
- Returns `null` on full success.
- Inserts a `conversations` row with `role: 'staff'` on success.
- Sets `onboarding_status = 'queued'` and `failure_reason = null` on success.
- Returns `{ status: 500 }` when `conversations.insert` fails on the success path.
- Returns `{ status: 500 }` when `users.update` fails on the success path.
- Returns `{ status: 502 }` when SMS fails.
- Does not update the `users` table on SMS failure.
- Does not insert a conversation row when SMS fails.
- Returns `{ status: 404 }` when homeowner is not found.
- Returns `{ status: 500 }` when tenant has no Twilio number.
