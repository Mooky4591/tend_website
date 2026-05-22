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

## Required Patterns
- **All redirects must use status 303** (`NextResponse.redirect(url, { status: 303 })`) so
  browsers follow them as GET requests, completing the Post/Redirect/Get pattern.

## Tests Required
- POST redirects to `/admin/login` with status 303 when not authenticated.
- POST sets `onboarding_gap_flagged = false`.
- POST redirects to `/admin/onboarding-gaps` with status 303 on success.

## Notes for AI Agents
- Uses service-role client.
- All `NextResponse.redirect` calls must use `request.url` as the base URL, not `'http://localhost'`.
