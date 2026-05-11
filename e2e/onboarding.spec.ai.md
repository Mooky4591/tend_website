---
name: onboarding.spec
description: E2E tests for onboarding failure tracking — failed badge tooltip hover behaviour and POST /api/users/[id]/onboarding HTTP contract
type: project
---

# AI Contract: e2e/onboarding.spec.ts

## Purpose
End-to-end tests for onboarding failure tracking. Verifies that failed status badges show the correct context-aware tooltip on hover, and that the onboarding API route enforces auth, input validation, and returns meaningful errors in the E2E environment (which has no Twilio number configured).

## Allowed Responsibilities
- Use storageState: 'e2e/.auth/user.json' for all tests.
- Read e2e/.seed-state.json (via getSeedState) for seeded user IDs; skip tests when the file is absent or an ID is missing.
- Navigate to /dashboard/users and hover over failed-status badge spans.
- Assert tooltip text becomes visible after hover (CSS group-hover).
- Use the `request` fixture (no cookies) for the unauthenticated 401 test.
- Use `page.request` (shares browser session cookies) for authenticated API tests.

## Not Allowed
- Do not send real SMS — the E2E tenant has no Twilio number, which is intentional.
- Do not assert on Twilio-specific error messages beyond a pattern match for "Twilio".
- Do not create or delete homeowner records — that is the seed script's job.

## Public Interfaces
- No exports — test file only.
- getSeedState() is a local helper that reads e2e/.seed-state.json and returns SeedState | null.

## Tests Required

### Tooltip hover
- E2E Eva (failure_reason: invalid_number) → "update their phone number" tooltip visible after hover.
- E2E Frank (failure_reason: delivery_timeout) → "retry option will be available" tooltip visible after hover.
- E2E Grace (failure_reason: carrier_blocked) → "support@trytendr.org" tooltip visible after hover.
- All three failed users show a "Failed" badge in the table.
- Hovering Eva's badge does not show Grace's support tooltip (tooltips are row-scoped).

### API contract
- No session → 401.
- Missing message → 400.
- Blank message → 400.
- Non-existent user ID → 404.
- Valid auth + valid message + no Twilio number (E2E environment) → 500 with error matching /Twilio/i.

## Seed State Dependencies
- evaId   — failed user with failure_reason = 'invalid_number'
- frankId — failed user with failure_reason = 'delivery_timeout'
- graceId — failed user with failure_reason = 'carrier_blocked'

(All three are seeded by e2e/seed.ts in seedHomeowners.)
