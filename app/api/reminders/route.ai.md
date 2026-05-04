# AI Contract: app/api/reminders/route.ts

## Purpose
Route handler that creates a new reminder row. `POST` accepts `userId`, `reminderType`, `dueDate`, and optional `unitId`, inserts into the `reminders` table, and returns the created row.

## Allowed Responsibilities
- Authenticate the calling user via `createClient()` from `@/lib/supabase/server`.
- Validate that `userId`, `reminderType` (non-empty after trim), and `dueDate` are present.
- Insert a new row into the `reminders` table with an optional `unit_id` field.
- Return the created row with HTTP 201 on success.

## Not Allowed
- Do not update or delete reminders here; those operations belong in `app/api/reminders/[id]/route.ts`.
- Do not send SMS messages or interact with Twilio.
- Do not render JSX or HTML.
- Do not accept fields beyond `userId`, `reminderType`, `dueDate`, and `unitId`.

## Public Interfaces
- `export async function POST(request: NextRequest): Promise<NextResponse>`

## Required Patterns
- Auth check must precede any database operation; return 401 if no user.
- Validate all three required fields and return 400 with a descriptive error message listing them.
- `unitId` must only be included in the insert when it is truthy (spread conditional).
- Return status 201 (not 200) on successful creation.

## Tests Required
- POST returns 401 when no authenticated user.
- POST returns 400 when `userId` is missing.
- POST returns 400 when `reminderType` is blank/whitespace.
- POST returns 400 when `dueDate` is missing.
- POST returns 201 and the created row on success.
- POST inserts `unit_id` only when `unitId` is provided.

## Notes for AI Agents
- `reminderType` is stored trimmed as `reminder_type`. Do not store untrimmed values.
- This route does not validate that `userId` belongs to the caller's tenant; RLS on the `reminders` table enforces that.
- Reminder delivery scheduling is handled by external workers, not here.
