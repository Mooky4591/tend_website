# AI Contract: __tests__/SendMessage.test.ts

## Purpose
Integration tests for `app/api/send-message/route.ts` (POST handler). Verifies auth, input validation, all service-delegated error codes, conversation row insertion, and success.

## Allowed Responsibilities
- Mock `@/lib/supabase/server` to control auth and DB call outcomes.
- Mock `@/lib/twilio` to control `sendSms` outcomes.
- Assert on HTTP status codes, response bodies, and mock call arguments.

## Not Allowed
- Do not test service internals here; `messagingService.test.ts` owns those.
- Do not make real network requests.

## Public Interfaces
- No exports — test file only.

## Required Patterns
- `@jest-environment node` directive required.
- The `from()` mock must throw `new Error(\`Unexpected table: \${table}\`)` for any unhandled table name so accidental calls to unknown tables are caught immediately.

## Tests Required
- Returns 401 when unauthenticated.
- Returns 400 when `userId` or `message` is missing or blank.
- Returns 404 when target user is not found.
- Returns 500 when tenant has no Twilio number.
- Calls `sendSms` with correct from/to/body arguments (trimmed message).
- Inserts a `conversations` row with `role: 'staff'`.
- Returns 502 when Twilio throws.
- Does not insert a conversation row when Twilio fails.
- Returns 500 with "Message sent but could not be saved" when insert fails after SMS.
- Returns 200 `{ ok: true }` on full success.

## Notes for AI Agents
- Error codes 404/500/502 are now produced by named helpers from `@/lib/api-response`.
