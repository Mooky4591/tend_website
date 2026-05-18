# AI Contract: __tests__/twilio.test.ts

## Purpose
Verifies that `lib/twilio.ts` exposes `sendSms(from, to, body)` which calls Twilio's `messages.create` with the correct arguments, propagates rejections, and lazily initializes a singleton client.

## Allowed Responsibilities
- Mock the `twilio` package's default export and capture the `messages.create` call.
- Assert that the singleton initializer is called once across multiple `sendSms` invocations.
- Assert that rejections from `messages.create` are not swallowed.

## Not Allowed
- Do not make real network calls to Twilio.
- Do not assert on the shape of the return value (the public contract is `Promise<void>`).

## Public Interfaces
None — this is a test file.

## Required Patterns
- Runs under the `node` jest environment.
- Uses `jest.resetModules()` + dynamic `import()` to re-evaluate the module under different env vars, but the singleton must persist within a single module instance.

## Tests Required
- `messages.create` is called with `{ from, to, body }`.
- `sendSms` rejects when `messages.create` rejects.
- Twilio factory is invoked exactly once across multiple `sendSms` calls.
- `sendSms` resolves with `undefined`.
