---
name: isolation.spec
description: E2E multi-tenant isolation tests — verifies that a tenant B user cannot read tenant A homeowners via the users list or direct URL, and that RLS is enforced end-to-end through the Next.js layer
type: project
---

# AI Contract: e2e/isolation.spec.ts

## Purpose
Security regression tests for row-level security. Confirms that the RLS policies prevent cross-tenant data leakage at the full-stack level (browser → Next.js → Supabase). These tests are the only layer that can catch an RLS misconfiguration — unit tests cannot.

## Allowed Responsibilities
- Use an empty storageState (no pre-auth) so tests can sign in as tenant B's user.
- Sign in as tenant B user (E2E_TEST_EMAIL_B / E2E_TEST_PASSWORD_B) in beforeEach.
- Skip all tests when E2E_TEST_EMAIL_B / E2E_TEST_PASSWORD_B env vars are absent.
- Skip individual tests when the required seed-state entry is absent.
- Assert tenant A homeowners (E2E Alice, E2E Bob, E2E Carol) are not visible on /dashboard/users for tenant B.
- Assert direct URL access to tenant A's homeowner detail page does not expose Alice's data.
- Assert tenant B's own homeowner (E2E Dave) is visible on /dashboard/users when signed in as tenant B.

## Not Allowed
- Do not use the tenant A storageState (e2e/.auth/user.json).
- Do not modify database state — read-only assertions only.
- Do not test server-side API logic directly — drive everything through the browser.

## Public Interfaces
- No exports — test file only.
- getSeedState() is a local helper that reads e2e/.seed-state.json and returns { aliceId, daveId } or null. Not exported.

## Environment Variables Required
- E2E_TEST_EMAIL_B (optional — tests skip gracefully when absent)
- E2E_TEST_PASSWORD_B (optional — tests skip gracefully when absent)
