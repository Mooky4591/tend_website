---
name: billing.spec
description: E2E tests for /dashboard/billing — page heading, table column headers, seeded billing rows with specific counts, and contact section
type: project
---

# AI Contract: e2e/billing.spec.ts

## Purpose
End-to-end tests for the billing page. Reads real Supabase data from the test tenant seeded by `e2e/seed.ts`. Tests assert specific seeded rows are rendered correctly.

## Allowed Responsibilities
- Use storageState: 'e2e/.auth/user.json' for all tests.
- Assert "Billing" heading and "Monthly usage snapshots" subtitle are visible.
- Assert all five table column headers are present.
- Assert that seeded billing rows are rendered (not the empty state).
- Assert the most recent seeded month (April 2026) appears in the first row with correct counts.
- Assert the contact section with support@trytendr.org is visible.

## Not Allowed
- Do not mock Supabase queries — billing reads real data.
- Do not create or delete billing snapshot records.
- Do not test server-side aggregation logic.

## Public Interfaces
- No exports — test file only.

## Tests Required
- "Billing" h1 and subtitle visible.
- Month, Active users, New users, Reminders sent, Conversations table headers.
- Table body has exactly 3 rows (one per seeded month).
- First row shows "April 2026" as the month.
- First row shows correct counts: 42 active users, 5 new users, 18 reminders sent, 130 conversations.
- Contact section with "Questions about your bill?" and support@trytendr.org link.
