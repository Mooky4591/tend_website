---
name: SignOutButton.test
description: Tests for app/dashboard/SignOutButton — sign-out flow, error handling, loading state, accessibility
type: project
---

# AI Contract: __tests__/SignOutButton.test.tsx

## Purpose
Unit tests for `app/dashboard/SignOutButton.tsx`. Verifies button render, successful sign-out with `/login` redirect and refresh, error message on failure, loading state ("Signing out…"), re-enable after failure, accessibility (role="alert"), and navigation-error recovery.

## Allowed Responsibilities
- Mock `@/lib/supabase/client` to control `signOut` outcomes.
- Mock `next/navigation` for `useRouter`.
- Assert on button label, disabled state, rendered error text, and ARIA roles.

## Not Allowed
- Do not make real network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders a sign out button.
- Calls `signOut` and redirects to `/login` on success.
- Shows an error message and does not redirect when `signOut` fails.
- Resets loading state if `router.push` throws after successful sign-out.
- Disables the button and shows "Signing out…" while in flight.
- Re-enables the button after a failed sign-out.
- Error message has `role="alert"` so screen readers announce it.
