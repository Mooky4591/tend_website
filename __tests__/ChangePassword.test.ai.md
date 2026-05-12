---
name: ChangePassword.test
description: Tests for app/dashboard/settings/change-password/page — password validation, current-password verification, updateUser errors, success redirect, loading state, accessibility
type: project
---

# AI Contract: __tests__/ChangePassword.test.tsx

## Purpose
Unit tests for `app/dashboard/settings/change-password/page.tsx`. Verifies field rendering, mismatched-password error, incorrect-current-password error, Supabase `updateUser` error display, success message and `/dashboard` redirect, loading state, ARIA roles, and cancel link.

## Allowed Responsibilities
- Mock `@/lib/supabase/client` to control `getUser`, `signInWithPassword`, and `updateUser` outcomes.
- Mock `next/navigation` for `useRouter`.
- Assert on field labels, button label/disabled state, error and success message text, ARIA roles, and the cancel link href.

## Not Allowed
- Do not make real network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders current password, new password, and confirm new password fields.
- Renders the "Update password" button and "Cancel" link.
- Shows error when new password and confirm password do not match.
- Shows "Current password is incorrect." when `signInWithPassword` returns an error.
- Shows Supabase error message when `updateUser` fails.
- Shows generic error and re-enables button when an unexpected exception is thrown.
- Shows success message and redirects to `/dashboard` on success.
- Disables button and shows "Updating…" while in flight.
- Disables the button while user email is still loading (getUser not yet resolved).
- Resets loading to false after a successful password change (button shows "Update password", disabled by success).
- Error element has `role="alert"`.
- Success element has `role="status"`.
- New password input has `minLength` of 6.
- Confirm new password input has `minLength` of 6.
- Cancel link points to `/dashboard`.
