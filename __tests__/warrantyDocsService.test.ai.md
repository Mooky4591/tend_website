---
name: warrantyDocsService.test
description: Unit tests for lib/services/warrantyDocs.ts — PDF parse, embed, atomic DB swap, and all failure paths
type: project
---

# AI Contract: __tests__/warrantyDocsService.test.ts

## Purpose
Unit tests for `lib/services/warrantyDocs.ts`. Verifies success, all error paths (422/502/500), correct row shape on insert, atomic swap ordering (insert before delete), and that delete is skipped when there are no existing chunks.

## Allowed Responsibilities
- Provide a plain mock Supabase object as the dependency.
- Mock `@/lib/pdf` (`extractAndChunk`) and `@/lib/embed` (`embedChunks`) to control their outputs.
- Track insert/delete call order to verify the atomic swap invariant.

## Not Allowed
- Do not mock `@/lib/services/warrantyDocs` itself — test the real implementation.
- Do not test HTTP-layer concerns; those belong in `WarrantyUpload.test.ts`.

## Public Interfaces
- No exports — test file only.

## Required Patterns
- `@jest-environment node` directive required.
- The inner `eq()` mock for `plan_name` in `makeSupabase` must be a named variable (`mockPlanNameEq`) exposed as `_mockPlanNameEq` on the returned object so tests can assert on its call arguments.

## Tests Required
- Returns `{ chunksInserted: N }` on success.
- Returns `{ status: 422 }` when `extractAndChunk` returns an empty array.
- Returns `{ status: 422 }` when `extractAndChunk` throws a `PdfParseError`.
- Returns `{ status: 500 }` when `extractAndChunk` throws an unexpected (non-`PdfParseError`) error.
- Returns `{ status: 502 }` when `embedChunks` throws.
- Inserted rows include correct `tenant_id`, `plan_name`, `chunk_index`, `content`, and `embedding`.
- Existing-chunks query filters by the correct `plan_name` (asserted via `_mockPlanNameEq`).
- `insert` is called before `delete` (atomic swap order verified via call order tracking).
- `delete` is not called when there are no existing chunks.
- Returns `{ status: 500 }` with error containing "Chunks inserted but old chunks could not be removed" when delete fails after insert succeeds.

## Notes for AI Agents
- If the atomic swap order in `warrantyDocs.ts` ever changes, this test suite will catch it.
