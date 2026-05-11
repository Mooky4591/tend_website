# AI Contract: lib/onboarding-failure.ts

## Purpose
Defines the `FailureReason` type and maps Twilio error codes to one of those reasons. Centralises all knowledge about what a given Twilio error means so callers can record a structured reason and display the right CTA.

## Allowed Responsibilities
- Export the `FailureReason` union type.
- Export `mapTwilioCodeToFailureReason(code)` that returns a `FailureReason` for any known Twilio error code, defaulting to `'network_error'` for unknown or undefined codes.
- Maintain the static `TWILIO_CODE_MAP` lookup table.

## Not Allowed
- Do not import Supabase, Next.js, Twilio SDK, or any runtime library.
- Do not perform any I/O — this is pure classification logic.
- Do not add UI copy or CTA text here; that belongs in the component layer.

## Public Interfaces
- `export type FailureReason = 'invalid_number' | 'landline' | 'disconnected' | 'delivery_timeout' | 'network_error' | 'carrier_blocked' | 'account_error'`
- `export function mapTwilioCodeToFailureReason(code: number | undefined): FailureReason`

## CTA Categories (for reference)
- **Review profile / update phone number**: `invalid_number`, `landline`, `disconnected`
- **Retry**: `delivery_timeout`, `network_error`
- **Contact support (support@trytendr.org)**: `carrier_blocked`, `account_error`

## Tests Required
- Returns correct `FailureReason` for each mapped Twilio code (21211, 21217, 21614, 21612, 30006, 30003, 30005, 30001, 30008, 30004, 30007, 20003).
- Returns `'network_error'` for an unmapped code.
- Returns `'network_error'` when code is `undefined`.
