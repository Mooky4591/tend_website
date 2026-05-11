# AI Contract: __tests__/OnboardingRoute.test.ts

## Purpose
Unit tests for `app/api/users/[id]/onboarding/route.ts` — verifies auth, admin enforcement, input validation, and HTTP response mapping.

## Tests Required
- Returns 401 when unauthenticated.
- Returns 403 when caller is not an admin.
- Returns 400 when `message` is missing.
- Returns 400 when `message` is blank/whitespace.
- Returns 200 `{ ok: true }` on success.
- Returns 404 when service returns 404.
- Returns 502 when service returns 502.
