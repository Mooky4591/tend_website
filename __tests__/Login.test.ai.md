# AI Contract: __tests__/Login.test.tsx

## Purpose
Integration tests for `app/login/page.tsx` (`LoginPage`) and `app/login/LoginShell.tsx`. Verifies login form behavior, error states, redirect on success, loading states, and the `LoginShell` fallback UI.

## Allowed Responsibilities
- Render `LoginPage` and `LoginShell` and assert on the resulting DOM.
- Mock `@/lib/supabase/client` to control `signInWithPassword` outcomes.
- Mock `next/navigation` to assert on `router.push` and `router.refresh` calls.
- Test URL parameter handling (`?error=auth_callback_failed`).

## Not Allowed
- Do not make real network requests or call Supabase directly.
- Do not test internal implementation details (e.g., state variable names, specific hook internals).
- Do not import server-only modules or `next/server`.

## Public Interfaces
- No exports — test file only.

## Required Patterns
- Use `screen.getByRole('img', { name: 'Tendr' })` to assert the brand logo (not `getByText`).
- Use `userEvent.setup()` for all user interactions.
- Clear mocks in `beforeEach` via `jest.clearAllMocks()`.

## Tests Required
- Renders email/password fields and submit button.
- Redirects to `/dashboard` on successful login.
- Shows Supabase error message on failed login.
- Disables submit button while request is in flight.
- Clears previous error on resubmit.
- Resets loading state if `router.push` throws.
- Shows user-friendly error for `?error=auth_callback_failed`.
- Shows no error when error param is absent.
- Ignores unknown error param values.
- `LoginShell` renders the brand logo and a pulsing placeholder card (no form inputs).
- Renders a contact support mailto link.
- Renders a forgot password link pointing to `/forgot-password`.
- Shows generic error and re-enables button when `signInWithPassword` throws.
- Error container has `role="alert"` for screen reader accessibility.

## Notes for AI Agents
- Consumed by: CI test suite only.
- If `LoginPage` or `LoginShell` changes its public UI (e.g., new fields, changed text), update these tests to match.
