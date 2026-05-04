# AI Contract: app/reset-password/page.tsx

## Purpose
Client Component page (`ResetPasswordPage`) that accepts a new password and calls `supabase.auth.updateUser({ password })`. On success, signs the user out and redirects to `/login`.

## Allowed Responsibilities
- Render a password input form (minimum 6 characters via `minLength={6}`).
- Call `supabase.auth.updateUser({ password })` using the browser Supabase client.
- Display Supabase error messages on failure.
- On success: call `supabase.auth.signOut()` then navigate to `/login`.

## Not Allowed
- Do not use the server-side Supabase client.
- Do not add a confirm-password field (current form has only one password field).
- Do not redirect to `/dashboard` after password reset; always go to `/login` after sign-out.

## Public Interfaces
- `export default function ResetPasswordPage(): JSX.Element`

## Required Patterns
- `'use client'` directive required.
- Error element uses `role="alert"`.
- `minLength={6}` on the password input.
- `autoComplete="new-password"` on the input.
- `supabase.auth.signOut()` must be called before navigating to `/login`.

## Tests Required
- Renders "Set your new password" heading and password input.
- Button is disabled while loading.
- Displays Supabase error message when `updateUser` fails.
- On success, calls `signOut` and navigates to `/login`.
- "Back to sign in" link navigates to `/login`.

## Notes for AI Agents
- This page is only reachable after the user has clicked a password-reset link, which creates a session via `app/auth/confirm/route.ts`. The session token is consumed here by `updateUser`.
- Signing out after the password update is intentional — it forces the user to log in with their new credentials.
