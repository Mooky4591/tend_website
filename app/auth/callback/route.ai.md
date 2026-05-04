# AI Contract: app/auth/callback/route.ts

## Purpose
OAuth/magic-link callback route handler. Exchanges a `code` query parameter for a Supabase session and redirects the user to the `next` path (defaulting to `/dashboard`), or to `/login?error=auth_callback_failed` on failure.

## Allowed Responsibilities
- Read `code` and `next` from URL search parameters.
- Sanitize `next`: only accept paths starting with `/` that do not start with `//` (open-redirect protection); fall back to `/dashboard`.
- Construct a Supabase server client with cookie read/write using `@supabase/ssr`'s `createServerClient`.
- Call `supabase.auth.exchangeCodeForSession(code)` and redirect on success.

## Not Allowed
- Do not use `createClient` from `@/lib/supabase/server` here; this route constructs its own client inline because it must run before the shared helper is fully bootstrapped.
- Do not redirect to arbitrary external URLs; `next` must be a root-relative path.
- Do not render JSX or HTML.
- Do not perform any database reads or writes beyond the auth exchange.

## Public Interfaces
- `export async function GET(request: Request): Promise<Response>`

## Required Patterns
- `next` sanitization: `rawNext.startsWith('/') && !rawNext.startsWith('//')` before trusting the redirect path.
- On missing or invalid `code`, redirect to `${origin}/login?error=auth_callback_failed`.
- Cookie `setAll` must iterate and call `cookieStore.set` for each cookie entry.

## Tests Required
- GET with a valid `code` redirects to `/dashboard` when `next` is absent.
- GET with a valid `code` and `next=/billing` redirects to `/billing`.
- GET rejects `next=//evil.com` and redirects to `/dashboard` instead.
- GET with no `code` redirects to `/login?error=auth_callback_failed`.
- GET when `exchangeCodeForSession` errors redirects to `/login?error=auth_callback_failed`.

## Notes for AI Agents
- This is a separate code path from `app/auth/confirm/route.ts`, which handles OTP/token_hash flows (e.g., password reset). Do not merge them.
- The inline `createServerClient` is intentional and required by the Supabase SSR auth guide; do not replace it with the shared `@/lib/supabase/server` helper.
