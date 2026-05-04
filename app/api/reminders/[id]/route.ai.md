# AI Contract: app/api/reminders/[id]/route.ts

## Purpose
Route handler for a single reminder identified by `params.id`. Exposes `PATCH` to update `reminder_type` and/or `due_date`, and `DELETE` to permanently remove the reminder row.

## Allowed Responsibilities
- Authenticate the calling user via `createClient()` from `@/lib/supabase/server`.
- Validate that at least one updatable field is present before issuing a PATCH.
- Update or delete a row in the `reminders` table filtered by `id`.
- Return appropriate HTTP status codes: 401 Unauthorized, 400 Bad Request, 404 Not Found (PGRST116), 500 Internal Server Error.

## Not Allowed
- Do not fetch or verify tenant ownership of the reminder beyond the authenticated user check; RLS handles tenant isolation.
- Do not send SMS messages or interact with Twilio.
- Do not render any JSX or HTML.
- Do not accept or process fields beyond `reminderType` and `dueDate` in the PATCH body.

## Public Interfaces
- `export async function PATCH(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse>`
- `export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse>`

## Required Patterns
- Auth check must happen before any database mutation; return `{ error: 'Unauthorized' }` with status 401 if no user.
- PATCH must guard against an empty `updates` object and return 400 before touching the database.
- PGRST116 error code must be mapped to a 404 response.

## Tests Required
- PATCH returns 401 when no authenticated user.
- PATCH returns 400 when neither `reminderType` nor `dueDate` is provided.
- PATCH returns 404 when Supabase returns PGRST116.
- PATCH returns the updated row on success.
- DELETE returns 401 when no authenticated user.
- DELETE returns `{ ok: true }` on successful deletion.

## Notes for AI Agents
- The `id` segment is the reminder's primary key (UUID), not a user ID. Do not conflate with `userId`.
- Authorization beyond "is there a logged-in user?" is delegated to Supabase RLS; do not add manual tenant checks here.
- Reminder business logic (scheduling, SMS delivery) belongs in background workers, not in this route.
