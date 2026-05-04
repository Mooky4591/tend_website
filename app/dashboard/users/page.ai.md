# AI Contract: app/dashboard/users/page.tsx

## Purpose
Server Component page (`UsersPage`) that lists all homeowners for the authenticated user's tenant in a table with name, phone, location, and status badge. Names link to the individual user detail page.

## Allowed Responsibilities
- Authenticate the user and redirect to `/login` if unauthenticated.
- Resolve `tenant_id` from `tenant_users`.
- Query the `users` table for the tenant's homeowners, ordered by `created_at` descending.
- Render a table with columns: Name, Phone, Location, Status.
- Apply `statusBadge` to determine the correct badge color and label per row.

## Not Allowed
- Do not allow mutations from this page (no delete, edit, or bulk actions).
- Do not paginate (current implementation loads all rows; if pagination is added, update this contract).
- Do not fetch conversation or reminder data here.

## Public Interfaces
- `export default async function UsersPage(): Promise<JSX.Element>`
- `function statusBadge(u: { onboarding_complete: boolean; onboarding_status: string | null; opted_out: boolean }): JSX.Element` — local, not exported.

## Required Patterns
- `statusBadge` priority order: opted_out → onboarding_complete → queued → failed → pending (Pending is the default).
- Each name cell is a `<Link>` to `/dashboard/users/${h.id}`.
- Phone numbers rendered with `font-mono text-xs`.
- Total count displayed below the heading: `{homeowners?.length ?? 0} total`.
- Empty-state row spanning 4 columns when no homeowners exist.

## Tests Required
- Unauthenticated user is redirected to `/login`.
- Table renders each homeowner row with name, phone, city/state, and status badge.
- `statusBadge` returns "Opted out" badge when `opted_out === true` (even if `onboarding_complete === true`).
- `statusBadge` returns "Complete" badge when `onboarding_complete === true` and not opted out.
- `statusBadge` returns "Queued"/"Failed"/"Pending" based on `onboarding_status`.
- Name links navigate to `/dashboard/users/${id}`.
- Empty state renders when no homeowners exist.

## Notes for AI Agents
- Status badge priority is: opted_out first, then complete, then queued/failed/pending. Do not reorder.
- Location is `[city, state].filter(Boolean).join(', ')` — render `'—'` if both are null.
