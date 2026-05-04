# AI Contract: app/api/warranty-docs/[planName]/route.ts

## Purpose
Route handler that deletes all `warranty_documents` rows for a given `planName` scoped to the authenticated user's tenant. Used by the dashboard when a staff user removes a warranty plan document.

## Allowed Responsibilities
- Authenticate the calling user via `createClient()` from `@/lib/supabase/server`.
- Resolve the caller's `tenant_id` from the `tenant_users` table.
- Delete all rows in `warranty_documents` matching both `tenant_id` and `plan_name`.
- Return `{ ok: true }` on success.

## Not Allowed
- Do not delete documents belonging to other tenants; always filter by resolved `tenant_id`.
- Do not accept a body payload; the plan name comes from `params.planName` only.
- Do not re-embed or touch the `warranty_documents` table beyond deletion.
- Do not render JSX or HTML.
- Do not perform the upload operation; that belongs in `app/api/warranty-upload/route.ts`.

## Public Interfaces
- `export async function DELETE(_request: NextRequest, { params }: { params: { planName: string } }): Promise<NextResponse>`

## Required Patterns
- Auth check first; return 401 if no user.
- Tenant membership check second; return 403 if no `tenant_users` row found.
- Delete filtered by both `tenant_id` and `plan_name`.

## Tests Required
- DELETE returns 401 when no authenticated user.
- DELETE returns 403 when user has no `tenant_users` row.
- DELETE returns `{ ok: true }` when deletion succeeds.
- DELETE returns 500 when Supabase delete fails.
- DELETE does not affect rows belonging to a different tenant.

## Notes for AI Agents
- `planName` is URL-encoded by the browser; ensure the handler uses `params.planName` directly without manual decoding (Next.js decodes route segments automatically).
- The corresponding upload/re-embed operation lives in `app/api/warranty-upload/route.ts`.
- The delete in `app/dashboard/docs/page.tsx` (server action) performs the same operation for the Server Component path; keep them consistent.
