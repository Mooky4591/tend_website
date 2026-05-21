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
- `export async function POST(_request, { params }): Promise<NextResponse>`

## Tests Required
- POST redirects to login when not authenticated.
- POST sets `manually_reviewed = true` on the latest conversation.

## Notes for AI Agents
- Uses service-role client (bypasses RLS).
- Redirect URL uses a placeholder base; the browser follows the relative path correctly.
