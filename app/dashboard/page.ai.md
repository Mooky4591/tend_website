# AI Contract: app/dashboard/page.tsx

## Purpose
Server Component page (`DashboardPage`) that authenticates the user, resolves their tenant, and renders the dashboard shell (heading + `DashboardContent`). All data fetching and real-time updates are delegated to `DashboardContent`.

## Allowed Responsibilities
- Authenticate the user and redirect to `/login` if unauthenticated.
- Resolve `tenant_id` and `tenants.name` via a join on `tenant_users`.
- Render the page heading (tenant name) and "Usage overview" subtitle.
- Render `DashboardContent` with the resolved `tenantId`.

## Not Allowed
- Do not expose mutation controls on this page; it is read-only.
- Do not fetch reminder data; that belongs on the user detail page.
- Do not fetch `users` or `monthly_billing_snapshots` directly; that is `DashboardContent`'s responsibility.
- Do not move chart or stat rendering logic into this file.
- Do not add `'use client'` to this file.

## Public Interfaces
- `export default async function DashboardPage(): Promise<JSX.Element>`

## Required Patterns
- Tenant name resolved from the `tenants` join: `(membership?.tenants as { name?: string } | null)?.name ?? 'Dashboard'`.
- `tenantId` defaults to `''` when `membership?.tenant_id` is nullish.

## Tests Required
- Unauthenticated user is redirected to `/login`.
- Displays tenant name as the page heading.
- Falls back to "Dashboard" heading when tenant query returns null.
- Renders `DashboardContent` (asserts `data-testid="dashboard-content"` is in the DOM).

## Notes for AI Agents
- Chart data and stat counts are now owned by `DashboardContent`, not this file.
- `DashboardContent` is a Client Component; this file remains a Server Component.
