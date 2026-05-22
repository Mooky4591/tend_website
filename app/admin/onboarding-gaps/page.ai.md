# AI Contract: app/admin/onboarding-gaps/page.tsx

## Purpose
Onboarding gap review page at `/admin/onboarding-gaps`. Lists all users with
`onboarding_gap_flagged = true`, showing their missing fields and a button to resolve.

## Allowed Responsibilities
- Fetch all users where `onboarding_gap_flagged` is true using the service-role client.
- Display: name, phone, onboarding status badge (Complete / Incomplete), list of missing fields as badges.
- Do NOT display `created_at` as an "Onboarding Completed" date — that field records user
  record creation time, not onboarding completion time, and would mislead reviewers.
- Render a "Mark Resolved" form that POSTs to `/api/admin/onboarding-gaps/[userId]/resolve`.

## Not Allowed
- Do not modify any data here (read-only page).
- Do not use Tailwind CSS.

## Public Interfaces
- `export default async function OnboardingGapsPage(): Promise<JSX.Element>`

## Tests Required
- Renders a row for each user with `onboarding_gap_flagged = true`.
- Renders the missing field badges.
- Shows a "No gaps" message when the list is empty.

## Notes for AI Agents
- Wrapped by `app/admin/layout.tsx`.
