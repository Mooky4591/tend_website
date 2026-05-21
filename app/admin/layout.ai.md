# AI Contract: app/admin/layout.tsx

## Purpose
Admin section root layout. Guards all `/admin` routes with cookie-based authentication and
renders the shared navigation bar. Any admin page that is not `/admin/login` is wrapped by
this layout.

## Allowed Responsibilities
- Read `x-pathname` from `headers()` (set by middleware) to determine the current path.
- Call `isAdminAuthenticated()` and redirect to `/admin/login` if the session is invalid,
  **unless** the current path is `/admin/login` (prevents the redirect loop).
- Export a `metadata` object to set the admin segment page title (`'Admin — Tendr'`).
- Import `./admin.css` for admin-section utility classes (buttons, badges, cards, tables).
- Render a top navigation bar with links to all admin pages using inline styles.
- Render the logout button (POST form to `/api/admin/auth` with `action=logout`).
- Pass `children` through as the main content area.

## Not Allowed
- Do not render `<html>`, `<head>`, or `<body>` tags — this is a nested layout; only the root
  layout (`app/layout.tsx`) defines document-level elements.
- Do not use Supabase auth.
- Do not import Tailwind CSS — styling is via inline `style={{}}` props and `./admin.css`.
- Do not fetch any data — the layout is presentation-only.
- Do not render user-specific data.

## Public Interfaces
- `export const metadata: Metadata`
- `export default function AdminLayout({ children }): JSX.Element`

## Tests Required
- Redirects to `/admin/login` when not authenticated.
- Does NOT redirect on `/admin/login` (prevents login loop).
- Renders navigation links to all admin pages when authenticated.
- Renders a logout form that POSTs to `/api/admin/auth`.

## Notes for AI Agents
- `app/admin/login/page.tsx` IS wrapped by this layout (Next.js App Router wraps all
  pages under a segment). The redirect loop is prevented by checking `x-pathname` (set by
  middleware) and skipping the auth guard when the path starts with `/admin/login`.
- The `x-pathname` header is forwarded by the middleware early-return for `/admin/*` routes.
  If middleware is not running (e.g. tests), mock `headers()` to return the correct pathname.
- Adding a new admin page requires adding a nav link to `NAV_LINKS` in this layout.
