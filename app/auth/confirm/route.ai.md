# AI Contract: app/auth/confirm/route.ts

## Purpose
Auth confirmation route handler that supports both PKCE code exchange and OTP token_hash verification (e.g., password-reset emails). Uses `publicOrigin` to build absolute redirect URLs from forwarded proxy headers.

## Allowed Responsibilities
- Resolve the public origin from `x-forwarded-proto` / `x-forwarded-host` / `host` headers via `publicOrigin()`.
- Handle `code` exchange path via `supabase.auth.exchangeCodeForSession`.
- Handle `token_hash` + `type` OTP path via `supabase.auth.verifyOtp`.
- Sanitize `next` to root-relative paths (same open-redirect protection as the callback route).
- Default `next` to `/reset-password` when absent.
- Redirect to `/login?error=code_exchange_failed`, `/login?error=otp_verification_failed`, or `/login?error=missing_auth_params` on failure.

## Not Allowed
- Do not use `createClient()` from `@/lib/supabase/server` without `await` — this route awaits it.
- Do not accept both `code` and `token_hash` at the same time; `code` is checked first and takes priority.
- Do not render JSX or HTML.
- Do not perform any database reads or writes beyond authentication calls.

## Public Interfaces
- `function publicOrigin(request: NextRequest): string` — local helper, not exported.
- `export async function GET(request: NextRequest): Promise<Response>`

## Required Patterns
- `next` defaults to `/reset-password` (not `/dashboard` as in the callback route).
- `publicOrigin` reads `x-forwarded-proto` and `x-forwarded-host` headers to support reverse-proxy deployments.
- All redirects use `new URL(path, origin)` to build absolute URLs.
- Missing both `code` and `token_hash` → redirect to `/login?error=missing_auth_params`.

## Tests Required
- GET with valid `code` redirects to `/reset-password`.
- GET with valid `code` and `next=/dashboard` redirects to `/dashboard`.
- GET with `code` exchange error redirects to `/login?error=code_exchange_failed`.
- GET with valid `token_hash` and `type` redirects to `/reset-password`.
- GET with invalid OTP redirects to `/login?error=otp_verification_failed`.
- GET with neither `code` nor `token_hash` redirects to `/login?error=missing_auth_params`.
- `publicOrigin` returns correct proto+host from forwarded headers.

## Notes for AI Agents
- This route is distinct from `app/auth/callback/route.ts`; do not merge. The callback handles OAuth flows; this handles email link (OTP/PKCE) flows.
- The `type` parameter is typed as `EmailOtpType | null` from `@supabase/supabase-js`.
