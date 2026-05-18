---
name: ApiClient.test
description: Unit tests for lib/api/client.ts — fetch URL, method, body, and FormData for all 8 functions
type: project
---

# AI Contract: __tests__/ApiClient.test.ts

## Purpose
Unit tests for `lib/api/client.ts`. Verifies that each exported function calls `fetch` with the correct URL, HTTP method, headers, and serialized body, and that non-2xx responses are returned to the caller without throwing.

## Allowed Responsibilities
- Mock `global.fetch` to intercept calls.
- Assert on the arguments passed to `fetch` (URL, method, headers, body).
- Assert that the raw `Response` is returned regardless of status code.

## Not Allowed
- Do not make real network requests.
- Do not import server-only modules or `next/server`.

## Public Interfaces
- No exports — test file only.

## Tests Required
- `sendMessage` POSTs to `/api/send-message` with `Content-Type: application/json` and correct JSON body.
- `createReminder` POSTs to `/api/reminders` with correct JSON body.
- `updateReminder` PATCHes `/api/reminders/:id` with correct JSON body.
- `deleteReminder` DELETEs `/api/reminders/:id`.
- `uploadWarrantyDoc` POSTs to `/api/warranty-upload` with `FormData` containing `plan_name` and `file`.
- `uploadWarrantyDoc` does not set an explicit `Content-Type` header.
- `submitSmsEnrollment` POSTs to `/api/sms-enrollment` with correct JSON body.
- `updateHomeownerPhone` PATCHes `/api/users/:id/phone` with `{ phoneNumber }` JSON body.
- `updateHomeownerPhone` returns the raw Response without throwing on non-2xx.
- `setRemindersPaused` PATCHes `/api/users/:id/reminders-pause` with `{ paused: true }` JSON body when paused.
- `setRemindersPaused` PATCHes the same endpoint with `{ paused: false }` JSON body when unpausing.
- `setRemindersPaused` returns the raw Response without throwing on non-2xx.
- Non-2xx responses are returned to the caller without throwing.

## Notes for AI Agents
- If an API endpoint URL changes in a Route Handler, update `lib/api/client.ts` and update the URL assertions here.
