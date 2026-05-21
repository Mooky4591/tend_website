# AI Contract: __tests__/AdminLayout.test.tsx

## Purpose
Unit tests for `app/admin/layout.tsx`. Verifies the auth guard (redirect vs pass-through),
the login-loop prevention (no redirect on `/admin/login`), navigation link rendering, and
the logout form.

## Scope
- Auth guard: redirects to `/admin/login` when unauthenticated on a protected page.
- Login-loop fix: does NOT redirect when `x-pathname` header indicates `/admin/login`.
- Authenticated: renders nav links and children without redirecting.
- Logout form: POSTs to `/api/admin/auth` with `action=logout`.

## Not Allowed
- Do not make real HTTP calls or Supabase queries.
- Do not test admin page content — only the layout shell.
