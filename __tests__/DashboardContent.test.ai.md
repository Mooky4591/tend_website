---
name: DashboardContent.test
description: Tests for app/dashboard/DashboardContent — client-side data fetching with pagination, stat counts, realtime subscriptions, and DashboardCharts presence
metadata:
  type: project
---

# AI Contract: __tests__/DashboardContent.test.tsx

## Purpose
Unit tests for `app/dashboard/DashboardContent.tsx`. Verifies initial data fetching, paging through PostgREST results beyond the default 1,000-row cap, stat count display, null safety, Supabase Realtime subscription setup, live re-fetch on realtime events, and channel cleanup on unmount.

## Allowed Responsibilities
- Mock `@/lib/supabase/client` to control `users` and `conversations` query outcomes and capture realtime callbacks.
- Expose `.range()` on the mocked query chain so pagination behavior can be asserted (call args and call counts).
- Mock `@/app/dashboard/DashboardCharts` with a stub that renders `data-testid="dashboard-charts"`.
- Assert on rendered stat values and realtime-triggered DOM updates.

## Not Allowed
- Do not make real network requests.
- Do not test chart rendering internals — that belongs in DashboardCharts.test.tsx.
- Do not mock `monthly_billing_snapshots`; that table is owned by `/dashboard/billing` and is no longer read by `DashboardContent`.

## Public Interfaces
- No exports — test file only.

## Mock Targets
- `@/lib/supabase/client` — `createClient` returning stubs for `users`, `conversations`, `channel`, and `removeChannel`. Each table's chain ends in `.range()` so the test can drive paginated responses.
- `@/app/dashboard/DashboardCharts` — default export stubbed as `() => <div data-testid="dashboard-charts" />`; requires `__esModule: true`

## Tests Required
- Renders without crashing.
- Displays zero counts when users query returns empty.
- Displays correct total, completedOnboarding, and optedOut counts from fetched data.
- Handles null users response without crashing.
- Handles null conversations response without crashing.
- Subscribes to `users-changes` and `conversations-changes` realtime channels on mount.
- Re-fetches stats and updates the DOM when the users realtime callback fires.
- Re-fetches messages when the conversations realtime callback fires.
- Pages through users beyond the PostgREST row limit so stats reflect every row (asserts `.range(0, 999)` then `.range(1000, 1999)` and a 1,250 total).
- Pages through conversations beyond the PostgREST row limit so the messages chart reflects every row (asserts `.range(0, 999)` then `.range(1000, 1999)`).
- Removes both channels on unmount.
- Renders the `DashboardCharts` component.
