# AI Contract: app/api/users/[id]/onboarding-check/route.ts

## Purpose
Route handler that triggers the onboarding completeness validator for a specific homeowner.
Called immediately after `onboarding_complete` is set to true, by either an authenticated portal
staff member or an internal cron caller presenting the `x-cron-secret` header.

## Allowed Responsibilities
- Accept both portal staff (Supabase session) and internal cron callers (`x-cron-secret` header).
- Verify staff callers belong to the same tenant as the target user.
- Delegate to `validateOnboardingCompleteness` from `lib/services/onboardingValidator.ts`.
- Use the service-role client (from `lib/supabase/service.ts`) for the validator call.
- Return the validator result `{ gaps, flagged }` as JSON.

## Not Allowed
- Do not implement gap detection logic here — delegate entirely to the validator service.
- Do not accept or process request bodies; the user ID comes from the URL param only.
- Do not expose service-role credentials in responses.
- Do not render JSX or HTML.

## Public Interfaces
- `export async function POST(request: NextRequest, { params }): Promise<NextResponse>`

## Required Patterns
- Check for `x-cron-secret` header first; if present and valid, skip Supabase auth.
- If not an internal caller, require Supabase auth and tenant membership.
- Validate that the target user belongs to the caller's tenant before running the check.
- Use `createServiceClient()` (not `createClient()`) when calling the validator.
- Wrap the validator call in try/catch; return 500 on any error.

## Tests Required
- POST returns 401 when no auth and no cron secret.
- POST returns 403 when authenticated user has no tenant membership.
- POST returns 404 when target user doesn't belong to caller's tenant.
- POST returns `{ gaps, flagged }` on success for authenticated staff.
- POST returns `{ gaps, flagged }` when called with valid CRON_SECRET header (bypasses auth).
- POST returns 500 when the validator throws.

## Notes for AI Agents
- The `x-cron-secret` path intentionally does NOT verify tenant membership — it is a
  system-level caller. Never add tenant scope checks to the internal-caller path.
- Consumed by the SMS backend and the quality monitor cron job after marking a user's
  onboarding complete.
