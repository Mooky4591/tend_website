---
name: auth.test
description: Unit tests for lib/auth.ts — getTenantId with present and absent membership rows
type: project
---

# AI Contract: __tests__/auth.test.ts

## Purpose
Unit tests for `lib/auth.ts`. Verifies that `getTenantId` returns the correct tenant ID string when the membership row exists and returns `null` when it does not.

## Allowed Responsibilities
- Import and test `getTenantId` from `@/lib/auth`.
- Provide a plain mock Supabase object as the dependency (no module-level mocks needed).

## Not Allowed
- Do not mock `@/lib/supabase/server` — the function receives the client as a parameter.
- Do not test routing/redirect behavior here; that belongs in page/route tests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Returns the tenant ID string when the `tenant_users` row exists.
- Returns `null` when the user has no membership row.

## Notes for AI Agents
- If `getTenantId` changes its query shape (e.g., different table or column), update the mock helper in this file to match.
