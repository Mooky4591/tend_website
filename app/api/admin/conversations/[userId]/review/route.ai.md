# AI Contract: app/api/admin/conversations/[userId]/review/route.ts

## Purpose
Admin action route that marks the most recent conversation for a user as manually reviewed.

## Allowed Responsibilities
- Validate admin session cookie.
- Find the most recent conversations row for the given userId.
- Set `manually_reviewed = true` on that row.
- Redirect back to the conversation thread page.

## Not Allowed
- Do not use Supabase auth.
- Do not accept a request body.
- Do not render HTML.

## Public Interfaces
- `export async function POST(request, { params }): Promise<NextResponse>`

## Required Patterns
- **All redirects must use status 303** (`NextResponse.redirect(url, { status: 303 })`) so
  browsers follow them as GET requests, completing the Post/Redirect/Get pattern.

## Tests Required
- POST redirects to `/admin/login` with status 303 when not authenticated.
- POST sets `manually_reviewed = true` on the latest conversation.
- POST redirects to the conversation thread page with status 303 on success.

## Notes for AI Agents
- Uses service-role client (bypasses RLS).
- All `NextResponse.redirect` calls must use `request.url` as the base URL, not `'http://localhost'`.
