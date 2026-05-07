---
name: seed
description: Idempotent E2E database seed that creates a test tenant, links the E2E auth user, and inserts known homeowners, conversations, and reminders against the test Supabase project
type: project
---

# AI Contract: e2e/seed.ts

## Purpose
Pre-test data setup for the E2E suite. Connects to the test Supabase project using the service role key (bypasses RLS). Safe to run repeatedly — clears and re-creates homeowner data each time while leaving the tenant and auth user untouched.

## Allowed Responsibilities
- Create the E2E test auth user if they do not exist (supabase.auth.admin.createUser).
- Create the "E2E Test Tenant" tenant if it does not exist.
- Upsert the auth user into tenant_users with role=admin.
- Delete existing reminders, conversations, users, and billing snapshots for the tenant, then re-insert known seed rows.
- Insert 3 homeowners (E2E Alice — complete, E2E Bob — queued, E2E Carol — opted out).
- Insert 4 conversation messages and 2 reminders for E2E Alice.
- Insert 3 months of billing snapshots (Feb–Apr 2026) for the test tenant.
- When E2E_TEST_EMAIL_B and E2E_TEST_PASSWORD_B are set: create a second auth user, create "E2E Tenant B", link the second user, clear and re-seed one homeowner (E2E Dave) for tenant B.
- Write { tenantId, aliceId, daveId } to e2e/.seed-state.json (daveId is null when tenant B is not set up).
- Verify that the RLS policies from supabase/migrations/ are applied (sign in as the E2E user with the anon key and query tenant_users); exit with code 1 and clear instructions if they are missing.

## Not Allowed
- Do not touch the production Supabase project — only reads SUPABASE_TEST_URL.
- Do not delete the tenant or auth user (idempotent upsert only).
- Do not insert warranty_documents.
- Do not call any Next.js API routes — all inserts go directly through the service role client.

## Public Interfaces
- No exports — script entry point only, run via `npm run seed:e2e`.

## Environment Variables Required
- SUPABASE_TEST_URL
- SUPABASE_TEST_SERVICE_ROLE_KEY
- SUPABASE_TEST_ANON_KEY
- E2E_TEST_EMAIL
- E2E_TEST_PASSWORD
- E2E_TEST_EMAIL_B (optional — tenant B setup skipped when absent)
- E2E_TEST_PASSWORD_B (optional — tenant B setup skipped when absent)
