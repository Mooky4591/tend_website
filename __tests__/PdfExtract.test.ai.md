---
name: PdfExtract.test
description: Tests for lib/pdf.ts (extractAndChunk) — pdf-parse v2 integration, buffer passthrough, empty-text edge case
type: project
---

# AI Contract: __tests__/PdfExtract.test.ts

## Purpose
Unit tests for `lib/pdf.ts` (`extractAndChunk`). Verifies that the pdf-parse v2 `PDFParse` class is called correctly, that extracted text is passed through `chunkText`, and that an empty-text result returns an empty array.

## Allowed Responsibilities
- Mock `pdf-parse` to control the `PDFParse` constructor and `getText` outcomes.
- Call `extractAndChunk` with a synthetic `Buffer` and assert on output arrays and mock call arguments.

## Not Allowed
- Do not test `chunkText` directly — that is covered by `PdfChunking.test.ts`.
- Do not read real PDF files from disk.

## Public Interfaces
- No exports — test file only.

## Required Patterns
- `@jest-environment node` directive required (uses `Buffer`).
- Mock shape must match pdf-parse v2 API: `{ PDFParse: jest.fn().mockImplementation(() => ({ getText: mockGetText })) }`.

## Tests Required
- Returns chunked text from a valid PDF buffer.
- Returns empty array when PDF has no extractable text.
- Passes the buffer as `data` to the `PDFParse` constructor.
