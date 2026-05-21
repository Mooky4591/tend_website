# AI Contract: app/api/admin/onboarding-gaps/[userId]/resolve/route.ts

## Purpose
Admin action route that resolves an onboarding gap flag by setting `onboarding_gap_flagged = false`
on the users table.

## Allowed Responsibilities
- Validate admin session cookie.
- Set `onboarding_gap_flagged = false` for the given userId.
- Redirect back to `/admin/onboarding-gaps`.

## Not Allowed
- Do not clear `onboarding_gaps` array (preserve history).
- Do not use Supabase auth.
- Do not render HTML.

## Public Interfaces
- `export async function POST(request, { params }): Promise<NextResponse>`

## Tests Required
- POST redirects to login when not authenticated.
- POST sets `onboarding_gap_flagged = false`.

## Notes for AI Agents
- Uses service-role client.
- All `NextResponse.redirect` calls must use `request.url` as the base URL, not `'http://localhost'`.
