# AI Contract: lib/supabase/client.ts

## Purpose
Browser-side Supabase client factory. Exports `createClient()` which returns a `SupabaseClient` configured for use in Client Components via `@supabase/ssr`'s `createBrowserClient`.

## Allowed Responsibilities
- Export `createClient()` that wraps `createBrowserClient` with the two public Supabase env vars.
- Be imported only in client-side code (`'use client'` components).

## Not Allowed
- Do not use `cookies()` from `next/headers` here; that belongs in `lib/supabase/server.ts`.
- Do not add service role keys or any secrets; only `NEXT_PUBLIC_` vars are allowed.
- Do not add caching, singleton state, or retry logic.
- Do not import from this file in Server Components or Route Handlers; use `lib/supabase/server.ts` there.

## Public Interfaces
- `export function createClient(): SupabaseClient`

## Required Patterns
- Uses `createBrowserClient` from `@supabase/ssr`.
- Reads `process.env.NEXT_PUBLIC_SUPABASE_URL!` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!`.
- No cookie store configuration (browser client manages cookies natively).

## Tests Required
- `createClient()` returns a client object without throwing.
- The client is created with the correct URL and anon key.

## Notes for AI Agents
- `createClient` from this file is used in: `SignOutButton`, `LoginPage` (LoginForm), `ForgotPasswordPage`, `ResetPasswordPage`.
- Do not use this in Route Handlers (`app/api/`) or Server Components. Those must use `lib/supabase/server.ts`.
