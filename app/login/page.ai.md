# AI Contract: app/login/page.tsx

## Purpose
Login page (`LoginPage`) that wraps the `LoginForm` client component (which uses `useSearchParams`) in a `<Suspense>` boundary with `LoginShell` as the fallback. `LoginForm` handles email/password sign-in via `supabase.auth.signInWithPassword` and surfaces `?error=` query param errors.

## Allowed Responsibilities
- Export `LoginPage` as the default page component with `<Suspense fallback={<LoginShell />}><LoginForm /></Suspense>`.
- `LoginForm` handles email/password form state, calls `supabase.auth.signInWithPassword`, displays errors, and navigates to `/dashboard` on success.
- Map known `?error` query param values to human-readable messages via `CALLBACK_ERRORS`.
- Link to `/forgot-password` from the form.

## Not Allowed
- Do not use `useSearchParams` outside a `<Suspense>` boundary.
- Do not redirect authenticated users here; that is handled by the middleware for `/login`.
- Do not use the server-side Supabase client; this is a client-side auth flow.
- Do not add sign-up functionality; access is invite-only (contact support copy).

## Public Interfaces
- `export default function LoginPage(): JSX.Element`
- `function LoginForm(): JSX.Element` — internal client component, not exported.
- `const CALLBACK_ERRORS: Record<string, string>` — maps error keys to messages.

## Required Patterns
- `'use client'` directive on the file (for `LoginForm`'s hooks).
- `<Suspense fallback={<LoginShell />}>` wrapping `<LoginForm />`.
- Error display uses `role="alert"` on the error `<div>`.
- On success: `router.push('/dashboard')` then `router.refresh()`.

## Tests Required
- Renders the login form inside a Suspense boundary.
- `?error=auth_callback_failed` shows the human-readable message from `CALLBACK_ERRORS`.
- Unknown error key shows no error initially.
- Successful sign-in navigates to `/dashboard`.
- Supabase error message is displayed when `signInWithPassword` returns an error.
- "Forgot password?" link navigates to `/forgot-password`.

## Notes for AI Agents
- The `CALLBACK_ERRORS` map currently handles only `auth_callback_failed`. Add new keys there when new error codes are introduced from callback/confirm routes.
- The middleware redirects authenticated users away from `/login` to `/dashboard`; do not add that logic here.
