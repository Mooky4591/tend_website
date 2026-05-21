# AI Contract: lib/services/qualityMonitor.ts

## Purpose
Nightly quality review service that uses the Claude API to scan the last 24 hours of conversations
for issues. Groups messages by user, assembles a thread, pulls the user's `home_details`, sends
both to Claude, and writes AI quality flags back to the most recent conversation row if issues
are detected.

## Allowed Responsibilities
- Export `runNightlyQualityReview(supabase)` — the main nightly job function.
- Export `reviewUserConversation(client, homeDetailsJson, conversationThread)` — the single-user
  Claude review function (exported so it can be unit-tested in isolation).
- Fetch conversations created in the last 24 hours from the `conversations` table.
- Group conversations by `user_id`.
- Fetch the associated `home_details` record for each user.
- Send a structured prompt to Claude (claude-opus-4-7) requesting a JSON quality report.
- Parse the Claude response as `{ flagged: boolean, issues: QualityIssue[] }`.
- Update `conversations.ai_quality_flag` and `conversations.ai_quality_reason` when flagged.
- Call `sendAdminAlert` when a Claude API call fails.
- Log a summary line after the review completes.

## Not Allowed
- Do not accept or validate HTTP requests — this is a pure service function.
- Do not construct `NextResponse` objects.
- Do not call `createClient()` — accept the Supabase client as a parameter.
- Do not use a model other than `claude-opus-4-7` for the quality review.
- Do not update more than the most recent conversation row per user.
- Do not invent issues; the prompt explicitly instructs Claude to only report actual issues.

## Public Interfaces
- `export interface QualityIssue { type: string; description: string }`
- `export interface QualityReviewResult { flagged: boolean; issues: QualityIssue[] }`
- `export interface NightlyReviewSummary { reviewed: number; flagged: number }`
- `export async function reviewUserConversation(client: Anthropic, homeDetailsJson: string, conversationThread: string): Promise<QualityReviewResult>`
- `export async function runNightlyQualityReview(supabase): Promise<NightlyReviewSummary>`

## Required Patterns
- `since` threshold: `Date.now() - 24 * 60 * 60 * 1000` (exactly 24 hours back).
- Conversation fetch uses `.range(from, from + PAGE_SIZE - 1)` with `PAGE_SIZE = 1000` and
  loops until a page returns fewer than `PAGE_SIZE` rows. This avoids Supabase's default
  1,000-row cap silently truncating high-volume periods.
- Conversation thread format: `[timestamp] Role: content` per line, ordered ascending by `created_at`.
  Role mapping: `role='user'` → `Homeowner`; `role='assistant'` → `Assistant`; any other role
  (e.g. `role='staff'`) → `Staff`. Staff messages must not be labelled `Assistant`.
- Claude response parsing: strip markdown code fences before `JSON.parse`.
- Reason string for `ai_quality_reason`: issues joined as `[type] description; [type] description`.
- On Claude API error: call `sendAdminAlert` with type `"api_failure"` then `continue` to next user.
- Log format: `[QualityMonitor] Nightly review complete — reviewed: N, flagged: M`.

## Tests Required
- `reviewUserConversation` returns `{ flagged: false, issues: [] }` when Claude responds with no issues.
- `reviewUserConversation` returns `{ flagged: true, issues: [...] }` when Claude flags issues.
- `reviewUserConversation` strips markdown code fences before parsing JSON.
- `reviewUserConversation` throws when Claude returns invalid JSON.
- `runNightlyQualityReview` returns `{ reviewed: 0, flagged: 0 }` when no conversations exist.
- `runNightlyQualityReview` updates `ai_quality_flag` and `ai_quality_reason` on the most recent conversation when flagged.
- `runNightlyQualityReview` calls `sendAdminAlert` on Claude API errors.
- `runNightlyQualityReview` calls `sendAdminAlert` when the conversations fetch fails.
- `runNightlyQualityReview` labels `staff`-role messages as `Staff` (not `Assistant`) in the thread.
- `runNightlyQualityReview` fetches a second page when the first returns exactly `PAGE_SIZE` rows.

## Notes for AI Agents
- Consumed by `app/api/cron/quality-review/route.ts`.
- The Supabase client must be the service-role client to read all tenants' conversations.
- `ANTHROPIC_API_KEY` must be set in the environment; the Anthropic client is constructed inside
  `runNightlyQualityReview` so it can be mocked in tests.
