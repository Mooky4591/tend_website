# AI Contract: __tests__/AuthCallback.test.ts

## Purpose
Integration tests for `app/auth/callback/route.ts` (GET handler). Verifies code exchange, redirect targets, open-redirect protection on the `next` param, and error redirect on missing or failed code exchange.

## Allowed Responsibilities
- Mock `@supabase/ssr` to control `exchangeCodeForSession` outcomes.
- Assert on redirect status (307) and `location` header values.

## Not Allowed
- Do not test the confirm flow here; that belongs in `AuthConfirm.test.ts`.

## Public Interfaces
- No exports — test file only.

## Required Patterns
- `@jest-environment node` directive required.

## Tests Required
- Redirects to `/dashboard` on successful code exchange.
- Redirects to a valid relative `next` param on success.
- Ignores a `next` param starting with `//` (open-redirect guard).
- Redirects to `/login?error=auth_callback_failed` when no code is present.
- Redirects to `/login?error=auth_callback_failed` when code exchange fails.
- `getAll` callback delegates to `cookieStore.getAll()` and returns its result.
- `setAll` callback writes each cookie entry to the cookie store via `cookieStore.set`.
