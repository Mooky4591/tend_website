# AI Contract: lib/embed.ts

## Purpose
Server-side utility module that generates OpenAI text embeddings for an array of text chunks using the `text-embedding-3-small` model in batches of 100. Provides `embedChunks` as the single public function.

## Allowed Responsibilities
- Lazily initialize a singleton `OpenAI` client from `process.env.OPENAI_API_KEY`.
- Batch input chunks in groups of `BATCH_SIZE` (100) to respect API limits.
- Sort embedding results by `index` before mapping to preserve chunk order.
- Return a flat `number[][]` array of embeddings in the same order as the input.

## Not Allowed
- Do not call this from client components; this is a server-only module (uses `process.env.OPENAI_API_KEY` without the `NEXT_PUBLIC_` prefix).
- Do not change the model from `text-embedding-3-small` without updating downstream vector column dimensions in Supabase.
- Do not expose or log the API key.
- Do not add retry logic here; let the caller handle failures.

## Public Interfaces
- `export async function embedChunks(chunks: string[]): Promise<number[][]>`
- `const BATCH_SIZE = 100` — internal constant.

## Required Patterns
- Singleton `_openai` client initialized in `getClient()`.
- Batch loop: `for (let i = 0; i < chunks.length; i += BATCH_SIZE)`.
- `.sort((a, b) => a.index - b.index)` on OpenAI response data before mapping.

## Tests Required
- Returns an array of the same length as the input chunks.
- Handles input arrays larger than 100 elements by batching.
- Each returned embedding is a `number[]`.
- Results preserve the original chunk order (index sorting is correct).

## Notes for AI Agents
- The embedding model (`text-embedding-3-small`) produces 1536-dimensional vectors. The `warranty_documents.embedding` column in Supabase must match this dimension. Changing the model requires a schema migration.
- Embedding generation is called only from `app/api/warranty-upload/route.ts`. Do not call it from client components or the browser.
