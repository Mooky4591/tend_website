# AI Contract: app/dashboard/homeowners/[id]/page.tsx

## Purpose
Server Component page (`UserDetailPage`) that fetches and displays a single homeowner's profile, conversation thread, and reminders in a dashboard layout. Calls `notFound()` if the homeowner row does not exist.

## Allowed Responsibilities
- Authenticate the user and redirect to `/login` if unauthenticated.
- Fetch homeowner profile (including `reminders_paused_at`), conversations (ascending by `created_at`), and reminders (including `skipped_at`, ascending by `due_date`) in parallel via `Promise.all`.
- Call `notFound()` if the homeowner is not found.
- Derive `location` string from address fields.
- Render status badges for `onboarding_complete`, `opted_out`, and a "Pending" badge when neither is true; badge always appears at the bottom of the homeowner info card.
- Render a homeowner information card and compose `PhoneNumberEditor` for phone mutations.
- Compose `ConversationPanel`, `MessageForm`, and `RemindersPanel` with fetched data. Pass `remindersPaused={Boolean(homeowner.reminders_paused_at)}` to `RemindersPanel`.

## Not Allowed
- Do not make direct Supabase mutations on this page; all mutations go through client components and API routes.
- Do not fetch data for other homeowners; always filter by `params.id`.
- Do not render navigation chrome; that is handled by `DashboardLayout`.

## Public Interfaces
- `export default async function UserDetailPage({ params }: { params: { id: string } }): Promise<JSX.Element>`

## Required Patterns
- `Promise.all` for the three parallel Supabase queries.
- `notFound()` called when `homeowner` is null (triggers the Next.js 404 page).
- Conversations ordered ascending; reminders ordered ascending by due date.
- `ConversationPanel` messages cast via `as Parameters<typeof ConversationPanel>[0]['messages']`.
- Back link to `/dashboard/homeowners` rendered above the heading.
- Pass `params.id` and `homeowner.phone_number` into `PhoneNumberEditor`.
- Conversation card uses a bounded responsive height (e.g. `min(600px, 70vh)`) with `overflow-hidden` so `ConversationPanel`'s internal `overflow-y-auto` scrolls the messages list instead of expanding the page, while still leaving room for the homeowner info card and reminders panel on short viewports.
- On `lg+`, the reminders column is wrapped so its inner card is absolutely positioned (`lg:absolute lg:inset-0`) within a `lg:relative` parent. This keeps the reminders card from driving grid-row height: it stretches to match the left column (homeowner info + conversation) and scrolls internally rather than expanding the row when there are many reminders. Below `lg`, the reminders card flows naturally beneath the conversation.

## Tests Required
- Unauthenticated user is redirected to `/login`.
- `notFound()` is called when the homeowner row does not exist.
- Homeowner name, phone editor, and location are rendered.
- "Onboarding complete" badge renders when `onboarding_complete === true`.
- "Opted out" badge renders when `opted_out === true`.
- "Pending" badge renders when both `onboarding_complete` and `opted_out` are false.
- `ConversationPanel` receives messages sorted ascending.
- `RemindersPanel` receives reminders sorted by due date ascending.

## Notes for AI Agents
- `params.id` is the homeowner's UUID in the `users` table. RLS ensures the querying staff user can only see homeowners within their tenant.
- Adding new data fields (e.g., warranty info) requires additional Supabase queries and new UI sections; do not extend the existing queries arbitrarily.
