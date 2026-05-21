# AI Contract: app/admin/users/page.tsx

## Purpose
Admin user list page at `/admin/users`. Shows all homeowners across all tenants with
key status fields and links to their conversation threads.

## Allowed Responsibilities
- Fetch all users with tenant info and conversation counts using the service-role client.
- Fetch conversation counts via a paginated `.range()` loop (PAGE_SIZE = 1000) to avoid
  Supabase's default row cap silently truncating the count for high-volume deployments.
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
