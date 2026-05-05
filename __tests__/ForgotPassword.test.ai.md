---
name: ForgotPassword.test
description: Tests for app/forgot-password/page — email form, reset email dispatch, signOut, success screen, always-show-success security behavior
type: project
---

# AI Contract: __tests__/ForgotPassword.test.tsx

## Purpose
Unit tests for `app/forgot-password/page.tsx`. Verifies email field and button rendering, loading state, always-show-success behavior (even on throws), `resetPasswordForEmail` call with correct `redirectTo`, `signOut` call after submission, and back-to-sign-in links.

## Allowed Responsibilities
- Mock `@/lib/supabase/client` to control `resetPasswordForEmail` and `signOut` outcomes.
- Assert on button state, rendered messages, and mock call arguments.

## Not Allowed
- Do not make real network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders the email field and submit button.
- Has a back to sign in link pointing to `/login`.
- Disables the button and shows "Sending…" while in flight.
- Shows the success message after submit regardless of outcome.
- Shows the success message even when `resetPasswordForEmail` throws.
- Calls `resetPasswordForEmail` with the entered email and a `redirectTo` pointing to `/auth/confirm`.
- Calls `signOut` after sending the reset email to clear any lingering session.
- Calls `signOut` even when `resetPasswordForEmail` throws.
- Success screen has a back to sign in link pointing to `/login`.
