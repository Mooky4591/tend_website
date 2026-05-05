---
name: MessageForm.test
description: Tests for app/dashboard/users/[id]/MessageForm — send button state, fetch call, trim, clear, error, loading, double-click guard, Enter key
type: project
---

# AI Contract: __tests__/MessageForm.test.tsx

## Purpose
Unit tests for `app/dashboard/users/[id]/MessageForm.tsx`. Verifies disabled-until-content send button, correct fetch call arguments, whitespace trimming, textarea clear on success, router refresh, error display, loading state, in-flight double-click guard, and Enter/Shift+Enter keyboard behavior.

## Allowed Responsibilities
- Stub `global.fetch` to control API outcomes.
- Mock `next/navigation` for `useRouter`.
- Mock `react.useTransition` to make transitions synchronous.
- Assert on button state, fetch arguments, textarea value, and rendered text.

## Not Allowed
- Do not make real network requests.
- Do not mock the component under test.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders the textarea and a disabled send button when empty.
- Enables the send button when the textarea has content.
- Calls the API with the correct `userId` and `message` on click.
- Trims whitespace before sending.
- Clears the textarea and calls `router.refresh` on success.
- Shows an error message when the API returns an error.
- Disables the button and shows "Sending…" for the full fetch round-trip.
- Ignores a second click while a send is already in flight.
- Submits on Enter and does not submit on Shift+Enter.
