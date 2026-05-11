# AI Contract: __tests__/PhoneNumberEditor.test.tsx

## Purpose
Unit tests for `PhoneNumberEditor` covering inline phone display and successful save flow.

## Allowed Responsibilities
- Mock router refresh behavior.
- Mock `updateHomeownerPhone` API wrapper.
- Verify edit + save invokes API and refresh.

## Not Allowed
- Do not test Supabase here.

## Required Patterns
- Use Testing Library user interactions.

## Tests Required
- Renders current phone number and Edit button.
- Cancel reverts the input to the initial phone value.
- Shows the API error message on failure.
- Saves and calls router refresh on success.
