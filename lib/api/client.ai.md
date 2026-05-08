# AI Contract: lib/api/client.ts

## Purpose
Typed browser-side fetch wrappers for all internal API endpoints. Centralizes hardcoded URL strings and request shapes so client components make API calls through a single module rather than scattering `fetch('/api/...')` calls inline.

## Allowed Responsibilities
- Export one function per API operation: `sendMessage`, `createReminder`, `updateReminder`, `deleteReminder`, `uploadWarrantyDoc`, `submitSmsEnrollment`, `updateHomeownerPhone`.
- Each function constructs the correct `fetch` call (URL, method, headers, body) and returns the raw `Response`.
- For multipart uploads (`uploadWarrantyDoc`), build the `FormData` internally.

## Not Allowed
- Do not throw on non-2xx responses — return the raw `Response` and let the caller check `res.ok`.
- Do not import Supabase, server modules, or `next/server` here — this file runs in the browser.
- Do not add retry logic, caching, or request deduplication.
- Do not transform or parse response bodies — callers call `res.json()` themselves.

## Public Interfaces
- `export async function sendMessage(userId: string, message: string): Promise<Response>`
- `export async function createReminder(userId: string, reminderType: string, dueDate: string): Promise<Response>`
- `export async function updateReminder(id: string, values: { reminderType: string; dueDate: string }): Promise<Response>`
- `export async function deleteReminder(id: string): Promise<Response>`
- `export async function uploadWarrantyDoc(planName: string, file: File): Promise<Response>`
- `export async function submitSmsEnrollment(body: object): Promise<Response>`

## Required Patterns
- JSON endpoints must set `Content-Type: application/json` and stringify the body.
- `uploadWarrantyDoc` must set `plan_name` and `file` keys on `FormData` (no explicit Content-Type header — browser sets it with boundary).
- URL paths must match the actual Next.js route file locations exactly.

## Tests Required
- Each function calls `fetch` with the correct URL and method.
- JSON body is serialized correctly (verified by inspecting `mock.calls[0][1].body`).
- `uploadWarrantyDoc` passes a `FormData` with `plan_name` and `file` entries.
- Non-2xx responses are returned to the caller without throwing.

## Notes for AI Agents
- Consumed by: `app/dashboard/users/[id]/MessageForm.tsx`, `app/dashboard/users/[id]/RemindersPanel.tsx`, `app/dashboard/docs/UploadForm.tsx`, `app/sms-enrollment/SmsEnrollmentForm.tsx`.
- Tests for those components mock `global.fetch` directly; since this module calls `fetch` internally, the mocks intercept correctly without any changes to test setup.
- If an API endpoint URL changes, update only this file.

- `export async function updateHomeownerPhone(userId: string, phoneNumber: string): Promise<Response>`
