# AI Contract: __tests__/middleware.test.ts

## Purpose
Integration tests for `middleware.ts`. Verifies route protection (unauthenticated redirect to `/login`), authenticated redirect away from auth pages, cookie propagation on redirects, and pass-through for non-protected paths.

## Allowed Responsibilities
- Mock `@supabase/ssr` to control `getUser` outcomes and capture the `setAll` cookie callback.
- Assert on redirect status, `location` header, and `set-cookie` header.

## Not Allowed
- Do not test business logic; middleware only handles auth routing.

## Public Interfaces
- No exports — test file only.

## Required Patterns
- `@jest-environment node` directive required.

## Tests Required
- Unauthenticated: redirects `/dashboard` and `/dashboard/*` to `/login`.
- Unauthenticated: allows `/login` and `/forgot-password` through without redirecting.
- Unauthenticated: copies refreshed cookies onto the redirect response.
- Authenticated: redirects `/login` and `/forgot-password` to `/dashboard`.
- Authenticated: allows `/dashboard` through without redirecting.
- Authenticated: copies refreshed session cookies onto the redirect response.
