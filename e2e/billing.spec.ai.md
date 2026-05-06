---
name: billing.spec
description: E2E tests for /dashboard/billing — page heading, table column headers, empty/populated row state, and contact section
type: project
---

# AI Contract: e2e/billing.spec.ts

## Purpose
End-to-end tests for the billing page. Reads real Supabase data from the test tenant. Tests handle both the empty state (no snapshots) and the populated state.

## Allowed Responsibilities
- Use storageState: 'e2e/.auth/user.json' for all tests.
- Assert "Billing" heading and "Monthly usage snapshots" subtitle are visible.
- Assert all five table column headers are present.
- Assert either billing rows or the empty-state row is shown.
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
- Either billing rows or "No billing data yet" empty state.
- Contact section with Questions about your bill and support@trytendr.org link.
