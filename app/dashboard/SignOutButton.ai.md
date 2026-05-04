# AI Contract: app/dashboard/SignOutButton.tsx

## Purpose
Client Component (`SignOutButton`) that calls `supabase.auth.signOut()` via the browser Supabase client, then navigates to `/login`. Displays a transient error message if sign-out fails.

## Allowed Responsibilities
- Render a "Sign out" / "Signing out…" button.
- Call `createClient()` from `@/lib/supabase/client` on click.
- Call `supabase.auth.signOut()` and handle errors inline.
- On success, call `router.push('/login')` and `router.refresh()`.
- Display an error message with `role="alert"` when sign-out fails.

## Not Allowed
- Do not use the server-side Supabase client (`@/lib/supabase/server`).
- Do not redirect using `redirect()` from Next.js navigation; use `router.push`.
- Do not clear cookies manually; sign-out is handled entirely by the Supabase client.
- Do not add additional UI beyond the button and error message.

## Public Interfaces
- `export default function SignOutButton(): JSX.Element`

## Required Patterns
- `'use client'` directive required.
- Button is `disabled` while `loading === true`.
- Error element uses `role="alert"` for accessibility.
- `router.refresh()` is called immediately after `router.push('/login')` to clear any cached server data.

## Tests Required
- Renders "Sign out" button initially.
- Displays "Signing out…" while loading.
- Button is disabled while loading.
- On successful sign-out, navigates to `/login`.
- Displays error message with `role="alert"` when `supabase.auth.signOut()` returns an error.
- Error message is cleared when a new sign-out attempt begins.

## Notes for AI Agents
- This component uses the browser (client) Supabase client, not the server one. Importing from `@/lib/supabase/server` here would break because `cookies()` is not available in a client context.
- The component is rendered in `app/dashboard/layout.tsx` inside the header.
