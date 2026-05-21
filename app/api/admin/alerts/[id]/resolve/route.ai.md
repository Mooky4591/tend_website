# AI Contract: app/api/admin/alerts/[id]/resolve/route.ts

## Purpose
Admin action route that marks a system_alerts row as resolved.

## Allowed Responsibilities
- Validate admin session cookie.
- Set `resolved = true` on the system_alerts row with the given id.
- Redirect back to `/admin/alerts`.

## Not Allowed
- Do not use Supabase auth.
- Do not render HTML.

## Public Interfaces
- `export async function POST(request, { params }): Promise<NextResponse>`

## Required Patterns
- **All redirects must use status 303** (`NextResponse.redirect(url, { status: 303 })`) so
  browsers follow them as GET requests, completing the Post/Redirect/Get pattern.

## Tests Required
- POST redirects to `/admin/login` with status 303 when not authenticated.
- POST sets `resolved = true` on the alert row.
- POST redirects to `/admin/alerts` with status 303 on success.

## Notes for AI Agents
- Uses service-role client.
- All `NextResponse.redirect` calls must use `request.url` as the base URL, not `'http://localhost'`.
