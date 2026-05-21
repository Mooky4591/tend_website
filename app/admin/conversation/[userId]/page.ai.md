# AI Contract: app/admin/conversation/[userId]/page.tsx

## Purpose
Full conversation thread view for a specific homeowner at `/admin/conversation/[userId]`.
Shows all messages in chat style, the homeowner's home_details in a sidebar, action buttons
(mark reviewed, flag, unflag), and any AI quality flag details.

## Allowed Responsibilities
- Fetch all conversations, user info, and home_details for the given userId.
- Render messages in chronological order with role, content, and timestamp.
- Show AI quality flag details (issue types and descriptions) when present.
- Render action buttons: Mark Reviewed (POST to `/api/admin/conversations/[userId]/review`),
  Flag Manually (POST to `/api/admin/conversations/[userId]/flag` with reason), Unflag.
- Display `home_details` fields in a sidebar.
- Return 404 if user not found.

## Not Allowed
- Do not accept or process `POST` submissions here — delegate to API routes.
- Do not use Tailwind CSS.
- Do not inline-filter or alter conversation content.

## Public Interfaces
- `export default async function ConversationThreadPage({ params }): Promise<JSX.Element>`

## Tests Required
- Renders all messages with correct role labels.
- Renders the AI quality flag panel when a flagged message exists.
- Renders home details sidebar.
- Returns 404 for an unknown userId.

## Notes for AI Agents
- Wrapped by `app/admin/layout.tsx`.
- Uses the service-role client (bypasses RLS) to access all conversations.
