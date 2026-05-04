# AI Contract: lib/validators.ts

## Purpose
Shared input-validation helpers used by both server-side Route Handlers and client-side form components. Centralizes phone normalization and email format checking so that the two layers cannot diverge.

## Allowed Responsibilities
- Export `normalizePhone(raw)` which strips non-digit characters, validates length (10–15 digits), and returns an E.164-normalized string or an error message.
- Export `isValidPhone(phone)` for lightweight client-side length checking (returns `boolean`).
- Export `isValidEmail(email)` for RFC-style format checking (returns `boolean`).

## Not Allowed
- Do not perform live lookups (carrier lookup, MX record check, etc.).
- Do not import Supabase, Next.js, or Twilio here.
- Do not throw errors; return discriminated unions or booleans so callers control error handling.
- Do not normalize email addresses (lowercase, trim) here — callers are responsible.

## Public Interfaces
- `export type PhoneValidation = { value: string } | { error: string }`
- `export function normalizePhone(raw: string): PhoneValidation`
- `export function isValidPhone(phone: string): boolean`
- `export function isValidEmail(email: string): boolean`

## Required Patterns
- `normalizePhone`: strips `/\D/g`, rejects if fewer than 10 or more than 15 digits, prepends `+1` for 10-digit US numbers and `+` for all others.
- `isValidPhone`: same digit-stripping, returns `true` only if 10+ digits remain.
- `isValidEmail`: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` — intentionally permissive for UX.

## Tests Required
- `normalizePhone` returns `{ value: '+15551234567' }` for a 10-digit US number.
- `normalizePhone` returns `{ error: '...' }` for fewer than 10 digits.
- `normalizePhone` handles formatting characters like `(555) 123-4567`.
- `isValidEmail` returns `false` for `not-an-email` and `true` for `jane@example.com`.

## Notes for AI Agents
- `normalizePhone` is used in `app/api/sms-enrollment/route.ts` to produce the stored E.164 value.
- `isValidPhone` / `isValidEmail` are used in `app/sms-enrollment/SmsEnrollmentForm.tsx` for client-side field validation; error messages in the form are user-facing and may differ from the API error strings.
- If phone normalization rules change (e.g., international prefix logic), update only this file — both form and API pick up the change automatically.
