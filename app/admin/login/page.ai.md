# AI Contract: app/admin/login/page.tsx

## Purpose
Admin login page. Shows a password form for unauthenticated visitors at `/admin/login`.
Redirects to `/admin` if already authenticated. Displays an error message when
`?error=` is present in the query string.

## Allowed Responsibilities
- Check `isAdminAuthenticated()` and redirect to `/admin` if the session is already valid.
- Render a standalone HTML login page (not wrapped by the admin layout).
- Show the `searchParams.error` message when present.
- Submit to `POST /api/admin/auth` via a standard HTML form.

## Not Allowed
- Do not import or use Next.js layout components (`app/admin/layout.tsx`).
- Do not use Supabase auth.
- Do not implement password validation here — delegate to the API route.
- Do not render with Tailwind classes (uses inline styles only).

## Public Interfaces
- `export default function AdminLoginPage({ searchParams }): JSX.Element`

## Tests Required
- Renders a password input and submit button.
- Renders the error message when `searchParams.error` is set.
- Does not render the error when `searchParams.error` is absent.
- Form action points to `/api/admin/auth`.

## Notes for AI Agents
- This page renders `<html>` and `<body>` tags directly because it is intentionally outside
  the admin layout (to avoid the auth redirect loop).
- Consumed by `app/api/admin/auth/route.ts` redirect on failure.
