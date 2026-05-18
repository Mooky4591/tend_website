---
name: UserRemindersPauseRoute.test
description: Unit tests for app/api/users/[id]/reminders-pause/route.ts — auth, validation, tenant scoping, pause/unpause timestamp toggle
type: project
---

# AI Contract: __tests__/UserRemindersPauseRoute.test.ts

## Purpose
Unit tests for `app/api/users/[id]/reminders-pause/route.ts`. Verifies authentication, admin tenant membership enforcement, body validation, PGRST116-to-404 mapping, and the toggling of `users.reminders_paused_at` between an ISO timestamp (pause) and `null` (unpause).

## Allowed Responsibilities
- Mock `@/lib/supabase/server` `createClient` to intercept auth, tenant_users, and users-table reads/writes.
- Assert on response status codes.
- Assert that the `users` update is called with the expected `reminders_paused_at` value (ISO string when pausing, `null` when unpausing).

## Not Allowed
- Do not make real Supabase requests.
- Do not import or render any React components.
- Do not import server-only modules other than the route under test.

## Public Interfaces
- No exports — test file only.

## Tests Required
- PATCH 401 when unauthenticated.
- PATCH 403 when the caller has no admin membership in any tenant.
- PATCH 400 when `paused` is missing.
- PATCH 400 when `paused` is not a boolean.
- PATCH 404 when row is not found (`PGRST116`).
- PATCH 200 with `reminders_paused_at` set to an ISO timestamp when `paused: true`.
- PATCH 200 with `reminders_paused_at` explicitly set to `null` when `paused: false`.
- PATCH 200 for an admin in multiple tenants — the update is scoped with `.in('tenant_id', [...])` over every admin tenant_id (regression guard against `.maybeSingle()` blowing up on multi-row membership).
- PATCH 500 when the membership query returns a DB error.
- PATCH 500 when the update query fails with a non-`PGRST116` error code.

## Notes for AI Agents
- The route is the sole writer of `users.reminders_paused_at`. Future updates to its contract (e.g., adding audit columns) must be reflected here.
