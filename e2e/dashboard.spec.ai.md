---
name: dashboard.spec
description: E2E tests for the /dashboard overview page — stat cards and dashboard navigation tabs; requires stored auth state
type: project
---

# AI Contract: e2e/dashboard.spec.ts

## Purpose
End-to-end tests for the authenticated /dashboard overview page. Validates that stat cards render with numeric values and that the top navigation tabs navigate correctly.

## Allowed Responsibilities
- Use storageState: 'e2e/.auth/user.json' for all tests.
- Assert the three stat cards (Total homeowners, Fully provisioned, Opted out) are visible.
- Assert each stat card shows a numeric value.
- Assert the tenant name heading is present.
- Assert nav tab links navigate to /dashboard/users, /dashboard/billing, /dashboard/docs.

## Not Allowed
- Do not include sign-out tests here (lives in z_signout.spec.ts).
- Do not mock Supabase queries — the dashboard reads real data from the test tenant.
- Do not test individual user/docs/billing content (covered by their own spec files).

## Public Interfaces
- No exports — test file only.

## Tests Required
- Total homeowners, Fully provisioned, Opted out stat cards visible.
- Each stat value matches /^\d[\d,]*$/.
- Tenant name heading visible.
- Nav shows Overview, Users, Billing, Warranty Docs tabs.
- Clicking Users tab reaches /dashboard/users.
- Clicking Billing tab reaches /dashboard/billing.
- Clicking Warranty Docs tab reaches /dashboard/docs.
