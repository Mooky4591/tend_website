# AI Contract: __tests__/AdminResolveOnboardingGapRoute.test.ts

## Purpose
Unit tests for `app/api/admin/onboarding-gaps/[userId]/resolve/route.ts`. Verifies that the
POST handler rejects unauthenticated requests (303 to /admin/login), sets
`onboarding_gap_flagged = false` on the users row, and redirects to /admin/onboarding-gaps
with status 303 on success.
