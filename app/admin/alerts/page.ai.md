# AI Contract: app/admin/alerts/page.tsx

## Purpose
System alerts page at `/admin/alerts`. Lists all unresolved `system_alerts` rows with user info
and a "Resolve" button.

## Allowed Responsibilities
- Fetch unresolved alerts with joined user data using the service-role client.
- Display: alert type badge, user name/phone (if applicable), description, created timestamp.
- Render a "Resolve" form that POSTs to `/api/admin/alerts/[id]/resolve`.

## Not Allowed
- Do not modify data here (read-only page).
- Do not use Tailwind CSS.

## Public Interfaces
- `export default async function AlertsPage(): Promise<JSX.Element>`

## Tests Required
- Renders a row per unresolved alert.
- Renders user info when user_id is set on the alert.
- Shows "No alerts" when list is empty.

## Notes for AI Agents
- Wrapped by `app/admin/layout.tsx`.
