# AI Contract: app/dashboard/users/[id]/page.tsx

## Purpose
Server Component page (`UserDetailPage`) that fetches and displays a single homeowner's profile, conversation thread, and reminders in a two-column layout. Calls `notFound()` if the homeowner row does not exist.

## Allowed Responsibilities
- Authenticate the user and redirect to `/login` if unauthenticated.
- Fetch homeowner profile, conversations (ascending by `created_at`), and reminders (ascending by `due_date`) in parallel via `Promise.all`.
- Call `notFound()` if the homeowner is not found.
- Derive `location` string from address fields.
- Render status badges for `onboarding_complete` and `opted_out`.
- Compose `ConversationPanel`, `MessageForm`, and `RemindersPanel` with fetched data.

## Not Allowed
- Do not make mutations on this page; all mutations go through client components and API routes.
- Do not fetch data for other homeowners; always filter by `params.id`.
- Do not render navigation chrome; that is handled by `DashboardLayout`.

## Public Interfaces
- `export default async function UserDetailPage({ params }: { params: { id: string } }): Promise<JSX.Element>`

## Required Patterns
- `Promise.all` for the three parallel Supabase queries.
- `notFound()` called when `homeowner` is null (triggers the Next.js 404 page).
- Conversations ordered ascending; reminders ordered ascending by due date.
- `ConversationPanel` messages cast via `as Parameters<typeof ConversationPanel>[0]['messages']`.
- Back link to `/dashboard/users` rendered above the heading.

## Tests Required
- Unauthenticated user is redirected to `/login`.
- `notFound()` is called when the homeowner row does not exist.
- Homeowner name, phone, and location are rendered.
- "Onboarding complete" badge renders when `onboarding_complete === true`.
- "Opted out" badge renders when `opted_out === true`.
- `ConversationPanel` receives messages sorted ascending.
- `RemindersPanel` receives reminders sorted by due date ascending.

## Notes for AI Agents
- `params.id` is the homeowner's UUID in the `users` table. RLS ensures the querying staff user can only see homeowners within their tenant.
- Adding new data fields (e.g., warranty info) requires additional Supabase queries and new UI sections; do not extend the existing queries arbitrarily.
