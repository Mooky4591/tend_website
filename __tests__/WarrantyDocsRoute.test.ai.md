# AI Contract: __tests__/WarrantyDocsRoute.test.ts

## Purpose
Integration tests for `app/api/warranty-docs/[planName]/route.ts` (DELETE handler). Verifies auth, the 403 path triggered when `getTenantId` returns null, successful deletion, DB failure, and that the correct `planName` param is passed to the query.

## Allowed Responsibilities
- Mock `@/lib/supabase/server` to control auth and tenant lookup outcomes.
- Assert on HTTP status codes and response bodies.

## Not Allowed
- Do not mock `@/lib/auth` (getTenantId) itself — the mock supabase client flows through it correctly.
- Do not test upload or re-embed logic here.

## Public Interfaces
- No exports — test file only.

## Required Patterns
- `@jest-environment node` directive required.

## Tests Required
- Returns 401 when unauthenticated.
- **Returns 403 when `getTenantId` returns null (user has no `tenant_users` row).** — satisfies `lib/auth.ai.md` requirement.
- Returns `{ ok: true }` on successful deletion.
- Returns 500 when Supabase delete fails.
- Passes `planName` param to the DB delete without double-decoding.

## Notes for AI Agents
- The 403 is produced by `forbidden()` from `@/lib/api-response` when `getTenantId` returns null.
- If the route gains new behaviors, add corresponding tests here.
