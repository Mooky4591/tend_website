# AI Contract: app/api/send-message/route.ts

## Purpose
Route handler that sends a staff-originated SMS to a homeowner and persists the message to the `conversations` table. Resolves the tenant's Twilio number from the homeowner's `tenant_id` before calling `sendSms`.

## Allowed Responsibilities
- Authenticate the calling user via `createClient()` from `@/lib/supabase/server`.
- Validate `userId` and `message` (non-empty after trim).
- Fetch the homeowner's `phone_number` and `tenant_id` from the `users` table (RLS enforces tenant scope).
- Fetch `twilio_phone_number` from the `tenants` table.
- Call `sendSms` from `@/lib/twilio` with the resolved numbers.
- Insert a `role: 'staff'` row into `conversations` after successful SMS delivery.

## Not Allowed
- Do not invent or hardcode Twilio phone numbers; always resolve from the `tenants` table.
- Do not insert into `conversations` before confirming SMS was sent.
- Do not render JSX or HTML.
- Do not modify user or tenant records.

## Public Interfaces
- `export async function POST(request: NextRequest): Promise<NextResponse>`

## Required Patterns
- Auth check before any database or Twilio call; return 401 if no user.
- Return 404 if the homeowner row is not found.
- Return 500 if the tenant has no `twilio_phone_number`.
- Return 502 if `sendSms` throws (SMS delivery failure); do not insert into `conversations` in that case.
- Return 500 if `conversations` insert fails after successful SMS, with the partial-success error message.

## Tests Required
- POST returns 401 when no authenticated user.
- POST returns 400 when `userId` or `message` is missing.
- POST returns 404 when homeowner not found.
- POST returns 500 when tenant has no Twilio number.
- POST returns 502 when `sendSms` rejects.
- POST returns `{ ok: true }` when SMS sent and conversation row inserted.
- POST returns 500 with "Message sent but could not be saved" when conversation insert fails after successful SMS.

## Notes for AI Agents
- The `role: 'staff'` value is fixed; do not accept `role` from the request body.
- Tenant isolation for the homeowner lookup relies on Supabase RLS — do not bypass it.
- SMS-sending logic belongs in `lib/twilio.ts`, not here.
