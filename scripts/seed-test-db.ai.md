---
name: seed-test-db
description: One-shot Node.js script that populates the test Supabase project with realistic demo data — 45 descriptive homeowners covering every status and failure scenario, conversations for completed homeowners, and 6 months of billing snapshots.
type: script
---

## Responsibilities

- Read `SUPABASE_TEST_URL` and `SUPABASE_TEST_SERVICE_ROLE_KEY` from `.env.local`.
- Read the tenant ID from `e2e/.seed-state.json` (requires `seed:e2e` to have run first).
- Delete and re-insert seed homeowners identified by phone prefix `+15552`.
- Insert 45 homeowners with descriptive names that represent every possible status:
  - 20 completed-onboarding homeowners
  - 3 pending (added to system, SMS not yet sent)
  - 3 queued (SMS scheduled)
  - 2 each for 7 failure reasons: invalid_number, landline, disconnected, delivery_timeout, network_error, carrier_blocked, account_error
  - 5 opted-out homeowners
- Insert 3 conversation messages (user → assistant → user) per completed-onboarding homeowner.
- Insert 2 reminders per completed-onboarding homeowner.
- Delete and re-insert 6 months of `monthly_billing_snapshots` for the tenant (Nov 2025 – Apr 2026).
- Print a detailed summary of inserted records.

## Not Allowed

- Touching the production Supabase project (`NEXT_PUBLIC_SUPABASE_URL`).
- Deleting or modifying E2E users Alice, Bob, Carol, or Dave (identified by +15550 phone prefix).
- Adding business logic (pricing, calculations, routing).
- Being imported by application source files.
