# AI Contract: app/api/warranty-upload/route.ts

## Purpose
Route handler that accepts a PDF file upload, extracts and chunks text via `extractAndChunk`, generates vector embeddings via `embedChunks`, and performs an atomic swap of `warranty_documents` rows for the given `plan_name` within the authenticated user's tenant.

## Allowed Responsibilities
- Authenticate the calling user and resolve their `tenant_id` from `tenant_users`.
- Parse `multipart/form-data` to extract `file` (PDF) and `plan_name`.
- Enforce PDF-only uploads and a 10 MB file size limit.
- Call `extractAndChunk` from `@/lib/pdf` to produce text chunks.
- Call `embedChunks` from `@/lib/embed` to produce embedding vectors.
- Perform an atomic swap: snapshot existing row IDs, insert new rows, delete old rows.
- Return `{ chunksInserted: number }` on success.

## Not Allowed
- Do not store the raw PDF file; only chunks and embeddings are persisted.
- Do not accept non-PDF MIME types (enforce `application/pdf`).
- Do not accept files over 10 MB.
- Do not delete old chunks before inserting new ones (swap order must be insert-then-delete to avoid a window with zero rows).
- Do not render JSX or HTML.

## Public Interfaces
- `export async function POST(request: NextRequest): Promise<NextResponse>`

## Required Patterns
- Auth check then tenant membership check; return 401/403 respectively.
- Return 400 if `file` or `plan_name` is missing.
- Return 415 if `file.type !== 'application/pdf'`.
- Return 413 if `file.size > 10 * 1024 * 1024`.
- Return 422 if `extractAndChunk` produces zero chunks.
- Return 502 if `embedChunks` throws.
- Snapshot `existing` row IDs before inserting new rows (atomic swap pattern).
- Each inserted row must include `tenant_id`, `plan_name`, `chunk_index`, `content`, `embedding`.

## Tests Required
- POST returns 401 when no authenticated user.
- POST returns 403 when user has no tenant membership.
- POST returns 400 when `file` or `plan_name` is missing from form data.
- POST returns 415 for a non-PDF MIME type.
- POST returns 413 for a file exceeding 10 MB.
- POST returns 422 when PDF yields no extractable text.
- POST returns 502 when `embedChunks` rejects.
- POST returns `{ chunksInserted }` equal to `chunks.length` on success.
- POST deletes old rows only after new rows are successfully inserted.

## Notes for AI Agents
- PDF parsing is delegated to `lib/pdf.ts` (`extractAndChunk`). Do not parse PDFs inline here.
- Embedding generation is delegated to `lib/embed.ts` (`embedChunks`). Do not call OpenAI directly here.
- The atomic swap pattern (snapshot → insert → delete) is intentional to prevent a moment where no chunks exist for a plan name. Do not change the order.
