# AI Contract: middleware.ts

## Purpose
Next.js middleware with two responsibilities: (1) forward the `x-pathname` request header so
Server Components can read the current path without client hooks; (2) enforce Supabase auth
redirects for dashboard and login routes. Admin routes are handled separately — the middleware
passes them through with `x-pathname` set but skips Supabase auth (admin uses its own
cookie-based auth via `isAdminAuthenticated()`).

## Allowed Responsibilities
- Set `x-pathname` on the forwarded request headers for ALL matched routes so Server Components
  (especially `AdminLayout`) can determine the current path.
- For `/admin/:path*`: return early with `NextResponse.next({ request: { headers: requestHeaders } })`
  — skip Supabase auth entirely.
- Construct an inline `createServerClient` (not the shared helper) for non-admin routes.
- Propagate cookie mutations from `getUser()` onto all responses (including redirects) so token rotations are not lost.
- Redirect unauthenticated users from `/dashboard` paths to `/login`.
- Redirect authenticated users from `authOnlyPages` to `/dashboard`.
- Return `supabaseResponse` (with x-pathname header) unchanged for all non-admin, non-redirect routes.

## Not Allowed
- Do not import `createClient` from `@/lib/supabase/server`; the middleware must construct its own client to satisfy Next.js middleware constraints.
- Do not perform database queries; only `supabase.auth.getUser()` is permitted.
- Do not add any application logic (data fetching, business rules).
- Do not add routes to the `config.matcher` without also updating this contract and adding
  either an early-return path (like the admin pass-through) or a redirect rule.

## Public Interfaces
- `export async function middleware(request: NextRequest): Promise<NextResponse>`
- `export const config: { matcher: string[] }` — currently matches `/dashboard/:path*`, `/login`, `/forgot-password`, `/admin/:path*`.

## Required Patterns
- Cookie propagation pattern: `supabaseResponse.cookies.getAll().forEach(cookie => redirectResponse.cookies.set(cookie))` on both redirect paths.
- `authOnlyPages` array must match the `config.matcher` list exactly (minus `/dashboard/:path*`).
- `getUser()` result used only for null-check; no user data is consumed beyond `user !== null`.

## Tests Required
- Unauthenticated request to `/dashboard` redirects to `/login`.
- Unauthenticated request to `/dashboard/homeowners/123` redirects to `/login`.
- Authenticated request to `/login` redirects to `/dashboard`.
- Authenticated request to `/forgot-password` redirects to `/dashboard`.
- Authenticated request to `/dashboard` passes through.
- Unauthenticated request to `/login` passes through.
- Refreshed session cookies from `getUser()` are propagated onto redirect responses.

## Notes for AI Agents
- The `config.matcher` intentionally excludes static assets and API routes; only the listed paths are intercepted.
- Adding a new auth-gated section (e.g., `/admin`) requires adding it to both `config.matcher` and the redirect condition inside `middleware`.
- The cookie copy-on-redirect pattern is critical: without it, a token refresh that happens during `getUser()` would be discarded, causing an infinite redirect loop on the next request.
