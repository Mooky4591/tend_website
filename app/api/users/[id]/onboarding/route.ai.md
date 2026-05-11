# AI Contract: app/api/users/[id]/onboarding/route.ts

## Purpose
Route handler for triggering the onboarding SMS for a homeowner. Authenticates the caller, enforces admin + tenant isolation, and delegates to `triggerOnboarding` from `lib/services/onboarding.ts`.

## Allowed Responsibilities
- Authenticate the request via Supabase session.
- Verify the caller has `role = 'admin'` in `tenant_users`.
- Validate that `message` is present and non-empty in the request body.
- Call `triggerOnboarding(supabase, params.id, message)`.
- Map service errors to HTTP responses.

## Not Allowed
- Do not implement onboarding logic here — that belongs in `lib/services/onboarding.ts`.
- Do not allow non-admin callers (viewers are read-only).
- Do not accept mutations for fields other than triggering the onboarding send.

## Public Interfaces
- `export async function POST(request, { params }): Promise<NextResponse>`

## Required Patterns
- Tenant isolation is enforced by querying `tenant_users` with `auth_user_id = user.id` and `role = 'admin'`.
  The `users` table RLS further prevents cross-tenant access.
- Body shape: `{ message: string }` — trim before passing to service.
- Error mapping: 404 → `notFound`, 502 → `badGateway`, all others → `serverError`.

## Tests Required
- Returns 401 when unauthenticated.
- Returns 400 when `message` is missing or blank.
- Returns 403 when caller is not an admin.
- Returns 404 when the homeowner does not exist (service returns 404).
- Returns 502 when SMS delivery fails (service returns 502).
- Returns 200 `{ ok: true }` on success.
