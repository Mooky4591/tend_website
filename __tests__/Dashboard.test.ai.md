---
name: Dashboard.test
description: Tests for app/dashboard/page — server component rendering, auth redirect, tenant name, user stat counts
type: project
---

# AI Contract: __tests__/Dashboard.test.tsx

## Purpose
Integration tests for `app/dashboard/page.tsx`. Verifies auth redirect, tenant name display, stat count calculations (total, fully provisioned, opted out), and null safety.

## Allowed Responsibilities
- Mock `@/lib/supabase/server` to control `getUser`, `tenant_users`, and `users` query outcomes.
- Mock `next/navigation` to intercept `redirect`.
- Assert on rendered text and stat values.

## Not Allowed
- Do not test business logic outside the page component.
- Do not make real network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Redirects to `/login` when unauthenticated.
- Renders the tenant name when authenticated.
- Falls back to "Dashboard" heading when tenant query returns null.
- Shows zero counts when there are no users.
- Counts fully provisioned (`onboarding_complete: true`) users correctly.
- Counts opted-out users correctly.
- Handles null users response without crashing.
