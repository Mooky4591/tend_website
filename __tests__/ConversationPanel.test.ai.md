---
name: ConversationPanel.test
description: Tests for app/dashboard/homeowners/[id]/ConversationPanel — message rendering, bubble styles, staff label, scrollIntoView
type: project
---

# AI Contract: __tests__/ConversationPanel.test.tsx

## Purpose
Unit tests for `app/dashboard/homeowners/[id]/ConversationPanel.tsx`. Verifies empty state, message content rendering, bubble color styles per role (user/assistant/staff), Staff label visibility, and `scrollIntoView` on mount.

## Allowed Responsibilities
- Render `ConversationPanel` with synthetic message arrays.
- Assert on rendered text, CSS class names, and DOM behavior.
- Stub `window.HTMLElement.prototype.scrollIntoView`.

## Not Allowed
- Do not mock the component under test.
- Do not make network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Shows empty state when there are no messages.
- Renders all message contents.
- Applies sand (`bg-sand`) bubble style to user messages.
- Applies brand (`bg-brand-600`) bubble style to assistant messages.
- Applies deep-slate (`bg-deep-slate`) bubble style to staff messages and shows "Staff" label.
- Does not show "Staff" label for user or assistant messages.
- Calls `scrollIntoView` on mount.
