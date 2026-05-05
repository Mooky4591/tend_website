---
name: ResetPassword.test
description: Tests for app/reset-password/page — password update, signOut, redirect, error handling, loading state, accessibility, navigation-error recovery
type: project
---

# AI Contract: __tests__/ResetPassword.test.tsx

## Purpose
Unit tests for `app/reset-password/page.tsx`. Verifies password field and button rendering, successful update (signOut then redirect to `/login`), no signOut on failure, Supabase error message display, generic error on throw, loading state ("Updating…"), `minLength` attribute, back-to-sign-in link, `role="alert"` on errors, and navigation-error recovery.

## Allowed Responsibilities
- Mock `@/lib/supabase/client` to control `updateUser` and `signOut` outcomes.
- Mock `next/navigation` for `useRouter`.
- Assert on button state, rendered messages, ARIA roles, and input attributes.

## Not Allowed
- Do not make real network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders the password field and submit button.
- Signs out then redirects to `/login` on success.
- Does not sign out when `updateUser` fails.
- Shows the Supabase error message when `updateUser` fails.
- Error container has `role="alert"`.
- Shows a generic error and re-enables button when `updateUser` throws.
- Disables the button and shows "Updating…" while in flight.
- Password input has `minLength` of 6.
- Has a back to sign in link pointing to `/login`.
- Resets loading state if `router.push` throws after successful update.
