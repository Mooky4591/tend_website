# AI Contract: middleware.ts

## Purpose
Next.js middleware that enforces two auth redirect rules: (1) unauthenticated users hitting `/dashboard/:path*` are redirected to `/login`; (2) authenticated users hitting `/login` or `/forgot-password` are redirected to `/dashboard`. Propagates refreshed session cookies on all redirects.

## Allowed Responsibilities
- Construct an inline `createServerClient` (not the shared helper) for Edge-runtime compatibility.
- Propagate cookie mutations from `getUser()` onto all responses (including redirects) so token rotations are not lost.
- Redirect unauthenticated users from `/dashboard` paths to `/login`.
- Redirect authenticated users from `authOnlyPages` to `/dashboard`.
- Return `supabaseResponse` unchanged for all other routes.

## Not Allowed
- Do not import `createClient` from `@/lib/supabase/server`; the middleware must construct its own client to satisfy Next.js middleware constraints.
- Do not perform database queries; only `supabase.auth.getUser()` is permitted.
- Do not add any application logic (data fetching, business rules).
- Do not add routes to the `config.matcher` without also adding corresponding redirect logic.

## Public Interfaces
- `export async function middleware(request: NextRequest): Promise<NextResponse>`
- `export const config: { matcher: string[] }` — currently matches `/dashboard/:path*`, `/login`, `/forgot-password`.

## Required Patterns
- Cookie propagation pattern: `supabaseResponse.cookies.getAll().forEach(cookie => redirectResponse.cookies.set(cookie))` on both redirect paths.
- `authOnlyPages` array must match the `config.matcher` list exactly (minus `/dashboard/:path*`).
- `getUser()` result used only for null-check; no user data is consumed beyond `user !== null`.

## Tests Required
- Unauthenticated request to `/dashboard` redirects to `/login`.
- Unauthenticated request to `/dashboard/users/123` redirects to `/login`.
- Authenticated request to `/login` redirects to `/dashboard`.
- Authenticated request to `/forgot-password` redirects to `/dashboard`.
- Authenticated request to `/dashboard` passes through.
- Unauthenticated request to `/login` passes through.
- Refreshed session cookies from `getUser()` are propagated onto redirect responses.

## Notes for AI Agents
- The `config.matcher` intentionally excludes static assets and API routes; only the listed paths are intercepted.
- Adding a new auth-gated section (e.g., `/admin`) requires adding it to both `config.matcher` and the redirect condition inside `middleware`.
- The cookie copy-on-redirect pattern is critical: without it, a token refresh that happens during `getUser()` would be discarded, causing an infinite redirect loop on the next request.
