# AI Contract: app/api/send-message/route.ts

## Purpose
Route handler for sending a staff-originated SMS to a homeowner. Owns only HTTP concerns: authentication, input validation, and translating the service result into a `NextResponse`. Business logic (user lookup, tenant lookup, Twilio call, conversation insert) is fully delegated to `lib/services/messaging.ts`.

## Allowed Responsibilities
- Authenticate the calling user via `createClient()` from `@/lib/supabase/server`.
- Validate `userId` and `message` (non-empty after trim).
- Call `sendMessageToHomeowner` from `@/lib/services/messaging`.
- Translate the service's error descriptor `{ error, status }` into the matching `NextResponse`, or return `{ ok: true }` on success.

## Not Allowed
- Do not fetch from the `users` or `tenants` tables directly — that belongs in `lib/services/messaging.ts`.
- Do not call `sendSms` directly — delegated to `lib/services/messaging.ts`.
- Do not insert into `conversations` directly — delegated to `lib/services/messaging.ts`.
- Do not invent or hardcode Twilio phone numbers.
- Do not render JSX or HTML.
- Do not modify user or tenant records.

## Public Interfaces
- `export async function POST(request: NextRequest): Promise<NextResponse>`

## Required Patterns
- Auth check before any other work; return 401 if no user.
- Return 400 if `userId` or `message` is missing/empty after trim.
- Pass trimmed `message` to `sendMessageToHomeowner`.
- Translate service error descriptors to named helpers: `notFound` for 404, `badGateway` for 502, `serverError` for all other failures.
- Return `ok({ ok: true })` on success.

## Tests Required
- POST returns 401 when no authenticated user.
- POST returns 400 when `userId` or `message` is missing.
- POST returns 404 when homeowner not found (service returns `{ error, status: 404 }`).
- POST returns 500 when tenant has no Twilio number.
- POST returns 502 when SMS delivery fails.
- POST returns `{ ok: true }` when message is sent and saved.
- POST returns 500 with "Message sent but could not be saved" when conversation insert fails after successful SMS.

## Notes for AI Agents
- All multi-step orchestration lives in `lib/services/messaging.ts`. This route is intentionally thin.
- The `role: 'staff'` value is fixed and set by the service; do not accept `role` from the request body.
- Tenant isolation for the homeowner lookup relies on Supabase RLS — do not bypass it.
