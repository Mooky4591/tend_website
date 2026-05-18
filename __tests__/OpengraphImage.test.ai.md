# AI Contract: __tests__/OpengraphImage.test.tsx

## Purpose
Verifies the constants exported by `app/opengraph-image.tsx` (runtime, alt, size, contentType) and that the default `OGImage()` function constructs an `ImageResponse` with the declared dimensions and renders the expected brand copy.

## Allowed Responsibilities
- Mock `next/og`'s `ImageResponse` to capture the arguments passed to it.
- Assert on the captured arguments (element tree text content, size).
- Assert that `runtime`, `alt`, `size`, and `contentType` match the contract in `app/opengraph-image.ai.md`.

## Not Allowed
- Do not attempt to actually render the PNG — the test environment cannot rasterize an `ImageResponse`.
- Do not assert against external fonts or images.

## Public Interfaces
None — this is a test file.

## Required Patterns
- Runs under the `node` jest environment because `ImageResponse` and `next/og` use Web Streams APIs unavailable in jsdom.
- Captures `ImageResponse` constructor args into a module-level variable for inspection.

## Tests Required
- `runtime === 'edge'`.
- `alt` is a non-empty string.
- `size === { width: 1200, height: 630 }`.
- `contentType === 'image/png'`.
- `OGImage()` does not throw.
- The produced element tree contains the brand name, headline, and feature badge.
