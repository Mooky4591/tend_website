# AI Contract: app/admin/conversations/page.tsx

## Purpose
Admin conversation review page at `/admin/conversations`. Lists all users with conversations
in the last 7 days, showing AI quality flags, manual flags, and links to the full thread.

## Allowed Responsibilities
- Fetch conversations and users for the last 7 days using the service-role client.
- Deduplicate to show one row per user (most recent conversation used for flag status).
- Display: name, phone, last message timestamp, AI quality flag, AI quality reason (truncated to 100 chars), manually flagged.
- Link to `/admin/conversation/[userId]` for the full thread view.

## Not Allowed
- Do not render the conversation content — only metadata.
- Do not accept user input (read-only page).
- Do not use Tailwind CSS.

## Public Interfaces
- `export default async function ConversationsPage(): Promise<JSX.Element>`

## Tests Required
- Renders a table row for each user with recent conversations.
- Truncates AI quality reason at 100 characters.
- Shows "No conversations" when the result set is empty.

## Notes for AI Agents
- Wrapped by `app/admin/layout.tsx`.
- "View Thread" links to `app/admin/conversation/[userId]/page.tsx`.
