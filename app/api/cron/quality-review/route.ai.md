# AI Contract: app/api/cron/quality-review/route.ts

## Purpose
HTTP endpoint that triggers the nightly AI quality review. Called by Railway's built-in
HTTP scheduler (or any cron service) at 02:00 UTC daily. Protected by a shared `CRON_SECRET`
header; not tied to Supabase auth.

## Allowed Responsibilities
- Validate the `x-cron-secret` header against `CRON_SECRET` env var.
- Construct the service-role Supabase client.
- Call `runNightlyQualityReview` from `lib/services/qualityMonitor.ts`.
- Return `{ ok: true, reviewed: N, flagged: M }` on success.
- Return 500 with an error message on unexpected failure.

## Not Allowed
- Do not accept GET requests; only POST.
- Do not use Supabase auth for this endpoint.
- Do not implement any review logic — delegate entirely to `runNightlyQualityReview`.
- Do not render JSX or HTML.

## Public Interfaces
- `export async function POST(request: NextRequest): Promise<NextResponse>`

## Required Patterns
- Return 401 JSON when `x-cron-secret` header is absent or does not match `CRON_SECRET`.
- Wrap the review call in try/catch; return 500 with the error message on failure.
- Log fatal errors to the console before returning 500.

## Tests Required
- POST returns 401 when `x-cron-secret` header is missing.
- POST returns 401 when `x-cron-secret` header is wrong.
- POST returns `{ ok: true, reviewed, flagged }` when authorized and review succeeds.
- POST returns 500 when `runNightlyQualityReview` throws.

## Notes for AI Agents
- Railway scheduler configuration: `0 2 * * *` (daily at 2am UTC), POST to this URL,
  header `x-cron-secret: <value>`.
- The service-role client is created here (not in the service) because the route owns the
  client lifecycle for this HTTP request.
- `CRON_SECRET` should be a long random string stored in Railway environment variables.
