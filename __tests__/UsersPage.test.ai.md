---
name: UsersPage.test
description: Tests for app/dashboard/homeowners/page — server component rendering, auth redirect, homeowner rows, status badges, links
type: project
---

# AI Contract: __tests__/UsersPage.test.tsx

## Purpose
Integration tests for `app/dashboard/homeowners/page.tsx`. Verifies auth redirect, homeowner row rendering with name/phone, detail page links, status badges, null name fallback, and null safety.

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
- Links each homeowner name to their detail page (`/dashboard/homeowners/:id`).
- Shows correct status badge for each onboarding status (opted out, complete, queued, failed).
- Renders tooltip text in the DOM for non-failed statuses (opted_out, complete, queued, pending).
- Failed badge with `failure_reason = 'invalid_number' | 'landline' | 'disconnected'` shows "update their phone number" tooltip.
- Failed badge with `failure_reason = 'delivery_timeout' | 'network_error'` shows "retry option will be available" tooltip.
- Failed badge with `failure_reason = 'carrier_blocked' | 'account_error'` shows "support@trytendr.org" tooltip.
- Failed badge with `failure_reason = null` shows default "support@trytendr.org" tooltip.
- Shows "—" when both `first_name` and `last_name` are null.
- Renders `"first_name last_name"` when both name parts are present.
- Renders just `first_name` when `last_name` is null.
- Renders just `last_name` when `first_name` is null.
- Handles null homeowners response without crashing.
- Shows empty state when user has no tenant membership.
