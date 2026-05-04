# AI Contract: lib/supabase/server.ts

## Purpose
Server-side Supabase client factory. Exports `createClient()` which returns a `SupabaseClient` configured for use in Server Components, Route Handlers, and Server Actions, using Next.js `cookies()` for session management.

## Allowed Responsibilities
- Export `createClient()` that wraps `createServerClient` from `@supabase/ssr` with the two public Supabase env vars and a `cookies()` adapter.
- Silently swallow cookie-set errors when called from a Server Component (where `cookieStore.set` is a no-op).

## Not Allowed
- Do not expose or accept the Supabase service role key.
- Do not add caching or singleton state.
- Do not use `createBrowserClient`; that belongs in `lib/supabase/client.ts`.
- Do not call this from `'use client'` components.

## Public Interfaces
- `export function createClient(): SupabaseClient`

## Required Patterns
- Uses `createServerClient` and `type SetAllCookies` from `@supabase/ssr`.
- Reads cookies from `cookies()` from `next/headers`.
- `setAll` implementation wraps `cookieStore.set` in a `try/catch` so Server Components don't throw when attempting to set cookies.
- `getAll` returns `cookieStore.getAll()`.

## Tests Required
- `createClient()` returns a client object without throwing.
- `setAll` does not throw when called in a read-only context (Server Component).

## Notes for AI Agents
- The `try/catch` in `setAll` is intentional per the Supabase SSR guide. Do not remove it.
- The middleware (`middleware.ts`) and `app/auth/callback/route.ts` construct their own `createServerClient` inline to avoid import order issues. This shared helper is for all other server contexts.
- Note that `createClient()` here is synchronous (not `async`), but some call sites use `await createClient()` — this is harmless since awaiting a non-Promise returns the value directly.
