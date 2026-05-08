# AI Contract: app/api/users/[id]/phone/route.ts

## Purpose
Authenticated API route to update one homeowner's `phone_number` field from the dashboard.

## Allowed Responsibilities
- Verify authenticated user via Supabase auth.
- Validate non-empty `phoneNumber` input.
- Update `users.phone_number` by `params.id`.
- Return JSON API responses using `lib/api-response` helpers.

## Not Allowed
- Do not update other user fields.
- Do not send SMS or call external providers.
- Do not perform client rendering.

## Public Interfaces
- `export async function PATCH(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse>`

## Required Patterns
- Return 401 when unauthenticated.
- Return 400 for empty phone values.
- Map `PGRST116` to 404.

## Tests Required
- PATCH 401 when unauthenticated.
- PATCH 400 for empty input.
- PATCH 404 when row not found.
- PATCH 200 with updated phone on success.
