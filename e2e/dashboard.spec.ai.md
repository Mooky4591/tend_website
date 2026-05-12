---
name: dashboard.spec
description: E2E tests for the /dashboard overview page — combined stat card and dashboard navigation tabs; requires stored auth state
type: project
---

# AI Contract: e2e/dashboard.spec.ts

## Purpose
End-to-end tests for the authenticated /dashboard overview page. Validates that the combined stat card renders all three labels with numeric values and that the top navigation tabs navigate correctly.

## Allowed Responsibilities
- Use storageState: 'e2e/.auth/user.json' for all tests.
- Assert the combined stat card shows all three labels: Total homeowners, Completed Onboarding, Opted out.
- Assert each stat value is numeric.
- Assert the tenant name heading is present.
- Assert nav tab links navigate to /dashboard/homeowners, /dashboard/billing, /dashboard/docs.

## Not Allowed
- Do not include sign-out tests here (lives in z_signout.spec.ts).
- Do not mock Supabase queries — the dashboard reads real data from the test tenant.
- Do not test individual user/docs/billing content (covered by their own spec files).

## Public Interfaces
- No exports — test file only.

## Tests Required
- Total homeowners, Completed Onboarding, Opted out labels visible in the combined stat card.
- Each stat value matches /^\d[\d,]*$/.
- Tenant name heading visible.
- Nav shows Overview, Homeowners, Billing, Warranty Docs tabs.
- Clicking Homeowners tab reaches /dashboard/homeowners.
- Clicking Billing tab reaches /dashboard/billing.
- Clicking Warranty Docs tab reaches /dashboard/docs.
