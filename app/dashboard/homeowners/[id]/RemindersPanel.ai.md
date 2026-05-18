# AI Contract: app/dashboard/homeowners/[id]/RemindersPanel.tsx

## Purpose
Client Component (`RemindersPanel`) that manages the full CRUD lifecycle for a homeowner's reminders — listing, inline editing, adding, and deleting — by calling the `/api/reminders` and `/api/reminders/[id]` routes. Uses `router.refresh()` in a `useTransition` for optimistic-style updates.

## Allowed Responsibilities
- Render the list of reminders with `reminder_type`, `due_date`, and a "Sent" indicator.
- Toggle an inline edit form per reminder (`editingId` state).
- Render an "add" form when `adding === true`.
- Call `deleteReminder`, `updateReminder`, and `createReminder` from `@/lib/api/client` for all API mutations.
- Show a shared `error` state for any operation failure.
- Refresh via `startTransition(() => router.refresh())` after mutations.

## Not Allowed
- Do not call Supabase directly.
- Do not accept or send `sent` as an editable field; `sent` is display-only.
- Do not allow multiple simultaneous in-flight requests; buttons are disabled via `busy` while a request is in flight.
- Do not own reminder data fetching; the parent page (`UserDetailPage`) passes `reminders` as a prop.

## Public Interfaces
- `export default function RemindersPanel({ reminders, userId }: { reminders: Reminder[]; userId: string }): JSX.Element`
- `Reminder` is imported from `@/types` — do not re-declare it locally.
- `REMINDER_TYPES` is imported from `@/lib/constants` — do not redeclare it locally.

## Required Patterns
- `'use client'` directive required.
- `busy = isSubmitting || isPending` pattern.
- `refresh()` helper wraps `startTransition(() => router.refresh())`.
- `formatDate` appends `T00:00:00` before parsing to avoid timezone off-by-one on date strings.
- `handleAdd` must validate that `dueDate` is non-empty before the API call.
- Root is a flex column on `lg+` (`lg:flex lg:flex-col lg:flex-1 lg:min-h-0`) so the panel can fill a height-constrained parent. The header row is `lg:flex-shrink-0` and the reminders list is `lg:flex-1 lg:min-h-0 lg:overflow-y-auto`, keeping the header pinned while the list scrolls. Below `lg`, the panel renders in natural flow with no scroll constraints.
- When `adding` flips true or `editingId` changes, scroll the corresponding form into view via `useEffect` + a ref + `scrollIntoView({ block: 'nearest' })`. This prevents the add form (rendered at the bottom of the scrollable list) and the active edit form from being invisible when the list is scrolled. Call `scrollIntoView` optionally (`?.scrollIntoView?.(...)`) so missing implementations (e.g. jsdom) don't throw.

## Tests Required
- Renders all reminders with type and formatted date.
- "Sent" indicator appears only when `r.sent === true`.
- Clicking "Edit" opens inline edit form pre-populated with current values.
- "Cancel" in edit form closes form without calling the API.
- "Save" calls PATCH and refreshes on success.
- "Delete" calls DELETE and refreshes on success.
- "Add" button opens the add form; submitting calls POST.
- Add form requires a due date; shows error if missing.
- Error message is shown when any API call fails.
- All buttons are disabled while `busy === true`.

## Notes for AI Agents
- `REMINDER_TYPES` defines the allowed values for the type `<select>`. Adding a new type requires updating this array.
- The `sent` field is written by a background worker, not by this component. Do not add UI to mark reminders as sent.
