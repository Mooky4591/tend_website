---
name: messagingService.test
description: Unit tests for lib/services/messaging.ts — sendMessageToHomeowner success and all failure paths
type: project
---

# AI Contract: __tests__/messagingService.test.ts

## Purpose
Unit tests for `lib/services/messaging.ts`. Verifies the full orchestration: homeowner lookup, tenant Twilio number resolution, SMS delivery, and conversation insert — including every error path and the constraint that the conversation row is not inserted when SMS fails.

## Allowed Responsibilities
- Provide a plain mock Supabase object as the dependency (no module-level mock of `@/lib/supabase/server`).
- Mock `@/lib/twilio` to control `sendSms` outcomes.
- Assert on the return value (`null` on success, `{ error, status }` on failure).

## Not Allowed
- Do not mock `@/lib/services/messaging` itself — test the real implementation.
- Do not test HTTP-layer concerns (route status codes, NextResponse); those belong in `SendMessage.test.ts`.

## Public Interfaces
- No exports — test file only.

## Required Patterns
- `@jest-environment node` directive required.

## Tests Required
- Returns `null` on full success.
- Returns `{ status: 404, error: 'User not found' }` when homeowner is not found.
- Returns `{ status: 500 }` when tenant has no Twilio number.
- Returns `{ status: 502, error: 'SMS delivery failed' }` when Twilio throws.
- Calls `sendAdminAlert` with type `"delivery_failure"` when Twilio throws.
- Does not call `conversations.insert` when Twilio fails.
- Returns `{ status: 500 }` with error containing "Message sent but could not be saved" when insert fails after SMS success.

## Notes for AI Agents
- If `sendMessageToHomeowner` adds new failure paths, add matching tests here.
- `@/lib/services/alerts` must be mocked to prevent real email sends during tests.
