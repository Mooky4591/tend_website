---
name: validators.test
description: Unit tests for lib/validators.ts — normalizePhone, isValidPhone, isValidEmail
type: project
---

# AI Contract: __tests__/validators.test.ts

## Purpose
Unit tests for `lib/validators.ts`. Verifies phone normalization (E.164 output, error on bad input, formatting-character stripping), lightweight phone length checking, and email format validation.

## Allowed Responsibilities
- Import and test `normalizePhone`, `isValidPhone`, and `isValidEmail` from `@/lib/validators`.
- Assert on return values only (discriminated unions / booleans).

## Not Allowed
- Do not mock the validators module — test the real implementation.
- Do not make network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- `normalizePhone` returns `{ value: '+15551234567' }` for a 10-digit US number.
- `normalizePhone` handles formatting characters like `(555) 123-4567`.
- `normalizePhone` returns `{ error }` for fewer than 10 digits.
- `normalizePhone` returns `{ error }` for more than 15 digits.
- `normalizePhone` prepends `+` (not `+1`) for numbers longer than 10 digits.
- `isValidPhone` returns `true` for 10+ digits and `false` for fewer.
- `isValidEmail` returns `true` for valid email, `false` for missing `@` or TLD.

## Notes for AI Agents
- If `lib/validators.ts` changes its normalization rules, update these tests to match.
