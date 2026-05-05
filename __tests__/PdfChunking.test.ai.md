# AI Contract: __tests__/PdfChunking.test.ts

## Purpose
Unit tests for `lib/pdf.ts` (`chunkText`). Verifies chunking boundaries, overlap, whitespace normalization, and empty-input edge cases.

## Allowed Responsibilities
- Call `chunkText` with synthetic text inputs and assert on output arrays.

## Not Allowed
- Do not mock `chunkText` — test the real implementation.
- Do not parse real PDF files; `chunkText` operates on plain strings.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Returns empty array for empty string.
- Returns empty array for whitespace-only string.
- Returns a single chunk when text is under 500 words.
- First chunk contains exactly 500 words.
- Second chunk starts at word 450 (500 − 50 overlap).
- Last 50 words of chunk N equal first 50 words of chunk N+1.
- Normalises multiple whitespace between words.
