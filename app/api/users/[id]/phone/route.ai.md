# AI Contract: app/api/users/[id]/phone/route.ts

## Purpose
Authenticated API route to update one homeowner's `phone_number` field from the dashboard.

## Allowed Responsibilities
- Verify authenticated user via Supabase auth and ensure the caller has at least one admin `tenant_users` membership.
- Resolve the caller's admin `tenant_id`s (one or many — staff can admin multiple tenants) and scope the `users` update with `.in('tenant_id', tenantIds)`.
- Validate non-empty `phoneNumber` input.
- Update `users.phone_number` scoped to both `params.id` and the caller's admin tenant_ids.
- Return JSON API responses using `lib/api-response` helpers.

## Not Allowed
- Do not update other user fields.
- Do not send SMS or call external providers.
- Do not perform client rendering.

## Public Interfaces
- `export async function PATCH(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse>`

## Required Patterns
- Return 401 when unauthenticated.
- Return 403 when the caller has no admin membership in any tenant.
- Return 400 for empty phone values.
- Map `PGRST116` to 404.
- Fetch the caller's admin memberships with a plain `.select('tenant_id').eq('auth_user_id', user.id).eq('role', 'admin')` — **do not** use `.maybeSingle()` or `.single()` here, because `tenant_users` allows multiple admin rows per `auth_user_id` (the UNIQUE constraint is on `(tenant_id, auth_user_id)`, not on `auth_user_id` alone) and the single-row helpers would throw for multi-tenant admins.
- Always scope the `users` update with `.in('tenant_id', tenantIds)` derived from the admin memberships — never rely on `params.id` alone to scope the write.

## Tests Required
- PATCH 401 when unauthenticated.
- PATCH 403 when the caller has no admin membership in any tenant.
- PATCH 400 for empty input.
- PATCH 404 when row not found.
- PATCH 200 with updated phone on success.
- PATCH 200 for an admin who belongs to multiple tenants — the update is scoped with `.in()` over all admin tenant_ids.
