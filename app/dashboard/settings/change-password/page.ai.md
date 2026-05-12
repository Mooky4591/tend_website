# AI Contract: app/dashboard/settings/change-password/page.tsx

## Purpose
Client Component (`ChangePasswordPage`) that allows an authenticated user to change their password from within the dashboard. Verifies the current password before applying the update.

## Allowed Responsibilities
- Render a form with current password, new password, and confirm new password fields.
- Retrieve the authenticated user's email via `supabase.auth.getUser()` on mount.
- Verify the current password by calling `supabase.auth.signInWithPassword`.
- Validate that new password and confirm password match before submitting.
- Call `supabase.auth.updateUser({ password })` to apply the new password.
- Display inline error messages for validation failures, incorrect current password, and Supabase errors.
- Display a success message and redirect to `/dashboard` on success.
- Render a "Cancel" link back to `/dashboard`.

## Not Allowed
- Do not sign the user out after a successful password change; they remain logged in.
- Do not use the server-side Supabase client (`@/lib/supabase/server`).
- Do not redirect using `redirect()` from Next.js; use `router.push`.
- Do not skip current password verification.

## Public Interfaces
- `export default function ChangePasswordPage(): JSX.Element`

## Required Patterns
- `'use client'` directive required.
- Error element uses `role="alert"` for accessibility.
- Success element uses `role="status"` for accessibility.
- Submit button is disabled while `loading === true` or `success === true`.
- New password and confirm password inputs have `minLength={6}`.
- User email is fetched once on mount via `useEffect`.

## Tests Required
- Renders current password, new password, and confirm new password fields.
- Renders "Update password" button and "Cancel" link.
- Shows error when new password and confirm password do not match.
- Shows "Current password is incorrect." when `signInWithPassword` returns an error.
- Shows Supabase error message when `updateUser` fails.
- Shows generic error and re-enables button when an unexpected exception is thrown.
- Shows success message and redirects to `/dashboard` on success.
- Button is disabled and shows "Updating…" while in flight.
- Error element has `role="alert"`.
- Success element has `role="status"`.
- Cancel link points to `/dashboard`.

## Notes for AI Agents
- This page is protected by the dashboard layout, so no separate auth check is needed.
- The user's email is required to call `signInWithPassword`; it is fetched asynchronously on mount.
