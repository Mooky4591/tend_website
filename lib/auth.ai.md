# AI Contract: lib/auth.ts

## Purpose
Shared server-side authentication helper that extracts the current staff user's tenant ID from the `tenant_users` table. Eliminates the 6+ copy-paste tenant-lookup queries that previously existed in Route Handlers and Server Actions.

## Allowed Responsibilities
- Export `getTenantId(supabase, userId)` which queries `tenant_users` for the `auth_user_id` and returns the `tenant_id` string, or `null` if not found.

## Not Allowed
- Do not perform the `auth.getUser()` call here — callers are responsible for fetching the user before calling this helper.
- Do not redirect or throw on a missing tenant; return `null` so callers decide the error behavior (API routes return 403, pages may redirect).
- Do not import `next/navigation` or `next/server` — this module is framework-agnostic.
- Do not cache results — each request should query fresh data.

## Public Interfaces
- `export async function getTenantId(supabase: SupabaseClient<any, any, any>, userId: string): Promise<string | null>`

## Required Patterns
- Single Supabase query: `from('tenant_users').select('tenant_id').eq('auth_user_id', userId).single()`.
- Return `data?.tenant_id ?? null`.
- Row-level security on `tenant_users` ensures a staff user can only see their own membership row.

## Tests Required
- Returns the tenant ID string when the membership row exists.
- Returns `null` when the user has no membership row.
- The calling route returns 403 when `getTenantId` returns `null`.

## Notes for AI Agents
- Used in: `app/api/warranty-upload/route.ts`, `app/api/warranty-docs/[planName]/route.ts`, `app/dashboard/billing/page.tsx`, `app/dashboard/homeowners/page.tsx`, `app/dashboard/docs/page.tsx` (server action).
- `app/dashboard/page.tsx` does NOT use this helper because it joins `tenants(name)` in the same query — a separate `getTenantId` call would be wasteful.
- The `supabase` parameter must be the server client returned by `lib/supabase/server.createClient()`, not the browser client.
