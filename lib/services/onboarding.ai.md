# AI Contract: lib/services/onboarding.ts

## Purpose
Business-logic service for triggering the initial onboarding SMS for a homeowner. Sends the message via Twilio, records it in the conversation history, and writes `onboarding_status = 'queued'` back to the `users` table on success. Failure status (`'failed'`, `failure_reason`) is set by a separate service in a separate repo — this service does not write to the database on SMS failure.

## Allowed Responsibilities
- Look up the homeowner's phone number and tenant ID from the `users` table.
- Look up the tenant's Twilio phone number from the `tenants` table.
- Call `sendSms` from `lib/twilio.ts`.
- On SMS success: insert a `conversations` row with `role: 'staff'`, then update the user to `onboarding_status = 'queued'`, `failure_reason = null`, `last_onboarding_attempt = now()`.
- On SMS failure: return `{ error: 'SMS delivery failed', status: 502 }` with no database writes.
- Return `null` on success or `{ error: string; status: number }` on failure.

## Not Allowed
- Do not call `createClient()` — accept the supabase client as a parameter.
- Do not construct `NextResponse` objects.
- Do not send the SMS if the homeowner or tenant lookup fails.
- Do not set `onboarding_status = 'failed'` or write `failure_reason` — that is owned by the external SMS service repo.
- Do not update onboarding_status to `'complete'` — completion is handled by the AI conversation flow (out of scope here).

## Public Interfaces
- `export async function triggerOnboarding(supabase, userId: string, message: string): Promise<{ error: string; status: number } | null>`

## Required Patterns
- Query `users` first; return `{ error: 'User not found', status: 404 }` if missing.
- Query `tenants` by `homeowner.tenant_id`; return `{ error: 'Tenant has no Twilio number configured', status: 500 }` if `twilio_phone_number` is null.
- Wrap `sendSms` in `.then(() => null).catch(err => err)` to capture errors without throwing.
- On SMS success, insert the conversation row before updating user status.
- On SMS failure, return immediately without touching the database.

## Tests Required
- Returns `null` and sets `onboarding_status = 'queued'`, `failure_reason = null`, `last_onboarding_attempt = <ISO string>` on SMS success.
- Inserts a conversation row with `role: 'staff'` on SMS success.
- Returns `{ status: 500 }` when `conversations.insert` fails on the success path.
- Returns `{ status: 500 }` when `users.update` fails on the success path.
- Returns `{ status: 502 }` on SMS failure.
- Does not update the `users` table on SMS failure.
- Does not insert a conversation row when SMS fails.
- Returns `{ status: 404 }` when the homeowner is not found.
- Returns `{ status: 500 }` when the tenant has no Twilio number.

## Notes for AI Agents
- Consumed exclusively by `app/api/users/[id]/onboarding/route.ts`.
- RLS on the `users` table ensures cross-tenant access is impossible; the service trusts that invariant.
- `failure_reason` is reset to `null` on a successful retry so stale failure data left by the external service is cleared.
- Failure status writes (`onboarding_status = 'failed'`, `failure_reason`) were removed from this repo and are now owned by the external SMS service.
