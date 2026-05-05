---
name: PdfChunking.test
description: Tests for lib/pdf.ts — chunkText boundaries/overlap/whitespace and extractAndChunk pdf-parse v2 integration
type: project
---

# AI Contract: __tests__/PdfChunking.test.ts

## Purpose
Unit tests for all exports of `lib/pdf.ts`: `chunkText` and `extractAndChunk`. Verifies chunking boundaries, overlap, whitespace normalization, empty-input edge cases, pdf-parse v2 constructor usage, and empty-text handling.

## Allowed Responsibilities
- Call `chunkText` with synthetic text inputs and assert on output arrays.
- Mock `pdf-parse` to control `PDFParse` constructor and `getText` outcomes; call `extractAndChunk` with a synthetic `Buffer` and assert on output arrays and mock call arguments.

## Not Allowed
- Do not mock `chunkText` — test the real implementation.
- Do not read real PDF files from disk.

## Public Interfaces
- No exports — test file only.

## Required Patterns
- `@jest-environment node` directive required (uses `Buffer`).
- Mock shape must match pdf-parse v2 API: `{ PDFParse: jest.fn().mockImplementation(() => ({ getText: mockGetText, destroy: mockDestroy })) }`.

## Tests Required
- `chunkText`: returns empty array for empty string.
- `chunkText`: returns empty array for whitespace-only string.
- `chunkText`: returns a single chunk when text is under 500 words.
- `chunkText`: first chunk contains exactly 500 words.
- `chunkText`: second chunk starts at word 450 (500 − 50 overlap).
- `chunkText`: last 50 words of chunk N equal first 50 words of chunk N+1.
- `chunkText`: normalises multiple whitespace between words.
- `extractAndChunk`: returns chunked text from a valid PDF buffer.
- `extractAndChunk`: returns empty array when PDF has no extractable text.
- `extractAndChunk`: passes the buffer as `data` to the `PDFParse` constructor.
- `extractAndChunk`: calls `destroy()` after a successful extraction.
- `extractAndChunk`: calls `destroy()` even when `getText()` throws.
