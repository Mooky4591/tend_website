---
name: DashboardContent.test
description: Tests for app/dashboard/DashboardContent — client-side data fetching, stat counts, realtime subscriptions, and DashboardCharts presence
metadata:
  type: project
---

# AI Contract: __tests__/DashboardContent.test.tsx

## Purpose
Unit tests for `app/dashboard/DashboardContent.tsx`. Verifies initial data fetching, stat count display, null safety, Supabase Realtime subscription setup, live re-fetch on realtime events, and channel cleanup on unmount.

## Allowed Responsibilities
- Mock `@/lib/supabase/client` to control `users` and `monthly_billing_snapshots` query outcomes and capture realtime callbacks.
- Mock `@/app/dashboard/DashboardCharts` with a stub that renders `data-testid="dashboard-charts"`.
- Assert on rendered stat values and realtime-triggered DOM updates.

## Not Allowed
- Do not make real network requests.
- Do not test chart rendering internals — that belongs in DashboardCharts.test.tsx.

## Public Interfaces
- No exports — test file only.

## Mock Targets
- `@/lib/supabase/client` — `createClient` returning stubs for `users`, `monthly_billing_snapshots`, `channel`, and `removeChannel`
- `@/app/dashboard/DashboardCharts` — default export stubbed as `() => <div data-testid="dashboard-charts" />`; requires `__esModule: true`

## Tests Required
- Renders without crashing.
- Displays zero counts when users query returns empty.
- Displays correct total, completedOnboarding, and optedOut counts from fetched data.
- Handles null users response without crashing.
- Handles null snapshots response without crashing.
- Subscribes to `users-changes` and `snapshots-changes` realtime channels on mount.
- Re-fetches stats and updates the DOM when the users realtime callback fires.
- Removes both channels on unmount.
- Renders the `DashboardCharts` component.
