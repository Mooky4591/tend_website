---
name: constants.test
description: Unit tests for lib/constants.ts — REMINDER_TYPES array membership and shape
type: project
---

# AI Contract: __tests__/constants.test.ts

## Purpose
Unit tests for `lib/constants.ts`. Verifies that `REMINDER_TYPES` is non-empty and contains the expected sentinel values.

## Allowed Responsibilities
- Import and test `REMINDER_TYPES` from `@/lib/constants`.

## Not Allowed
- Do not test TypeScript types at runtime — type narrowing is enforced by `tsc --noEmit`.
- Do not mock the constants module.

## Public Interfaces
- No exports — test file only.

## Tests Required
- `REMINDER_TYPES` is a non-empty array.
- `REMINDER_TYPES` contains `'hvac_filter'`.
- `REMINDER_TYPES` contains `'other'`.

## Notes for AI Agents
- If a value is added to or removed from `REMINDER_TYPES`, update these tests to reflect the new expected membership.
