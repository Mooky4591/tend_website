# AI Contract: lib/pdf.ts

## Purpose
Server-side utility module providing `extractAndChunk` (extracts text from a PDF buffer and chunks it) and `chunkText` (splits a string into overlapping 500-word chunks with a 50-word overlap). Used by the warranty upload API route.

## Allowed Responsibilities
- Export `chunkText(text: string): string[]` that splits on whitespace into 500-word windows with 50-word overlap.
- Export `extractAndChunk(buffer: Buffer): Promise<string[]>` that uses `pdf-parse` (via `require`) to extract text, then calls `chunkText`.
- Export `PdfParseError extends Error` to signal user-facing PDF format failures (invalid structure, password-protected, malformed format) as distinct from server-side faults.
- Filter out empty chunks.

## Not Allowed
- Do not call this from client components; it uses Node.js `Buffer` and `require`.
- Do not add sentence-boundary or paragraph-aware splitting without updating the chunk size constants.
- Do not import `pdf-parse` via ESM at the top level; it must remain a `require()` inside the function to avoid Next.js bundling issues.

## Public Interfaces
- `export class PdfParseError extends Error`
- `export function chunkText(text: string): string[]`
- `export async function extractAndChunk(buffer: Buffer): Promise<string[]>`

## Required Patterns
- `chunkText`: `size = 500` words, `step = size - 50` (50-word overlap).
- `extractAndChunk`: destructures `PDFParse` from `require('pdf-parse')` (v2 API) inside the function body with an ESLint disable comment; calls `new PDFParse({ data: buffer })`, wraps `getText()` in `try/catch/finally`; in the catch block, if the error's `name` is in `{ InvalidPDFException, PasswordException, FormatError }` it re-throws as `PdfParseError`, otherwise re-throws unchanged; calls `await parser.destroy()` in the `finally` block so resources are always released.
- Empty-string chunks are filtered with `.filter(Boolean)` (via `if (chunk.trim()) chunks.push(chunk)`).

## Tests Required
- `chunkText` returns one chunk for input with fewer than 500 words.
- `chunkText` returns overlapping chunks for input exceeding 500 words.
- `chunkText` filters out empty/whitespace-only chunks.
- `extractAndChunk` returns an array of strings when given a valid PDF buffer.
- `extractAndChunk` returns an empty array for a PDF with no extractable text.
- `extractAndChunk` calls `destroy()` after a successful extraction.
- `extractAndChunk` calls `destroy()` even when `getText()` throws.
- `extractAndChunk` throws `PdfParseError` when `getText()` throws a known pdf-parse user error (e.g. `InvalidPDFException`).
- `extractAndChunk` re-throws non-PDF errors unchanged.

## Notes for AI Agents
- The 50-word overlap is intentional for retrieval quality. Do not remove it.
- `pdf-parse` is required via `require()` to avoid a Next.js edge runtime bundling conflict. Do not convert to a top-level ESM import.
- Chunk size (500 words) and overlap (50 words) must stay consistent with how embeddings are stored in Supabase; changing them requires a full re-upload of all documents.
