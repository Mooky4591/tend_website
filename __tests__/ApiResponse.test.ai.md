---
name: ApiResponse.test
description: Unit tests for lib/api-response.ts — all HTTP response factory helpers
type: project
---

# AI Contract: __tests__/ApiResponse.test.ts

## Purpose
Unit tests for `lib/api-response.ts`. Verifies that every helper returns the correct HTTP status code and that error helpers serialize to `{ error: string }` while success helpers serialize the data argument directly.

## Allowed Responsibilities
- Import and test all 11 helpers from `@/lib/api-response`.
- Await `.json()` on each response to assert the body.

## Not Allowed
- Do not mock `NextResponse` — test the real implementation.
- Do not import Supabase or application business logic.

## Public Interfaces
- No exports — test file only.

## Required Patterns
- `@jest-environment node` directive required (uses `NextResponse` from `next/server`).

## Tests Required
- Each of the 11 helpers returns the correct status code (401, 403, 400, 404, 500, 502, 415, 413, 422, 200, 201).
- All error helpers serialize `{ error: message }`.
- `forbidden` and `notFound` use their default messages when none is provided.
- `ok` and `created` serialize the data argument without wrapping.

## Notes for AI Agents
- If a new helper is added to `lib/api-response.ts`, add a corresponding status-code test and body test here.
