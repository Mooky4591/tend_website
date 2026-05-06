---
name: auth.spec
description: E2E tests for auth guards (unauthenticated redirects), login form, forgot password, reset password page structure — no stored auth state used
type: project
---

# AI Contract: e2e/auth.spec.ts

## Purpose
End-to-end tests for the authentication flows that do not require a stored auth session. Covers middleware redirect behavior, login form UX, forgot password submission, and reset password page structure.

## Allowed Responsibilities
- Assert that unauthenticated visits to /dashboard/* redirect to /login.
- Assert login form field rendering, error display for wrong credentials, and error display for invalid auth callback query params.
- Assert forgot password form submission shows success message.
- Assert reset password page renders correct fields.

## Not Allowed
- Do not use storageState — all tests must work without an authenticated session.
- Do not test sign-out here (lives in z_signout.spec.ts to run last).
- Do not create or modify database records.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Auth guard: unauthenticated visit to /dashboard, /dashboard/users, /dashboard/docs, /dashboard/billing each redirect to /login.
- Login page: email field, password field, Sign in button, Forgot password link visible.
- Login: wrong password shows role=alert error.
- Login: ?error=auth_callback_failed shows expired/invalid message.
- Forgot password: form renders email input and Send reset link button.
- Forgot password: any email submission shows "If that email is registered" message.
- Forgot password: success screen shows Back to sign in link.
- Reset password: form renders password input and Update password button.
- Reset password: Back to sign in link visible.
