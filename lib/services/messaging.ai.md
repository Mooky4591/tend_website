# AI Contract: lib/services/messaging.ts

## Purpose
Business-logic service for sending an outbound SMS from a staff user to a homeowner. Extracted from the Route Handler so the route only handles HTTP concerns and this module owns the multi-step orchestration.

## Allowed Responsibilities
- Look up the homeowner's phone number and tenant ID from the `users` table.
- Look up the tenant's Twilio phone number from the `tenants` table.
- Call `sendSms` from `lib/twilio.ts`.
- Insert a `conversations` row with `role: 'staff'` recording the message.
- Return `null` on success or `{ error: string; status: number }` on any failure.

## Not Allowed
- Do not call `createClient()` here — accept the supabase client as a parameter (dependency injection).
- Do not construct `NextResponse` objects — return a plain error descriptor and let the Route Handler build the HTTP response.
- Do not attempt to send the SMS if the homeowner lookup fails.
- Do not insert the conversation row if SMS delivery fails.

## Public Interfaces
- `export async function sendMessageToHomeowner(supabase, userId: string, message: string): Promise<{ error: string; status: number } | null>`

## Required Patterns
- Query `users` first; return `{ error: 'User not found', status: 404 }` if missing (RLS ensures cross-tenant access is impossible).
- Query `tenants` by `homeowner.tenant_id`; return `{ error: 'Tenant has no Twilio number configured', status: 500 }` if `twilio_phone_number` is null.
- Wrap `sendSms` in `.then(() => null).catch(err => err)` to distinguish success from failure without throwing.
- Return `{ error: 'SMS delivery failed', status: 502 }` if Twilio rejects.
- Insert conversation with `{ user_id, tenant_id, role: 'staff', content: message }`.
- Return `{ error: 'Message sent but could not be saved: ' + insertError.message, status: 500 }` if the DB insert fails.

## Tests Required
- Returns `null` on full success.
- Returns status 404 when the homeowner is not found.
- Returns status 500 when the tenant has no Twilio number.
- Returns status 502 when Twilio throws.
- Does not insert a conversation row when Twilio fails.
- Returns status 500 with a message containing "Message sent but could not be saved" when the insert fails after SMS success.

## Notes for AI Agents
- Consumed exclusively by `app/api/send-message/route.ts`.
- The `message` parameter is expected to already be trimmed by the caller.
- Row-level security on `users` means `userId` must belong to the same tenant as the authenticated staff user; this module trusts that invariant.
