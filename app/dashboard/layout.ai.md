# AI Contract: app/dashboard/layout.tsx

## Purpose
Server Component layout (`DashboardLayout`) that wraps all `/dashboard` routes. Authenticates the session, redirects unauthenticated users to `/login`, and renders the shared header (logo + `SignOutButton`), `DashboardNav`, and a `<main>` slot.

## Allowed Responsibilities
- Authenticate the user via `createClient()` from `@/lib/supabase/server`.
- Redirect to `/login` if no authenticated user.
- Render the fixed header with `/logo.png`, `SettingsMenu`, and `SignOutButton`.
- Render `DashboardNav` below the header.
- Render `{children}` inside a `<main>` element.

## Not Allowed
- Do not fetch tenant-specific data here; individual pages are responsible for their own queries.
- Do not add per-page navigation logic; tab management belongs in `DashboardNav`.
- Do not render page-specific content; only the shared shell.

## Public Interfaces
- `export default async function DashboardLayout({ children }: { children: React.ReactNode }): Promise<JSX.Element>`

## Required Patterns
- Auth check and redirect must happen before any JSX is returned.
- Logo is rendered with `<Image src="/logo.png" alt="Tendr" width={102} height={34} priority />`.
- `SettingsMenu` and `SignOutButton` are rendered together in a flex container in the header.
- `<main>{children}</main>` is the slot for page content.
- Background uses `dashboard-bg` (navy→brand-900 gradient with subtle grid overlay defined in `globals.css`); header is `bg-white border-b border-border/20`.

## Tests Required
- Unauthenticated users are redirected to `/login`.
- Authenticated users see the logo, SettingsMenu, SignOutButton, and DashboardNav.
- `children` are rendered inside `<main>`.

## Notes for AI Agents
- This layout applies to all routes under `/dashboard`. Auth logic here is a belt-and-suspenders check; the middleware also guards `/dashboard/:path*`.
- Do not add Supabase data fetching here — each child page fetches what it needs.
