# AI Contract: app/api/warranty-upload/route.ts

## Purpose
Route handler for PDF warranty document uploads. Owns only HTTP concerns: authentication, tenant resolution, multipart parsing, and file validation. PDF extraction, embedding generation, and the atomic DB swap are fully delegated to `lib/services/warrantyDocs.ts`.

## Allowed Responsibilities
- Authenticate the calling user via `createClient()` from `@/lib/supabase/server`.
- Resolve `tenant_id` via `getTenantId` from `@/lib/auth`.
- Parse `multipart/form-data` to extract `file` (PDF) and `plan_name`.
- Enforce PDF-only uploads (`application/pdf`) and a 10 MB file size limit.
- Convert the `File` to a `Buffer` and call `uploadWarrantyDoc` from `@/lib/services/warrantyDocs`.
- Translate the service's error descriptor `{ error, status }` into the matching `NextResponse`, or call `revalidatePath('/dashboard/docs')` and return `{ chunksInserted }` on success.

## Not Allowed
- Do not call `extractAndChunk` or `embedChunks` directly — delegated to `lib/services/warrantyDocs.ts`.
- Do not perform the atomic swap (insert/delete) directly — delegated to `lib/services/warrantyDocs.ts`.
- Do not store the raw PDF file; only chunks and embeddings are persisted.
- Do not accept non-PDF MIME types.
- Do not accept files over 10 MB.
- Do not render JSX or HTML.

## Public Interfaces
- `export async function POST(request: NextRequest): Promise<NextResponse>`

## Required Patterns
- Auth check then tenant membership check; return 401/403 respectively.
- Return 400 if `file` or `plan_name` is missing.
- Return 415 if `file.type !== 'application/pdf'`.
- Return 413 if `file.size > 10 * 1024 * 1024`.
- Pass trimmed `plan_name` to `uploadWarrantyDoc`.
- Translate service error descriptors to named helpers: `unprocessableEntity` for 422, `badGateway` for 502, `serverError` for all other failures.
- Return `ok({ chunksInserted })` on success.

## Tests Required
- POST returns 401 when no authenticated user.
- POST returns 403 when user has no tenant membership.
- POST returns 400 when `file` or `plan_name` is missing from form data.
- POST returns 415 for a non-PDF MIME type.
- POST returns 413 for a file exceeding 10 MB.
- POST returns 422 when PDF yields no extractable text (service returns `{ status: 422 }`).
- POST returns 502 when embedding generation fails (service returns `{ status: 502 }`).
- POST returns `{ chunksInserted }` equal to `chunks.length` on success.

## Notes for AI Agents
- All PDF/embedding/DB logic lives in `lib/services/warrantyDocs.ts`. This route is intentionally thin.
- The atomic swap (insert-before-delete) is enforced inside the service, not here.
- `plan_name` must be trimmed before passing to the service.
