---
name: Dashboard.test
description: Tests for app/dashboard/page — server component rendering, auth redirect, tenant name, stat counts, billing snapshot null-safety, and DashboardCharts presence
type: project
---

# AI Contract: __tests__/Dashboard.test.tsx

## Purpose
Integration tests for `app/dashboard/page.tsx`. Verifies auth redirect, tenant name display, stat count calculations (total, completed onboarding, opted out), null safety for both users and billing snapshots, and that the `DashboardCharts` client component is rendered.

## Allowed Responsibilities
- Mock `@/lib/supabase/server` to control `getUser`, `tenant_users`, `users`, and `monthly_billing_snapshots` query outcomes.
- Mock `next/navigation` to intercept `redirect`.
- Mock `@/app/dashboard/DashboardCharts` with a stub that renders `data-testid="dashboard-charts"`.
- Assert on rendered text, stat values, and the presence of the charts stub.

## Not Allowed
- Do not test business logic outside the page component.
- Do not make real network requests.
- Do not test chart rendering internals — that belongs in DashboardCharts.test.tsx.

## Public Interfaces
- No exports — test file only.

## Mock Targets
- `next/navigation` — `redirect`
- `@/lib/supabase/server` — `createClient` returning stubs for `tenant_users`, `users`, and `monthly_billing_snapshots` tables
- `@/app/dashboard/DashboardCharts` — default export stubbed as `() => <div data-testid="dashboard-charts" />`; requires `__esModule: true`

## Tests Required
- Redirects to `/login` when unauthenticated.
- Renders the tenant name when authenticated.
- Falls back to "Dashboard" heading when tenant query returns null.
- Shows zero counts (×3) when there are no users.
- Counts completed onboarding (`onboarding_complete: true`) users correctly.
- Counts opted-out users correctly.
- Handles null users response without crashing.
- Handles null billing snapshots response without crashing.
- Renders the `DashboardCharts` component (asserts `data-testid="dashboard-charts"` is in the DOM).
