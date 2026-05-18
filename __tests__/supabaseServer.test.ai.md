# AI Contract: __tests__/supabaseServer.test.ts

## Purpose
Verifies that `lib/supabase/server.ts` constructs a Supabase server client whose `cookies` adapter correctly proxies `getAll` to `next/headers` `cookies()` and whose `setAll` swallows write errors raised in Server Components.

## Allowed Responsibilities
- Mock `next/headers` `cookies()` and capture interactions with `getAll` / `set`.
- Mock `@supabase/ssr`'s `createServerClient` to capture the cookie adapter config.
- Trigger `getAll` and `setAll` directly via the captured config and assert behavior.

## Not Allowed
- Do not call into a real Supabase backend.

## Public Interfaces
None — this is a test file.

## Required Patterns
- Runs under the `node` jest environment.
- Uses dynamic `import()` so env vars are applied before module load.

## Tests Required
- `createClient()` returns a client.
- `cookies.getAll` proxies to `next/headers` cookies().
- `cookies.setAll` writes each entry to the store with its options.
- `cookies.setAll` does not throw when `cookieStore.set` throws (Server Component context).
