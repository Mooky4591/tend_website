---
name: seed-test-db
description: One-shot Node.js script that populates the test Supabase project with realistic homeowner, reminder, and billing snapshot data for development use.
type: script
---

## Responsibilities

- Read `SUPABASE_TEST_URL` and `SUPABASE_TEST_SERVICE_ROLE_KEY` from `.env.local`.
- Read the tenant ID from `e2e/.seed-state.json`.
- Delete and re-insert seed homeowners identified by phone prefix `+15552`.
- Insert reminders for fully-onboarded homeowners.
- Delete and re-insert `monthly_billing_snapshots` for the tenant.
- Print a summary of inserted records.

## Not Allowed

- Touching the production Supabase project (`NEXT_PUBLIC_SUPABASE_URL`).
- Deleting or modifying Alice or Dave (the e2e auth-linked users).
- Adding business logic (pricing, calculations, routing).
- Being imported by application source files.
