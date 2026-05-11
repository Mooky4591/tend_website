# AI Contract: app/api/users/[id]/phone/route.ts

## Purpose
Authenticated API route to update one homeowner's `phone_number` field from the dashboard.

## Allowed Responsibilities
- Verify authenticated user via Supabase auth and ensure the caller has an admin tenant_users membership.
- Resolve the caller's `tenant_id` from the admin membership row and scope the update to that tenant.
- Validate non-empty `phoneNumber` input.
- Update `users.phone_number` scoped to both `params.id` and the caller's `tenant_id`.
- Return JSON API responses using `lib/api-response` helpers.

## Not Allowed
- Do not update other user fields.
- Do not send SMS or call external providers.
- Do not perform client rendering.

## Public Interfaces
- `export async function PATCH(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse>`

## Required Patterns
- Return 401 when unauthenticated.
- Return 403 when authenticated but not an admin tenant member.
- Return 400 for empty phone values.
- Map `PGRST116` to 404.
- Always select `tenant_id` from the `tenant_users` admin row and pass it as a second `eq` filter on the `users` update — never rely on `params.id` alone to scope the write.

## Tests Required
- PATCH 401 when unauthenticated.
- PATCH 403 when authenticated but not an admin member.
- PATCH 400 for empty input.
- PATCH 404 when row not found.
- PATCH 200 with updated phone on success.
