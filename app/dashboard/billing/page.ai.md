# AI Contract: app/dashboard/billing/page.tsx

## Purpose
Server Component page (`BillingPage`) that displays a read-only table of monthly billing snapshots from `monthly_billing_snapshots` for the authenticated user's tenant, plus a support contact blurb.

## Allowed Responsibilities
- Authenticate the user and redirect to `/login` if unauthenticated.
- Resolve `tenant_id` from `tenant_users`.
- Query `monthly_billing_snapshots` for `billing_month`, `active_users`, `new_users`, `reminders_sent`, and `conversations`, ordered newest-first.
- Render the snapshot table and empty-state row.
- Format `billing_month` strings via the local `formatMonth` helper.

## Not Allowed
- Do not allow mutations; this page is read-only.
- Do not accept URL search params or form submissions.
- Do not render payment forms or Stripe integrations.
- Do not fetch data from tables other than `tenant_users` and `monthly_billing_snapshots`.

## Public Interfaces
- `export default async function BillingPage(): Promise<JSX.Element>` — Next.js page export.
- `function formatMonth(dateStr: string): string` — local helper, not exported.

## Required Patterns
- Auth check and redirect before any database queries.
- Null-safe access: `membership?.tenant_id ?? ''` when querying snapshots.
- `toLocaleString()` for all numeric values in the table cells.
- Empty-state row spanning all 5 columns when `snapshots` is empty.

## Tests Required
- Unauthenticated user is redirected to `/login`.
- Snapshot rows are displayed in descending `billing_month` order.
- Numeric columns render with `toLocaleString` formatting.
- Empty-state cell is shown when there are no snapshots.
- `formatMonth` converts `'2026-05'` to `'May 2026'` (locale-formatted).

## Notes for AI Agents
- Billing snapshot rows are written by an external process; this page never writes to `monthly_billing_snapshots`.
- The support email `support@trytendr.org` is hardcoded. If it changes, update this file.
- Do not add client-side interactivity here; this must remain a Server Component.
