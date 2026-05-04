# AI Contract: lib/twilio.ts

## Purpose
Minimal Twilio SMS utility module. Provides a lazily-initialized singleton Twilio client and a single exported function `sendSms` that sends an SMS from a given number to a given number.

## Allowed Responsibilities
- Lazily initialize a singleton Twilio client from `process.env.TWILIO_ACCOUNT_SID` and `process.env.TWILIO_AUTH_TOKEN`.
- Export `sendSms(from, to, body)` that calls `client.messages.create`.
- Let the caller handle errors by not catching `messages.create` rejections.

## Not Allowed
- Do not call this from client components; Twilio credentials are server-only secrets.
- Do not add retry logic, queuing, or delivery status polling here.
- Do not hardcode phone numbers or credentials.
- Do not log message contents.

## Public Interfaces
- `export async function sendSms(from: string, to: string, body: string): Promise<void>`

## Required Patterns
- Singleton pattern: `let _client: ReturnType<typeof twilio> | null = null` with lazy init in `getClient()`.
- `from` is the tenant's Twilio number (resolved by the caller); `to` is the homeowner's phone number.
- Function returns `Promise<void>`; the `MessageInstance` return value from Twilio is discarded.

## Tests Required
- `sendSms` calls `client.messages.create` with the correct `{ from, to, body }` arguments.
- `sendSms` rejects when `messages.create` rejects (no swallowing).
- The singleton client is initialized only once across multiple calls.

## Notes for AI Agents
- `from` must be a Twilio-provisioned phone number. It is resolved from the `tenants` table by `app/api/send-message/route.ts`. Do not hardcode it here.
- `to` must be in E.164 format. Phone normalization for enrolled users happens in `app/api/sms-enrollment/route.ts`.
- Inbound SMS handling (STOP/START/HELP) is managed by Twilio webhooks, not by this module.
