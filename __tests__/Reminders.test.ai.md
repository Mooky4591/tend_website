# AI Contract: __tests__/Reminders.test.ts

## Purpose
Integration tests for `app/api/reminders/route.ts` (POST) and `app/api/reminders/[id]/route.ts` (PATCH, DELETE). Verifies auth checks, input validation, DB success paths, and DB error paths for all three operations.

## Allowed Responsibilities
- Mock `@/lib/supabase/server` to control auth and DB outcomes.
- Assert on HTTP status codes and response bodies.

## Not Allowed
- Do not make real network requests.

## Public Interfaces
- No exports — test file only.

## Required Patterns
- `@jest-environment node` directive required.

## Tests Required
- POST: 401 when unauthenticated; 400 for missing `userId`, `reminderType`, or `dueDate`; 201 with row on success; accepts optional `unitId`; 500 on DB insert failure.
- PATCH: 401 when unauthenticated; 400 when no updatable fields; 200 on success; 404 when row not found (PGRST116); 500 for other DB errors.
- DELETE: 401 when unauthenticated; 200 `{ ok: true }` on success; 500 on DB delete failure.
