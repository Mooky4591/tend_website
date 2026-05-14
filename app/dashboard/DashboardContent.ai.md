# AI Contract: app/dashboard/DashboardContent.tsx

## Purpose
Client Component that owns all real-time data for the dashboard overview: fetches stats and chart data from Supabase on mount, subscribes to Postgres changes via Supabase Realtime so the UI updates live, and renders the stat card plus `DashboardCharts`.

## Allowed Responsibilities
- Accept `tenantId: string` as a prop from `DashboardPage`.
- Create a single Supabase browser client via `@/lib/supabase/client`.
- Fetch `onboarding_complete` and `opted_out` from the `users` table and derive `total`, `completedOnboarding`, and `optedOut` counts.
- Fetch `billing_month`, `active_users`, and `conversations` from `monthly_billing_snapshots` and format into `ChartPoint[]` arrays.
- Subscribe to `postgres_changes` on `users` (filtered by `tenant_id`) and re-fetch stats on any change.
- Subscribe to `postgres_changes` on `monthly_billing_snapshots` (filtered by `tenant_id`) and re-fetch snapshots on any change.
- Remove both Supabase channels on unmount.
- Render the single combined stat card ("Total homeowners", "Completed Onboarding", "Opted out").
- Render `DashboardCharts` with the latest `usersPerMonth` and `messagesPerMonth` data.

## Not Allowed
- Do not expose mutation controls; this component is read-only.
- Do not create more than one Supabase client instance per component lifecycle.
- Do not add chart rendering logic; charts belong in `DashboardCharts`.
- Do not fetch reminder or per-user detail data.

## Public Interfaces
- `export default function DashboardContent({ tenantId }: { tenantId: string }): JSX.Element`

## Required Patterns
- `'use client'` directive required.
- Supabase client created once via `useState(() => createClient())`.
- `fetchStats` and `fetchSnapshots` wrapped in `useCallback` with `[supabase, tenantId]` deps.
- Single `useEffect` handles initial fetches and realtime channel setup; cleanup removes both channels.
- Stat card styled with `bg-white rounded-2xl border border-border/20 p-6`, matching other dashboard cards.
- `value.toLocaleString()` for number formatting.

## Tests Required
- Renders without crashing.
- Displays zero counts when users query returns empty.
- Displays correct total, completedOnboarding, and optedOut counts from fetched data.
- Handles null users response without crashing.
- Handles null snapshots response without crashing.
- Subscribes to `users` and `monthly_billing_snapshots` realtime channels on mount.
- Re-fetches stats and updates the DOM when the users realtime callback fires.
- Removes both channels on unmount.
- Renders the `DashboardCharts` component.
