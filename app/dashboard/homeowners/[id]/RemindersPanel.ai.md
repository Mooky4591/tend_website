# AI Contract: app/dashboard/homeowners/[id]/RemindersPanel.tsx

## Purpose
Client Component (`RemindersPanel`) that manages the full CRUD lifecycle for a homeowner's reminders — listing, inline editing, adding, deleting, and pausing/unpausing send-out — by calling the `/api/reminders`, `/api/reminders/[id]`, and `/api/users/[id]/reminders-pause` routes. Uses `router.refresh()` in a `useTransition` for optimistic-style updates.

## Allowed Responsibilities
- Render the list of reminders with `reminder_type`, `due_date`, and a "Sent" indicator.
- Toggle an inline edit form per reminder (`editingId` state).
- Render an "add" form when `adding === true`.
- Call `deleteReminder`, `updateReminder`, `createReminder`, and `setRemindersPaused` from `@/lib/api/client` for all API mutations.
- Show a shared `error` state for any operation failure.
- Refresh via `startTransition(() => router.refresh())` after mutations.
- Render a Pause/Unpause toggle button next to the "+ Add" button. The button label is `Pause` when not paused and `Unpause` when paused (read from local state seeded by the `remindersPaused` prop).
- When paused, render a "Paused" pill in the header and apply an `opacity-60` greyed-out class to each reminder card so users see at a glance that send-out is suspended.

## Not Allowed
- Do not call Supabase directly.
- Do not accept or send `sent` as an editable field; `sent` is display-only.
- Do not accept or send `skipped_at` as an editable field; `skipped_at` is written only by the background reminder-sending worker.
- Do not allow multiple simultaneous in-flight requests; buttons are disabled via `busy` while a request is in flight.
- Do not own reminder data fetching; the parent page (`UserDetailPage`) passes `reminders` and `remindersPaused` as props.
- Do not disable Edit / Delete / + Add while paused — the worker, not the UI, enforces send-suppression, and managers must still be able to adjust the schedule.

## Public Interfaces
- `export default function RemindersPanel({ reminders, userId, remindersPaused }: { reminders: Reminder[]; userId: string; remindersPaused: boolean }): JSX.Element`
- `Reminder` is imported from `@/types` — do not re-declare it locally.
- `REMINDER_TYPES` is imported from `@/lib/constants` — do not redeclare it locally.

## Required Patterns
- `'use client'` directive required.
- `busy = isSubmitting || isPending` pattern.
- `refresh()` helper wraps `startTransition(() => router.refresh())`.
- `formatDate` appends `T00:00:00` before parsing to avoid timezone off-by-one on date strings.
- `handleAdd` must validate that `dueDate` is non-empty before the API call.
- `handleTogglePause` flips a local `paused` state only after the API call returns `ok: true`; on failure the state is left untouched so the UI reflects the persisted truth.
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
- Renders `Pause` when `remindersPaused={false}` and `Unpause` when `remindersPaused={true}`.
- Clicking the toggle calls `PATCH /api/users/<userId>/reminders-pause` with `{ paused: <next> }`, flips the label on success, and shows `Failed to update pause state` on failure.
- After a successful pause, each reminder card container has the `opacity-60` greyed-out class.
- Edit / Delete / + Add remain functional while `remindersPaused={true}`.
- Ignores a second pause toggle click while the first is in flight.

## Notes for AI Agents
- `REMINDER_TYPES` defines the allowed values for the type `<select>`. Adding a new type requires updating this array.
- The `sent` field is written by a background worker, not by this component. Do not add UI to mark reminders as sent.
- The `skipped_at` field on `Reminder` is also worker-owned. When the background reminder-sending worker is implemented, it must read `users.reminders_paused_at`. If non-null: (1) do not send SMS; (2) for any of that user's reminders whose `due_date <= now()` and `skipped_at IS NULL`, set `skipped_at = now()` and advance `due_date` to the next interval for that `reminder_type`. The UI never writes `skipped_at`. See column COMMENTs in `supabase/migrations/20260518000000_add_reminders_pause.sql`.
