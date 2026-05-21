# AI Contract: lib/supabase/service.ts

## Purpose
Server-side Supabase client factory that uses the service role key, bypassing Row Level Security.
Used exclusively by cron job routes and admin action routes that must operate across tenant boundaries.

## Allowed Responsibilities
- Export `createServiceClient()` that returns a Supabase client initialized with `SUPABASE_SERVICE_ROLE_KEY`.
- Disable token auto-refresh and session persistence (not needed for server-side service calls).
- Throw a clear error when the required environment variables are missing.

## Not Allowed
- Do not expose or import this file in browser (client) code.
- Do not use `createServerClient` from `@supabase/ssr` — this client is NOT cookie-based.
- Do not pass user session cookies to this client.
- Do not add caching or singleton state.
- Do not use `NEXT_PUBLIC_SUPABASE_ANON_KEY`; that belongs in the browser and normal server clients.

## Public Interfaces
- `export function createServiceClient(): SupabaseClient`

## Required Patterns
- Reads `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from `process.env`.
- Throws `Error` with a descriptive message when either variable is missing.
- Sets `auth: { autoRefreshToken: false, persistSession: false }` on the client.

## Tests Required
- `createServiceClient()` returns a client object when env vars are set.
- `createServiceClient()` throws when `SUPABASE_SERVICE_ROLE_KEY` is missing.
- `createServiceClient()` throws when `NEXT_PUBLIC_SUPABASE_URL` is missing.

## Notes for AI Agents
- This client bypasses RLS. Never use it in user-facing route handlers that accept untrusted input.
- Consumed by: `lib/services/qualityMonitor.ts`, `app/api/users/[id]/onboarding-check/route.ts`,
  all `app/api/admin/` routes, and `app/api/cron/` routes.
