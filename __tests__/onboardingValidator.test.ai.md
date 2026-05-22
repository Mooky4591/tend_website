# AI Contract: __tests__/onboardingValidator.test.ts

## Purpose
Unit tests for `lib/services/onboardingValidator.ts`. Validates gap detection logic,
washer/dryer conditional, unknown-phrase handling, and database write patterns.

## Coverage Requirements
- All branches in `validateOnboardingCompleteness` must be covered.
- The `washer_dryer_age_years` conditional must be tested for `has_washer_dryer = false`, `null`, and `true`.
- The unknown-phrase detection must be tested case-insensitively.
- The field-scoped unknown-phrase fix must be tested: a "don't know" message about one field
  must NOT suppress gaps for unrelated null fields.
- User messages must include the field label (underscores → spaces) to trigger suppression.
