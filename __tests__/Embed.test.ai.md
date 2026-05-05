# AI Contract: __tests__/Embed.test.ts

## Purpose
Unit tests for `lib/embed.ts` (`embedChunks`). Verifies batching behavior, result ordering, model selection, and edge cases.

## Allowed Responsibilities
- Mock the `openai` module to control `embeddings.create` outcomes.
- Assert on call counts, call arguments, and result arrays.

## Not Allowed
- Do not make real OpenAI API calls.

## Public Interfaces
- No exports — test file only.

## Required Patterns
- `@jest-environment node` directive required.
- OpenAI mock must use `{ __esModule: true, default: MockOpenAI }` so the default-import binding resolves to the mock constructor.

## Tests Required
- Returns empty array for empty input without calling the API.
- Calls the API once when chunks fit within a single batch.
- Splits into multiple batches of 100 when input exceeds batch size.
- Preserves result order within a batch (sorts by index).
- Concatenates results from multiple batches in order.
- Uses `text-embedding-3-small` as the model.
