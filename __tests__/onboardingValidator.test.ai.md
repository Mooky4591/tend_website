# AI Contract: __tests__/onboardingValidator.test.ts

## Purpose
Unit tests for `lib/services/onboardingValidator.ts`. Validates gap detection logic,
washer/dryer conditional, unknown-phrase handling, and database write patterns.

## Coverage Requirements
- All branches in `validateOnboardingCompleteness` must be covered.
- The `washer_dryer_age_years` conditional must be tested for both truthy and falsy `has_washer_dryer`.
- The unknown-phrase detection must be tested case-insensitively.
