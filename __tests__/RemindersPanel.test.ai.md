---
name: RemindersPanel.test
description: Tests for app/dashboard/homeowners/[id]/RemindersPanel — list render, edit/save/cancel/delete/add CRUD flows, loading guards, pause/unpause toggle
type: project
---

# AI Contract: __tests__/RemindersPanel.test.tsx

## Purpose
Unit tests for `app/dashboard/homeowners/[id]/RemindersPanel.tsx`. Verifies reminder list rendering, empty state, inline edit form pre-fill, Save (PATCH), Cancel, Delete, Add (POST), due-date validation, in-flight double-click guards for all mutating operations, `router.refresh` after mutations, and the per-user Pause/Unpause toggle (button label, "Paused" pill, greyed cards, in-flight guard, failure handling).

## Allowed Responsibilities
- Stub `global.fetch` to control PATCH/DELETE/POST outcomes.
- Mock `next/navigation` for `useRouter`.
- Mock `react.useTransition` to make transitions synchronous.
- Assert on rendered content, fetch arguments, form state, and error messages.

## Not Allowed
- Do not make real network requests.
- Do not mock the component under test.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders each reminder with type and formatted date; shows "Sent" badge.
- Shows empty state when there are no reminders.
- Clicking Edit shows an editable form pre-filled with current values.
- Save calls PATCH with updated values and calls `router.refresh`.
- Cancel hides the edit form without saving.
- Delete calls DELETE endpoint and calls `router.refresh`.
- Clicking "+ Add" shows the new-reminder form.
- Add calls POST `/api/reminders` with `userId`, type, and date; calls `router.refresh`.
- Shows "Due date is required" error when Add is clicked without a due date.
- Ignores a second Delete click while the first is in flight.
- Ignores a second Save click while the first is in flight.
- Ignores a second Add click while the first is in flight.
- Shows "Failed to delete" error and does not refresh when Delete request returns `ok: false`.
- Shows "Failed to save" error and does not refresh when Save request returns `ok: false`.
- Shows "Failed to add reminder" error and does not refresh when Add request returns `ok: false`.
- Renders the "Pause" button when `remindersPaused={false}`.
- Renders the "Unpause" button and a "Paused" pill when `remindersPaused={true}`.
- Reminder cards have the `opacity-60` greyed-out class when paused; not when unpaused.
- Clicking Pause PATCHes `/api/users/:id/reminders-pause` with `{ paused: true }`, flips the label to "Unpause", and calls `router.refresh`.
- Clicking Unpause PATCHes the same endpoint with `{ paused: false }`, flips the label back, and calls `router.refresh`.
- Shows "Failed to update pause state" and does not flip the button label when the toggle request returns `ok: false`.
- Ignores a second Pause click while the first is in flight.
- Resyncs the toggle when `remindersPaused` prop changes between renders (covers `router.refresh()` returning a newer server value).
- Resyncs the toggle when `userId` prop changes between renders (covers soft-nav reusing this instance for a different homeowner).
- Edit still opens the inline form while paused (regression guard for "Edit/Delete/+ Add remain functional while paused").
- Scrolls the add form into view (`scrollIntoView({ block: 'nearest' })`) when "+ Add" is clicked so it is not hidden below the internal scroll region.
- Scrolls the editing card into view when Edit is clicked.
- Changing the reminder-type select in the edit form updates its value.
- Changing the reminder-type select in the add form updates its value.
- Clicking Cancel in the add form closes it and clears any prior error message.
