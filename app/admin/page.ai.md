# AI Contract: app/admin/page.tsx

## Purpose
Admin dashboard home page at `/admin`. Shows high-level statistics across the platform and
provides quick links to other admin sections.

## Allowed Responsibilities
- Fetch aggregate counts from `users`, `conversations`, `reminders`, and `system_alerts` using the service-role client.
- Display: total users, onboarding complete count, onboarding gaps flagged, conversations today, reminders sent this week, unresolved alerts, AI-quality-flagged conversations (last 7 days).
- Render quick-link buttons to other admin pages.

## Not Allowed
- Do not render individual records — only aggregate counts.
- Do not accept user input.
- Do not use Tailwind CSS (uses inline styles and global admin styles from the layout).

## Public Interfaces
- `export default async function AdminDashboardPage(): Promise<JSX.Element>`

## Tests Required
- Renders all stat cards with correct labels.
- Renders quick-link buttons.

## Notes for AI Agents
- Wrapped by `app/admin/layout.tsx`; the auth check is performed there.
- Uses the service-role client to count across all tenants.
