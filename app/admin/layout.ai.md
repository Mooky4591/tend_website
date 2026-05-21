# AI Contract: app/admin/layout.tsx

## Purpose
Admin section root layout. Guards all `/admin` routes with cookie-based authentication and
renders the shared navigation bar. Any admin page that is not `/admin/login` is wrapped by
this layout.

## Allowed Responsibilities
- Call `isAdminAuthenticated()` and redirect to `/admin/login` if the session is invalid.
- Render the `<html>`, `<head>`, and `<body>` tags with global admin styles (inline `<style>`).
- Render a top navigation bar with links to all admin pages.
- Render the logout button (POST form to `/api/admin/auth` with `action=logout`).
- Pass `children` through as the main content area.

## Not Allowed
- Do not use Supabase auth.
- Do not import Tailwind CSS — all styling is via inline styles and the embedded `<style>` tag.
- Do not fetch any data — the layout is presentation-only.
- Do not render user-specific data.

## Public Interfaces
- `export default function AdminLayout({ children }): JSX.Element`

## Tests Required
- Redirects to `/admin/login` when not authenticated.
- Renders navigation links to all admin pages when authenticated.
- Renders a logout form that POSTs to `/api/admin/auth`.

## Notes for AI Agents
- The `app/admin/login/page.tsx` does NOT use this layout — it renders its own `<html>` so
  the redirect loop cannot occur.
- Adding a new admin page requires adding a nav link to `NAV_LINKS` in this layout.
