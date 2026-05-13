# AI Contract: __tests__/WarrantyUpload.test.ts

## Purpose
Integration tests for `app/api/warranty-upload/route.ts` (POST handler). Verifies auth, the 403 path triggered when `getTenantId` returns null, all validation responses, service-delegated error codes, and success.

## Allowed Responsibilities
- Mock `@/lib/supabase/server` to control auth and tenant lookup outcomes.
- Mock `@/lib/pdf` and `@/lib/embed` to control extraction and embedding outcomes.
- Mock `next/cache` to intercept `revalidatePath` calls.
- Assert on HTTP status codes, response bodies, DB call arguments, and cache invalidation.

## Not Allowed
- Do not mock `@/lib/auth` (getTenantId) itself — the mock supabase client flows through it correctly.
- Do not test service internals here; `warrantyDocsService.test.ts` owns those.

## Public Interfaces
- No exports — test file only.

## Required Patterns
- `@jest-environment node` directive required.

## Tests Required
- Returns 401 when unauthenticated.
- **Returns 403 when `getTenantId` returns null (user has no `tenant_users` row).** — satisfies `lib/auth.ai.md` requirement.
- Returns 400 when `file` or `plan_name` is missing.
- Returns 413 when file exceeds 10 MB.
- Returns 415 for a non-PDF MIME type.
- Returns 422 when PDF yields no extractable text.
- Returns 502 when `embedChunks` rejects.
- Inserts new chunks with correct fields including `chunk_index`.
- Returns `{ chunksInserted }` on success.
- Atomic swap: inserts before deleting old chunks.
- Skips delete when there are no existing chunks.
- Returns 500 when old-chunk delete fails after insert succeeds.
- Calls `revalidatePath('/dashboard/docs')` on successful upload.

## Notes for AI Agents
- The 403 is produced by `forbidden()` from `@/lib/api-response` when `getTenantId` returns null.
- If the route gains new validation steps, add corresponding tests here.
