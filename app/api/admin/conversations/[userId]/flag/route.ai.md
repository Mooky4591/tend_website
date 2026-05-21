# AI Contract: app/api/admin/conversations/[userId]/flag/route.ts

## Purpose
Admin action route that manually flags or unflags the most recent conversation for a user.

## Allowed Responsibilities
- Validate admin session cookie.
- Accept `reason` (string) or `unflag=true` from form data.
- Find the most recent conversation row for the userId.
- Set `manually_flagged = true` + `manually_flagged_reason` when flagging.
- Set `manually_flagged = false` + `manually_flagged_reason = null` when unflaging.
- Redirect back to the conversation thread page.

## Not Allowed
- Do not use Supabase auth.
- Do not render HTML.

## Public Interfaces
- `export async function POST(request, { params }): Promise<NextResponse>`

## Tests Required
- POST redirects to login when not authenticated.
- POST sets `manually_flagged = true` and the reason when flagging.
- POST sets `manually_flagged = false` and `reason = null` when unflaging.

## Notes for AI Agents
- Uses service-role client.
