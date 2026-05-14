---
name: Dashboard.test
description: Tests for app/dashboard/page — server component auth redirect, tenant name rendering, and DashboardContent presence
metadata:
  type: project
---

# AI Contract: __tests__/Dashboard.test.tsx

## Purpose
Integration tests for `app/dashboard/page.tsx`. Verifies auth redirect, tenant name display, and that `DashboardContent` is rendered. Stat counts and chart data are tested in `DashboardContent.test.tsx`.

## Allowed Responsibilities
- Mock `@/lib/supabase/server` to control `getUser` and `tenant_users` query outcomes.
- Mock `next/navigation` to intercept `redirect`.
- Mock `@/app/dashboard/DashboardContent` with a stub that renders `data-testid="dashboard-content"`.
- Assert on rendered text and the presence of the content stub.

## Not Allowed
- Do not test stat count logic here — that belongs in DashboardContent.test.tsx.
- Do not mock `users` or `monthly_billing_snapshots` tables — page.tsx no longer queries them.
- Do not make real network requests.

## Public Interfaces
- No exports — test file only.

## Mock Targets
- `next/navigation` — `redirect`
- `@/lib/supabase/server` — `createClient` returning stubs for `tenant_users` only
- `@/app/dashboard/DashboardContent` — default export stubbed as `() => <div data-testid="dashboard-content" />`; requires `__esModule: true`

## Tests Required
- Redirects to `/login` when unauthenticated.
- Renders the tenant name when authenticated.
- Falls back to "Dashboard" heading when tenant query returns null.
- Renders the `DashboardContent` component (asserts `data-testid="dashboard-content"` is in the DOM).
