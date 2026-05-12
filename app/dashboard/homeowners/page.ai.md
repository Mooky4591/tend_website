# AI Contract: app/dashboard/homeowners/page.tsx

## Purpose
Server Component page (`UsersPage`) that lists all homeowners for the authenticated user's tenant in a table with name, phone, location, and status badge. Names link to the individual user detail page.

## Allowed Responsibilities
- Authenticate the user and redirect to `/login` if unauthenticated.
- Resolve `tenant_id` via `getTenantId` from `@/lib/auth`.
- Query the `users` table for the tenant's homeowners, ordered by `created_at` descending.
- Render a table with columns: Name, Phone, Location, Status.
- Apply `statusBadge` to determine the correct badge color, label, and hover tooltip per row.
- Use `getFailedTooltip(failure_reason)` to produce context-aware tooltip copy when `onboarding_status === 'failed'`.

## Not Allowed
- Do not allow mutations from this page (no delete, edit, or bulk actions).
- Do not paginate (current implementation loads all rows; if pagination is added, update this contract).
- Do not fetch conversation or reminder data here.

## Public Interfaces
- `export default async function UsersPage(): Promise<JSX.Element>`
- `function statusBadge(u: { onboarding_complete: boolean; onboarding_status: string | null; opted_out: boolean; failure_reason: string | null }): JSX.Element` — local, not exported.
- `function StatusTooltipBadge({ label, colorClass, tooltip }): JSX.Element` — local, not exported. Renders a badge with a CSS-only hover tooltip using Tailwind `group`/`group-hover`.
- `function getFailedTooltip(failureReason: string | null): string` — local, not exported. Returns CTA-appropriate tooltip copy based on the stored failure reason.

## Required Patterns
- `statusBadge` priority order: opted_out → onboarding_complete → queued → failed → pending (Pending is the default).
- Each status badge is wrapped in `StatusTooltipBadge` which shows a `w-56` dark tooltip above the badge on hover via Tailwind `group`/`group-hover` (no client-side JS).
- Static tooltip copy lives in the `STATUS_TOOLTIPS` constant (opted_out, complete, queued, pending). The `failed` tooltip is computed by `getFailedTooltip(failure_reason)`.
- `getFailedTooltip` CTA mapping: `invalid_number | landline | disconnected` → update phone number; `delivery_timeout | network_error` → retry; `carrier_blocked | account_error` → contact support@trytendr.org; `null/unknown` → contact support.
- Each name cell is a `<Link>` to `/dashboard/homeowners/${h.id}`.
- Phone numbers rendered with `font-mono text-xs`.
- Total count displayed below the heading: `{homeowners?.length ?? 0} total`.
- Empty-state row spanning 4 columns when no homeowners exist.
- The `failure_reason` column must be included in the `users` select query.

## Tests Required
- Unauthenticated user is redirected to `/login`.
- Table renders each homeowner row with name, phone, city/state, and status badge.
- `statusBadge` returns "Opted out" badge when `opted_out === true` (even if `onboarding_complete === true`).
- `statusBadge` returns "Complete" badge when `onboarding_complete === true` and not opted out.
- `statusBadge` returns "Queued"/"Failed"/"Pending" based on `onboarding_status`.
- Failed badge with `failure_reason = 'invalid_number'` renders "update their phone number" tooltip.
- Failed badge with `failure_reason = 'landline'` renders "update their phone number" tooltip.
- Failed badge with `failure_reason = 'disconnected'` renders "update their phone number" tooltip.
- Failed badge with `failure_reason = 'delivery_timeout'` renders "retry" tooltip.
- Failed badge with `failure_reason = 'network_error'` renders "retry" tooltip.
- Failed badge with `failure_reason = 'carrier_blocked'` renders "support@trytendr.org" tooltip.
- Failed badge with `failure_reason = 'account_error'` renders "support@trytendr.org" tooltip.
- Failed badge with `failure_reason = null` renders "support@trytendr.org" default tooltip.
- Name links navigate to `/dashboard/homeowners/${id}`.
- Empty state renders when no homeowners exist.

## Notes for AI Agents
- Status badge priority is: opted_out first, then complete, then queued/failed/pending. Do not reorder.
- Location is `[city, state].filter(Boolean).join(', ')` — render `'—'` if both are null.
