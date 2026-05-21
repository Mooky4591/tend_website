# AI Contract: lib/services/alerts.ts

## Purpose
Critical failure alerting service. Inserts a row into `system_alerts` and sends an email to
the admin via SendGrid whenever a monitored failure condition is detected.

## Allowed Responsibilities
- Export `sendAdminAlert(supabase, alertType, userId, description)`.
- Insert a `system_alerts` row with `alert_type`, `user_id`, `description`, `resolved: false`.
- Send an email to `ADMIN_EMAIL` via SendGrid with subject `[Tendr Alert] {alertType}`.
- Include the alert type, timestamp, optional user ID, and description in the email body.
- Fail gracefully (log errors without throwing) if either the DB insert or email send fails.

## Not Allowed
- Do not throw errors for DB insert or email failures — use best-effort (log and continue).
- Do not call `createClient()` — accept the Supabase client as a parameter.
- Do not construct `NextResponse` objects.
- Do not expose the SendGrid API key or admin email in responses.
- Do not add business logic beyond the insert + email pattern.

## Public Interfaces
- `export async function sendAdminAlert(supabase, alertType: string, userId: string | null, description: string): Promise<void>`

## Required Patterns
- DB insert must come before email; both are wrapped in separate try/catch.
- If `ADMIN_EMAIL` or `SENDGRID_API_KEY` is missing, log a warning and return early (don't throw).
- Email subject: `[Tendr Alert] {alertType}`.
- Email body lines: `Alert Type`, `Timestamp`, optional `User ID`, blank line, `Description`.
- `from` and `to` both use `ADMIN_EMAIL` (SendGrid requires a verified sender).

## Tests Required
- Inserts a `system_alerts` row with the correct fields.
- Sends an email via `sgMail.send` when both env vars are set.
- Does NOT send email when `ADMIN_EMAIL` is missing (logs warning instead).
- Does NOT throw when `sgMail.send` rejects (logs error instead).
- Does NOT throw when the Supabase insert fails (logs error instead).
- Email subject contains the alertType.
- Email body contains the userId when provided.
- Email body does NOT contain a userId line when userId is null.

## Notes for AI Agents
- Called from: `lib/services/qualityMonitor.ts`, `lib/services/messaging.ts`,
  and `app/api/admin/` action routes.
- The Supabase client should be service-role so the INSERT bypasses RLS.
- Alert types used in this codebase: `"api_failure"`, `"delivery_failure"`,
  `"onboarding_stuck"`, `"no_ai_response"`, `"reminder_failure"`.
