# AI Contract: lib/services/onboardingValidator.ts

## Purpose
Business-logic service that checks the completeness of a homeowner's `home_details` record
immediately after `onboarding_complete` is set to `true`. Identifies fields that are null without
a documented "I don't know" response, persists the gap list to `users.onboarding_gaps`, and logs
a human-readable summary.

## Allowed Responsibilities
- Define and export the canonical list of required home detail fields (`REQUIRED_HOME_DETAIL_FIELDS`).
- Accept a Supabase client (dependency injection) and a `userId`.
- Fetch the user's `home_details` record and their conversation history (`role: 'user'` messages).
- Fetch **all** conversation messages (both `role='user'` and `role='assistant'`) in chronological order.
- Classify a null field as a gap only when no scoped unknown response covers it. A "scoped unknown
  response" is a user message containing an unknown phrase where the field label (`field.replace(/_/g,' ')`)
  appears in either (a) the user's own message or (b) the immediately preceding assistant message.
  An unscoped unknown phrase (no field label found in either message) does **not** suppress any field.
- Skip `washer_dryer_age_years` unless `home_details.has_washer_dryer` is strictly `true` (null and false both skip it).
- Write `onboarding_gaps` (array or null) and `onboarding_gap_flagged` (boolean) back to the `users` table.
- Log a console summary with the user's name and the gap list (or confirmation of no gaps).
- Return `{ gaps: string[], flagged: boolean }`.

## Not Allowed
- Do not call `createClient()` here — accept the Supabase client as a parameter.
- Do not send SMS messages, emails, or call any external API.
- Do not construct `NextResponse` objects.
- Do not hardcode field names outside the exported `REQUIRED_HOME_DETAIL_FIELDS` constant.
- Do not mark `washer_dryer_age_years` as a gap unless `has_washer_dryer === true`.

## Public Interfaces
- `export const REQUIRED_HOME_DETAIL_FIELDS: readonly HomeDetailField[]`
- `export type HomeDetailField`
- `export interface OnboardingValidatorResult { gaps: string[]; flagged: boolean }`
- `export async function validateOnboardingCompleteness(supabase, userId: string): Promise<OnboardingValidatorResult>`

## Required Patterns
- The unknown-phrase detection is case-insensitive substring matching; no NLP required.
- Always write back to `users` even when there are no gaps (sets `onboarding_gaps: null, onboarding_gap_flagged: false`).
- Log format: `[OnboardingValidator] User "Name" (id) — N gap(s) found: field1, field2` or `no gaps`.

## Tests Required
- Returns empty gaps when all fields are populated.
- Returns the correct gap list when fields are null and user never said "I don't know".
- Does NOT include `washer_dryer_age_years` as a gap when `has_washer_dryer` is false.
- DOES include `washer_dryer_age_years` as a gap when `has_washer_dryer` is true and age is null.
- Skips a null field when the user says "I don't know" and that field's label appears in either the user's own message or the immediately preceding assistant message.
- Skips a null field when the user mentions the field label directly in their "I don't know" message.
- Does NOT suppress a null field when an "I don't know" response has no field label context in either message (unscoped).
- Does NOT suppress an unrelated null field when "I don't know" is scoped to a different field.
- Persists `onboarding_gaps` and `onboarding_gap_flagged: true` when gaps are found.
- Persists `null` and `false` when no gaps are found.
- Logs the user's name and gap fields.

## Notes for AI Agents
- Consumed by `app/api/users/[id]/onboarding-check/route.ts`.
- The Supabase client passed in should be a service-role client so that RLS does not block
  the `UPDATE` on the `users` table from a non-owning context.
- The "unknown phrase" list (`UNKNOWN_PHRASES`) is intentionally kept conservative. Changes
  to phrase detection logic must not be made without updating the test suite.
