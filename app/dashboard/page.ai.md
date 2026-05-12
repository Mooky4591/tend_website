# AI Contract: app/dashboard/page.tsx

## Purpose
Server Component page (`DashboardPage`) that shows a usage overview for the authenticated user's tenant: a single combined stat card with total homeowners, completed-onboarding count, and opted-out count, plus two charts (homeowners over time, messages per month) rendered by `DashboardCharts`.

## Allowed Responsibilities
- Authenticate the user and redirect to `/login` if unauthenticated.
- Resolve `tenant_id` and `tenants.name` via a join on `tenant_users`.
- Query the `users` table for `onboarding_complete` and `opted_out` fields.
- Query the `monthly_billing_snapshots` table for `billing_month`, `active_users`, and `conversations` to supply chart data.
- Compute `total`, `completedOnboarding`, and `optedOut` counts in JavaScript.
- Format billing snapshot rows into `ChartPoint[]` arrays for `usersPerMonth` and `messagesPerMonth`.
- Render a single combined stat card showing all three counts side by side.
- Render `DashboardCharts` with the formatted chart data.

## Not Allowed
- Do not expose mutation controls on this page; it is read-only.
- Do not fetch reminder data; that belongs on the user detail page.
- Do not move chart rendering logic into this file; charts belong in `DashboardCharts`.

## Public Interfaces
- `export default async function DashboardPage(): Promise<JSX.Element>`
- `function formatMonth(dateStr: string): string` — local helper, not exported.

## Required Patterns
- Tenant name resolved from the `tenants` join: `(membership?.tenants as { name?: string } | null)?.name ?? 'Dashboard'`.
- Single combined stat card: "Total homeowners", "Completed Onboarding", "Opted out" — all three in one `bg-white rounded-2xl` card divided by `divide-x divide-border/20`.
- `value.toLocaleString()` used for number formatting in stat values.
- Users and billing snapshots fetched in parallel via `Promise.all`.

## Tests Required
- Unauthenticated user is redirected to `/login`.
- Displays tenant name as the page heading.
- "Total homeowners" shows the count of all users in the tenant.
- "Completed Onboarding" shows the count where `onboarding_complete === true`.
- "Opted out" shows the count where `opted_out === true`.
- All three stats show 0 when there are no users.
- Renders without crashing when billing snapshots return null.

## Notes for AI Agents
- Counts are derived in JavaScript from the full `users` query result, not via database aggregates.
- Chart data comes from `monthly_billing_snapshots`, not from aggregating the `users` or `conversations` tables directly.
- `DashboardCharts` is a Client Component; do not add `'use client'` to this file.
