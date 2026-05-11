# AI Contract: __tests__/onboarding-failure.test.ts

## Purpose
Unit tests for `lib/onboarding-failure.ts` — verifies that `mapTwilioCodeToFailureReason` returns the correct `FailureReason` for every mapped Twilio error code and for unknown/undefined inputs.

## Tests Required
- Each explicitly mapped Twilio code (21211, 21217, 21614, 21612, 30006, 30003, 30005, 30001, 30008, 30004, 30007, 20003) returns the expected `FailureReason`.
- An unmapped code returns `'network_error'`.
- `undefined` returns `'network_error'`.
