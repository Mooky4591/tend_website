---
name: users.spec
description: E2E tests for the users list and user detail page — table columns, navigation to detail, conversation panel, MessageForm (mocked send), and RemindersPanel CRUD (real API for create/delete, mocked for edit)
type: project
---

# AI Contract: e2e/users.spec.ts

## Purpose
End-to-end tests for /dashboard/homeowners and /dashboard/homeowners/[id]. Uses real Supabase data where possible; mocks POST /api/send-message to avoid sending real SMS. Reminder create/delete hit real Supabase; edit is mocked to avoid side effects.

## Allowed Responsibilities
- Use storageState: 'e2e/.auth/user.json' for all tests.
- Navigate to /dashboard/homeowners and assert table columns.
- Conditionally navigate to the first user's detail page (skip tests if no users exist).
- Assert detail page shows Conversation section, MessageForm textarea, and RemindersPanel.
- Mock POST /api/send-message to test send success (textarea clears) and send failure (error shown).
- Assert + Add button opens the new-reminder form.
- Assert clicking Add without a date shows validation error.
- Create and then delete a reminder against real Supabase (full round-trip).
- Mock PATCH /api/reminders/* for edit test to avoid stale test data accumulation.

## Not Allowed
- Do not send real SMS — always mock /api/send-message.
- Do not leave test reminders in the database — any reminder created must be deleted in the same test.
- Do not test server-side API logic (covered by Reminders.test.ts and SendMessage.test.ts).

## Public Interfaces
- No exports — test file only.
- getSeedState() is a local helper that reads e2e/.seed-state.json (written by seed.ts) and returns { aliceId } or null. Not exported.

## Tests Required
- Users list: Homeowners heading and total count visible.
- Users list: Name, Phone, Location, Status table headers.
- Users list: user link or empty state.
- Users list: clicking user name navigates to /dashboard/homeowners/:id.
- User detail: Conversation heading, MessageForm textarea, Scheduled Reminders heading.
- User detail: Back to homeowners link.
- User detail: phone number in monospace font.
- MessageForm: Send disabled when textarea empty.
- MessageForm: Send enabled after typing.
- MessageForm: mocked success clears textarea.
- MessageForm: mocked failure shows error text.
- RemindersPanel: + Add button visible.
- RemindersPanel: + Add opens form with select and date input.
- RemindersPanel: Cancel hides the add form.
- RemindersPanel: Add without date shows "Due date is required".
- RemindersPanel: full create → delete round-trip via real API.
- RemindersPanel: edit shows prefilled form, mocked save closes form.
