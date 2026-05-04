# AI Contract: app/dashboard/page.tsx

## Purpose
Server Component page (`DashboardPage`) that shows a usage overview for the authenticated user's tenant: total homeowners, fully provisioned count, and opted-out count displayed as `StatCard` components.

## Allowed Responsibilities
- Authenticate the user and redirect to `/login` if unauthenticated.
- Resolve `tenant_id` and `tenants.name` via a join on `tenant_users`.
- Query the `users` table for `onboarding_complete` and `opted_out` fields.
- Compute `total`, `fullyProvisioned`, and `optedOut` counts in JavaScript.
- Render three `StatCard` components with the computed values.

## Not Allowed
- Do not expose mutation controls on this page; it is read-only.
- Do not fetch conversation or reminder data; that belongs on the user detail page.
- Do not add charts or graphs; only the three `StatCard` items.

## Public Interfaces
- `export default async function DashboardPage(): Promise<JSX.Element>`
- `function StatCard({ label, value, sub }: StatCardProps): JSX.Element` — local, not exported.
- `type StatCardProps = { label: string; value: number; sub?: string }` — local type.

## Required Patterns
- Tenant name resolved from the `tenants` join: `(membership?.tenants as { name?: string } | null)?.name ?? 'Dashboard'`.
- Three fixed stat cards: "Total homeowners", "Fully provisioned" (with sub "Onboarding complete"), "Opted out".
- `value.toLocaleString()` used inside `StatCard` for number formatting.

## Tests Required
- Unauthenticated user is redirected to `/login`.
- Displays tenant name as the page heading.
- "Total homeowners" shows the count of all users in the tenant.
- "Fully provisioned" shows the count where `onboarding_complete === true`.
- "Opted out" shows the count where `opted_out === true`.

## Notes for AI Agents
- Counts are derived in JavaScript from the full `users` query result, not via database aggregates. Do not change to aggregate queries without also updating the count logic.
- `StatCard` is local to this file. If it is needed elsewhere, extract it; do not duplicate it.
