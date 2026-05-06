---
name: UsersPage.test
description: Tests for app/dashboard/users/page — server component rendering, auth redirect, homeowner rows, status badges, links
type: project
---

# AI Contract: __tests__/UsersPage.test.tsx

## Purpose
Integration tests for `app/dashboard/users/page.tsx`. Verifies auth redirect, homeowner row rendering with name/phone, detail page links, status badges, null name fallback, and null safety.

## Allowed Responsibilities
- Mock `@/lib/supabase/server` to control `getUser`, `tenant_users`, and `users` query outcomes.
- Mock `next/navigation` and `next/link` to intercept `redirect` and render anchor tags.
- Assert on rendered text, links, and badge content.

## Not Allowed
- Do not make real network requests.

## Required Patterns
- The `from()` mock must throw `new Error(\`Unexpected table: \${table}\`)` for any unhandled table name so accidental calls to unknown tables are caught immediately.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Redirects to `/login` when unauthenticated.
- Shows empty state and "0 total" when there are no homeowners.
- Renders a row for each homeowner with name and phone, and shows correct total count.
- Links each homeowner name to their detail page (`/dashboard/users/:id`).
- Shows correct status badge for each onboarding status (opted out, complete, queued, failed).
- Shows "—" when `first_name` is null.
- Handles null homeowners response without crashing.
- Shows empty state when user has no tenant membership.
