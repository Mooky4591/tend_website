# AI Contract: __tests__/supabaseClient.test.ts

## Purpose
Verifies that `lib/supabase/client.ts` constructs a Supabase browser client using `createBrowserClient` and the two `NEXT_PUBLIC_` env vars.

## Allowed Responsibilities
- Mock `@supabase/ssr`'s `createBrowserClient` and capture its arguments.
- Assert that `createClient()` returns the mocked client.
- Assert that the public URL and anon key are forwarded.
- Assert that no singleton state is maintained (a new client is constructed on every call).

## Not Allowed
- Do not call into the real Supabase JS client.

## Public Interfaces
None — this is a test file.

## Required Patterns
- Runs under the `node` jest environment.
- Uses dynamic `import()` after setting env vars.

## Tests Required
- `createClient()` returns a client.
- Forwards `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Calls `createBrowserClient` once per invocation (no singleton).
