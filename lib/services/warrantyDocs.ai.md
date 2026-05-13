# AI Contract: lib/services/warrantyDocs.ts

## Purpose
Business-logic service for ingesting a warranty PDF: parsing text, generating embeddings, and performing an atomic swap of document chunks in the database. Extracted from the Route Handler so the route only handles HTTP concerns.

## Allowed Responsibilities
- Call `extractAndChunk` from `lib/pdf.ts` to parse the PDF buffer into text chunks.
- Call `embedChunks` from `lib/embed.ts` to generate vector embeddings.
- Query existing `warranty_documents` rows for the tenant/plan to capture old IDs.
- Insert new chunk rows with `{ tenant_id, plan_name, chunk_index, content, embedding }`.
- Delete old rows by ID after successful insert (atomic swap — new chunks are visible before old are removed).
- Return `{ chunksInserted: number }` on success or `{ error: string; status: number }` on any failure.

## Not Allowed
- Do not call `createClient()` here — accept the supabase client as a parameter (dependency injection).
- Do not construct `NextResponse` objects — return a plain descriptor for the Route Handler.
- Do not reorder the insert/delete sequence; insert must always precede delete.
- Do not validate the file type or size here — those checks belong in the Route Handler before calling this service.

## Public Interfaces
- `export async function uploadWarrantyDoc(supabase, tenantId: string, planName: string, buffer: Buffer): Promise<{ error: string; status: number } | { chunksInserted: number }>`

## Required Patterns
- Wrap `extractAndChunk` in `try/catch`; return `{ error: 'Failed to parse PDF', status: 422 }` if it throws.
- Return `{ error: 'No text could be extracted from this PDF', status: 422 }` when `extractAndChunk` returns an empty array.
- Wrap `embedChunks` in `try/catch`; return `{ error: 'Failed to generate embeddings', status: 502 }` on failure.
- `chunk_index` must be the zero-based position of the chunk in the extracted array.
- Insert new rows before deleting old ones (atomic swap).
- Skip the delete step entirely when there are no existing rows (`oldIds.length === 0`).
- Return `{ error: 'Chunks inserted but old chunks could not be removed: ' + deleteError.message, status: 500 }` if the delete step fails.

## Tests Required
- Returns `{ chunksInserted: N }` on success.
- Returns status 422 when no text is extracted.
- Returns status 502 when `embedChunks` throws.
- Insert is called before delete (verified via call order tracking).
- Delete is not called when there are no existing chunks.
- Returns status 500 with correct message when delete fails after insert succeeds.
- Inserted rows include correct `tenant_id`, `plan_name`, `chunk_index`, `content`, and `embedding`.

## Notes for AI Agents
- Consumed exclusively by `app/api/warranty-upload/route.ts`.
- The `planName` parameter is expected to already be trimmed by the caller.
- The atomic swap preserves availability: new chunks are queryable before old ones are removed, so a concurrent AI query during upload will see either old or new chunks, not zero chunks.
