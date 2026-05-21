# AI Contract: app/admin/users/page.tsx

## Purpose
Admin user list page at `/admin/users`. Shows all homeowners across all tenants with
key status fields and links to their conversation threads.

## Allowed Responsibilities
- Fetch all users with tenant info and conversation counts using the service-role client.
- Display: name, phone, tenant name, onboarding status, gap flagged, conversation count, last active timestamp.
- Link to `/admin/conversation/[userId]` for the full thread.

## Not Allowed
- Do not modify user data (read-only page).
- Do not use Tailwind CSS.

## Public Interfaces
- `export default async function AdminUsersPage(): Promise<JSX.Element>`

## Tests Required
- Renders a row for each user.
- Shows conversation count and last active timestamp.
- Shows "No users" when empty.

## Notes for AI Agents
- Wrapped by `app/admin/layout.tsx`.
- Uses service-role client to read across all tenants.
