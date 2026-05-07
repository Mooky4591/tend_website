---
name: BillingPage.test
description: Tests for app/dashboard/billing/page — server component rendering, auth redirect, snapshot table, empty state, and support CTA
type: project
---

# AI Contract: __tests__/BillingPage.test.tsx

## Purpose
Integration tests for `app/dashboard/billing/page.tsx`. Verifies auth redirect, billing snapshot table rendering, empty state, column headers, null safety, and support contact CTA.

## Allowed Responsibilities
- Mock `@/lib/supabase/server` to control `getUser`, `tenant_users`, and `monthly_billing_snapshots` query outcomes.
- Mock `next/navigation` to intercept `redirect`.
- Assert on rendered text, table columns, and link presence.

## Not Allowed
- Do not test business logic or data transformation outside the page.
- Do not make real network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Redirects to `/login` when unauthenticated.
- Shows empty state when there are no snapshots.
- Renders a row for each billing snapshot with correct values.
- Renders all six column headers (month, active, new, reminders, conversations, amount due).
- Shows the support contact CTA link.
- Shows empty state when user has no tenant membership.
- Handles null snapshots response without crashing.
- Amount due cell shows `active_users * 7` formatted as a dollar value (e.g., 42 → `$294`).
