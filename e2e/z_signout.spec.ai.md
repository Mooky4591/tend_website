---
name: z_signout.spec
description: E2E sign-out tests that run last (z_ prefix) using a fresh login rather than stored auth state, to avoid invalidating the shared session for other authenticated tests
type: project
---

# AI Contract: e2e/z_signout.spec.ts

## Purpose
End-to-end tests for the sign-out flow. These run last (after all other spec files, by alphabetical sort) and intentionally do NOT use storageState. Each test logs in fresh, signs out, and verifies the redirect. This prevents Supabase's global sign-out from revoking the refresh token in e2e/.auth/user.json before other authenticated tests complete.

## Allowed Responsibilities
- Do a fresh login using E2E_TEST_EMAIL and E2E_TEST_PASSWORD for each test.
- Click the Sign out button and assert redirect to /login.
- Assert that /dashboard redirects to /login after sign-out.
- Skip tests gracefully if env vars are not set.

## Not Allowed
- Do not use storageState: 'e2e/.auth/user.json' — would invalidate the session for other tests.
- Do not run before other spec files complete (enforced by the z_ filename prefix).
- Do not test other dashboard functionality here.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Signing in then clicking Sign out navigates to /login.
- After sign-out, navigating to /dashboard redirects to /login.
