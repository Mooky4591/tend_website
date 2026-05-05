# AI Contract: lib/constants.ts

## Purpose
Single source of truth for application-wide enumerated constants. Currently holds the canonical list of reminder types used by both UI components and data storage.

## Allowed Responsibilities
- Export `REMINDER_TYPES` as a `readonly` tuple (using `as const`) so TypeScript can narrow its element type.
- Export the `ReminderType` union type derived from that tuple.

## Not Allowed
- Do not import external dependencies here.
- Do not add environment-specific values (use env vars for those).
- Do not add UI-only constants (CSS class names, pixel values, etc.) — keep this file limited to business-domain enumerated values.

## Public Interfaces
- `export const REMINDER_TYPES: readonly string[]`
- `export type ReminderType = typeof REMINDER_TYPES[number]`

## Required Patterns
- `as const` assertion is required so `ReminderType` is a proper string literal union, not `string`.
- The array order determines option order in UI dropdowns; keep it stable.

## Tests Required
- Importing `REMINDER_TYPES` yields a non-empty array containing `'hvac_filter'` and `'other'`.
- `ReminderType` is narrower than `string` (verified at the TypeScript level, not at runtime).

## Notes for AI Agents
- `app/dashboard/users/[id]/RemindersPanel.tsx` consumes this to render reminder type selects.
- Adding a new reminder type here is the only code change required to make it available throughout the app (assuming the database `reminder_type` column accepts any string value).
- The values stored in the `reminders` table are the raw strings from this array.
