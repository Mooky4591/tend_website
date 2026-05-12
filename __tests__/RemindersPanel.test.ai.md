---
name: RemindersPanel.test
description: Tests for app/dashboard/homeowners/[id]/RemindersPanel — list render, edit/save/cancel/delete/add CRUD flows, loading guards
type: project
---

# AI Contract: __tests__/RemindersPanel.test.tsx

## Purpose
Unit tests for `app/dashboard/homeowners/[id]/RemindersPanel.tsx`. Verifies reminder list rendering, empty state, inline edit form pre-fill, Save (PATCH), Cancel, Delete, Add (POST), due-date validation, in-flight double-click guards for all three operations, and `router.refresh` after mutations.

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
