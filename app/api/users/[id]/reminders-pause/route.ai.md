# AI Contract: app/api/users/[id]/reminders-pause/route.ts

## Purpose
Authenticated API route to pause or unpause reminder sending for one homeowner by toggling the `users.reminders_paused_at` timestamp.

## Allowed Responsibilities
- Verify authenticated user via Supabase auth and ensure the caller has an admin `tenant_users` membership.
- Resolve the caller's `tenant_id` from the admin membership row and scope the update to that tenant.
- Validate that `paused` in the request body is a boolean.
- Update `users.reminders_paused_at` (to `now()` when `paused === true`, to `null` when `false`) scoped to both `params.id` and the caller's `tenant_id`.
- Return JSON API responses using `lib/api-response` helpers.

## Not Allowed
- Do not update any other user fields.
- Do not touch the `reminders` table — `reminders.skipped_at` is owned by the background worker only.
- Do not send SMS or call external providers.
- Do not perform client rendering.

## Public Interfaces
- `export async function PATCH(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse>`

## Required Patterns
- Return 401 when unauthenticated.
- Return 403 when authenticated but not an admin tenant member.
- Return 400 when `paused` is missing or not a boolean.
- Map `PGRST116` to 404.
- Always select `tenant_id` from the `tenant_users` admin row and pass it as a second `eq` filter on the `users` update — never rely on `params.id` alone to scope the write.
- Compute the paused timestamp inside this route via `new Date().toISOString()` so the database row carries the exact moment the toggle was made.

## Tests Required
- PATCH 401 when unauthenticated.
- PATCH 403 when authenticated but not an admin member.
- PATCH 400 when `paused` is missing or not a boolean.
- PATCH 404 when row not found (`PGRST116`).
- PATCH 200 with `reminders_paused_at` set to an ISO string on pause.
- PATCH 200 with `reminders_paused_at` set to `null` on unpause.
- PATCH 500 when the membership query returns a DB error.
- PATCH 500 when the update query fails with a non-`PGRST116` error code.

## Notes for AI Agents
- The future background reminder-sending worker is the sole reader of `users.reminders_paused_at`; this route is the sole writer. See the column COMMENT in `supabase/migrations/20260518000000_add_reminders_pause.sql` for the worker's contract.
- Consumed by: `lib/api/client.ts` via `setRemindersPaused`, which is in turn called from `app/dashboard/homeowners/[id]/RemindersPanel.tsx`.
