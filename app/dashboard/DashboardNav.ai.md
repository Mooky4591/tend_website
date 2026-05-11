# AI Contract: app/dashboard/DashboardNav.tsx

## Purpose
Client Component (`DashboardNav`) that renders the four-tab horizontal navigation bar inside the dashboard: Overview, Homeowners, Billing, and Warranty Docs. Uses `usePathname` to determine the active tab.

## Allowed Responsibilities
- Render a `<nav>` element containing the four dashboard tabs defined in the `tabs` constant.
- Highlight the active tab using `pathname` comparison: exact match for `/dashboard`, `startsWith` for all others.
- Apply active/inactive Tailwind classes to each `<Link>`.

## Not Allowed
- Do not fetch data or call Supabase.
- Do not handle authentication or redirects.
- Do not add new tabs without updating the `tabs` constant and verifying the corresponding page exists.
- Do not render user-specific content (name, avatar, etc.).

## Public Interfaces
- `export default function DashboardNav(): JSX.Element`
- `tabs` constant (internal, not exported): array of `{ label: string; href: string }`.

## Required Patterns
- `'use client'` directive is required (uses `usePathname`).
- Active detection for `/dashboard` must be an exact match (`pathname === '/dashboard'`), not `startsWith`, to avoid marking it active on sub-routes.
- Active styles: `border-navy text-navy`; inactive: `border-transparent text-muted-foreground/60 hover:text-muted-foreground hover:border-border/30`.

## Tests Required
- Renders all four tab labels: Overview, Homeowners, Billing, Warranty Docs.
- Applies `border-navy` to Overview only when `pathname === '/dashboard'` exactly.
- Applies `border-navy` to Homeowners when `pathname === '/dashboard/homeowners/some-id'`.
- Inactive tabs do not receive `border-navy` (use `border-transparent`).

## Notes for AI Agents
- This component is rendered by `app/dashboard/layout.tsx`, not by individual pages. Do not import it in page files.
- Tab order and labels match the navigation hierarchy. Changing a tab `href` requires a corresponding page route to exist.
