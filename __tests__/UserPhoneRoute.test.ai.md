# AI Contract: __tests__/UserPhoneRoute.test.ts

## Purpose
Unit tests for `app/api/users/[id]/phone/route.ts`.

## Required Coverage
- PATCH returns 401 when unauthenticated.
- PATCH returns 403 when the caller has no admin membership in any tenant.
- PATCH returns 400 for empty input.
- PATCH returns 404 when row is not found (`PGRST116`).
- PATCH returns 200 with updated phone on success.
- PATCH returns 200 for an admin in multiple tenants — the update is scoped with `.in('tenant_id', [...])` over every admin tenant_id (regression guard against `.maybeSingle()` blowing up on multi-row membership).
- PATCH returns 500 when the membership query returns a DB error.
- PATCH returns 500 when the update query fails with a non-`PGRST116` error code.
