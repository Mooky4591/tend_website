# AI Contract: app/admin/login/page.tsx

## Purpose
Admin login page. Shows a password form for unauthenticated visitors at `/admin/login`.
Redirects to `/admin` if already authenticated. Displays an error message when
`?error=` is present in the query string.

## Allowed Responsibilities
- Export a `metadata` object to set the page title (`'Admin Login — Tendr'`).
- Check `isAdminAuthenticated()` and redirect to `/admin` if the session is already valid.
- Render the login card as a normal page component nested inside the admin layout.
- Show the `searchParams.error` message when present.
- Submit to `POST /api/admin/auth` via a standard HTML form.

## Not Allowed
- Do not render `<html>`, `<head>`, or `<body>` tags — this is a nested page; only the root
  layout defines document-level elements.
- Do not import or use Next.js layout components (`app/admin/layout.tsx`) explicitly.
- Do not use Supabase auth.
- Do not implement password validation here — delegate to the API route.
- Do not render with Tailwind classes (uses inline styles only).

## Public Interfaces
- `export const metadata: Metadata`
- `export default function AdminLoginPage({ searchParams }): JSX.Element`

## Tests Required
- Renders a password input and submit button.
- Renders the error message when `searchParams.error` is set.
- Does not render the error when `searchParams.error` is absent.
- Form action points to `/api/admin/auth`.
- Redirects to `/admin` when already authenticated.

## Notes for AI Agents
- This page is wrapped by `app/admin/layout.tsx` (App Router nests all pages under their
  segment layout). The auth redirect loop is prevented in the layout by checking the
  `x-pathname` header (set by middleware) and skipping the guard when the path starts
  with `/admin/login`.
- Consumed by `app/api/admin/auth/route.ts` redirect on failure.
