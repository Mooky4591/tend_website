# AI Contract: app/dashboard/DashboardContent.tsx

## Purpose
Client Component that owns all real-time data for the dashboard overview: fetches stats and chart data from Supabase on mount, subscribes to Postgres changes via Supabase Realtime so the UI updates live, and renders the stat card plus `DashboardCharts`.

## Allowed Responsibilities
- Accept `tenantId: string` as a prop from `DashboardPage`.
- Create a single Supabase browser client via `@/lib/supabase/client`.
- Fetch `created_at`, `onboarding_complete`, and `opted_out` from the `users` table; derive `total`, `completedOnboarding`, `optedOut` counts, and a cumulative homeowners-per-month chart series (bucketed by `created_at` month, in local time).
- Fetch `created_at` from the `conversations` table and derive a messages-per-month chart series (count of rows per month).
- Page through both queries using `.range(offset, offset + PAGE_SIZE - 1)` until a page returns fewer than `PAGE_SIZE` rows, so PostgREST's default 1,000-row response cap does not silently truncate counts on active tenants.
- Format chart series as `ChartPoint[]` with month labels like `"Jan 26"`, filling every month from the earliest data point through the current month with zero-count gaps preserved.
- Subscribe to `postgres_changes` on `users` (filtered by `tenant_id`) and re-fetch users on any change.
- Subscribe to `postgres_changes` on `conversations` (filtered by `tenant_id`) and re-fetch messages on any change.
- Remove both Supabase channels on unmount.
- Render the single combined stat card ("Total homeowners", "Completed Onboarding", "Opted out").
- Render `DashboardCharts` with the latest `usersPerMonth` and `messagesPerMonth` data.

## Not Allowed
- Do not read from `monthly_billing_snapshots`; that table is billing-only and is owned by `/dashboard/billing`.
- Do not expose mutation controls; this component is read-only.
- Do not create more than one Supabase client instance per component lifecycle.
- Do not add chart rendering logic; charts belong in `DashboardCharts`.
- Do not fetch reminder or per-user detail data.

## Public Interfaces
- `export default function DashboardContent({ tenantId }: { tenantId: string }): JSX.Element`

## Required Patterns
- `'use client'` directive required.
- Supabase client created once via `useState(() => createClient())`.
- `fetchUsers` and `fetchMessages` wrapped in `useCallback` with `[supabase, tenantId]` deps.
- Single `useEffect` handles initial fetches and realtime channel setup; cleanup removes both channels.
- Stat card styled with `bg-white rounded-2xl border border-border/20 p-6`, matching other dashboard cards.
- `value.toLocaleString()` for number formatting.

## Tests Required
- Renders without crashing.
- Displays zero counts when users query returns empty.
- Displays correct total, completedOnboarding, and optedOut counts from fetched data.
- Handles null users response without crashing.
- Handles null conversations response without crashing.
- Subscribes to `users` and `conversations` realtime channels on mount.
- Re-fetches stats and updates the DOM when the users realtime callback fires.
- Re-fetches messages chart data when the conversations realtime callback fires.
- Removes both channels on unmount.
- Renders the `DashboardCharts` component.
- Pages through `users` results beyond the PostgREST row limit so stats reflect every row.
- Pages through `conversations` results beyond the PostgREST row limit so the messages chart reflects every row.
