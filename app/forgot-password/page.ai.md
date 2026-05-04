# AI Contract: app/forgot-password/page.tsx

## Purpose
Client Component page (`ForgotPasswordPage`) that accepts an email address, calls `supabase.auth.resetPasswordForEmail` with the correct `redirectTo`, and always shows a neutral success message (never reveals whether the email is registered). Signs the user out before showing success to prevent middleware redirect loops.

## Allowed Responsibilities
- Render an email input form with "Send reset link" button.
- Call `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://trytendr.org/auth/confirm?next=/reset-password' })`.
- Swallow all errors intentionally (to avoid email enumeration).
- Call `supabase.auth.signOut()` after the reset attempt to clear any lingering session.
- Show a static success message after submission regardless of outcome.

## Not Allowed
- Do not reveal whether the provided email address is registered — always show the same success state.
- Do not use the server-side Supabase client.
- Do not redirect to `/dashboard` after reset request; always show the success screen.
- Do not add server-side logic; this is a fully client-side flow.

## Public Interfaces
- `export default function ForgotPasswordPage(): JSX.Element`

## Required Patterns
- `'use client'` directive required.
- `redirectTo` hardcoded to `'https://trytendr.org/auth/confirm?next=/reset-password'`.
- Error from `resetPasswordForEmail` must be swallowed inside a try/catch.
- `supabase.auth.signOut()` called in `finally` before setting `submitted = true`.
- Success screen renders a "Back to sign in" link to `/login`.

## Tests Required
- Renders email input and "Send reset link" button.
- Button is disabled while loading.
- After submission, shows the success/neutral message regardless of whether the email exists.
- "Back to sign in" link navigates to `/login` in both states.
- `signOut` is called regardless of whether `resetPasswordForEmail` succeeds or fails.

## Notes for AI Agents
- The `redirectTo` URL is hardcoded; if the domain changes, update this file.
- Error suppression is intentional and must not be converted to an error display — it would leak email enumeration data.
