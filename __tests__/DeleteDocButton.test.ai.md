---
name: DeleteDocButton.test
description: Tests for app/dashboard/docs/DeleteDocButton — confirm dialog, action invocation, loading state, error handling, double-click guard
type: project
---

# AI Contract: __tests__/DeleteDocButton.test.tsx

## Purpose
Unit tests for `app/dashboard/docs/DeleteDocButton.tsx`. Verifies button render, confirm dialog with plan name, action invoked only on confirmation, loading state ("Deleting…"), error recovery, and in-flight double-click guard.

## Allowed Responsibilities
- Stub `window.confirm`.
- Pass a mock `action` function and assert call counts.
- Assert on button label, disabled state, and error message.

## Not Allowed
- Do not make network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders the Delete button.
- Shows confirm dialog containing the plan name when clicked.
- Does not call `action` when confirm is cancelled.
- Calls `action` when confirm is accepted.
- Shows "Deleting…" and disables the button while action is in flight.
- Shows error message and re-enables button when action throws.
- Ignores a second click while action is in flight.
