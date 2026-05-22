# Tendr — Marketing Website

Marketing landing page and tenant dashboard for [Tendr](https://trytendr.org),
an AI-powered SMS home assistant platform for home warranty companies.

Built with Next.js 14, TypeScript, and Tailwind CSS. Deployed on Railway.


## Getting Started

Install dependencies:

```bash
npm install
```

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key — safe for the browser |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (e.g. `https://trytendr.org`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — bypasses RLS; used in admin/cron routes only |
| `OPENAI_API_KEY` | OpenAI API key — used for AI-powered features |
| `ANTHROPIC_API_KEY` | Anthropic (Claude) API key — used by the nightly AI quality review |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID — used for SMS delivery |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token — used for SMS delivery |
| `ADMIN_PASSWORD` | Password to access the `/admin` dashboard |
| `ADMIN_EMAIL` | Email address that receives critical failure alert notifications |
| `SENDGRID_API_KEY` | SendGrid API key — used to send admin alert emails |
| `CRON_SECRET` | Secret token sent in `x-cron-secret` header by the Railway scheduler for the nightly quality review |

All variables must also be set in Railway under **Service → Variables** before deploying.

---

## Database

### Running migrations

Migrations live in `supabase/migrations/`. Run them in order in the
**Supabase dashboard → SQL Editor**.

| Migration | What it does |
|-----------|-------------|
| `20260428000000_tenant_users.sql` | Creates `tenant_users` join table; enables RLS on `tenants`, `tenant_users`, and `monthly_billing_snapshots` |
| `20260429000001_portal_rls_policies.sql` | Adds RLS policies for `users`, `conversations`, `reminders`, and `warranty_documents` so portal dashboard members can only read their tenant's data |
| `20260518000000_add_reminders_pause.sql` | Adds `users.reminders_paused_at` (admin-toggled pause flag) and `reminders.skipped_at` (worker-set permanent-skip marker) for the reminders pause/unpause feature |
| `20260520000000_monitoring_columns.sql` | Adds AI quality flag columns to `conversations`, onboarding gap columns to `users`, and creates the `system_alerts` table |
| `20260520000001_home_details.sql` | Creates `home_details` table for homeowner property attributes collected during SMS onboarding |

### Schema overview

```
tenants                   — one row per warranty company
tenant_users              — join table: links Supabase Auth users to a tenant with a role
monthly_billing_snapshots — one row per tenant per month
users                     — homeowners enrolled with a tenant
home_details              — property attributes collected during SMS onboarding (one row per user)
conversations             — SMS conversation threads per homeowner
reminders                 — scheduled maintenance reminders per homeowner
warranty_documents        — uploaded warranty PDFs per tenant
system_alerts             — critical failure alerts from the monitoring system
```

---

## Auth

Login is at `/login` (email + password via Supabase Auth).

After signing in, users are redirected to `/dashboard`. The dashboard looks up
the user's `tenant_id` from `tenant_users` and loads that company's data.
RLS ensures a user can only ever read rows belonging to their own tenant.

### Password reset flow

1. User clicks **Forgot password?** on `/login`
2. `/forgot-password` — user enters their email; `supabase.auth.resetPasswordForEmail` sends a reset link (always shows a generic success message — does not reveal whether the email is registered)
3. The email link goes through `/auth/callback?next=/reset-password`, which exchanges the one-time code for a session
4. `/reset-password` — user enters their new password; `supabase.auth.updateUser` saves it and redirects to `/login`

**Supabase redirect URL allow-list** — make sure `https://trytendr.org/auth/callback` is added in Supabase → Authentication → URL Configuration → Redirect URLs.

### Creating the first user

Until an in-app invite flow is built, create users manually:

1. Supabase dashboard → **Auth → Users → Add user**
2. Copy the new user's UUID, then run:

```sql
INSERT INTO tenant_users (tenant_id, auth_user_id, role)
VALUES ('<tenant-uuid>', '<auth-user-uuid>', 'admin');
```

---

## Admin Dashboard

The admin dashboard is a password-protected internal tool at `/admin` for monitoring the SMS home
assistant. It is separate from the tenant portal (`/dashboard`) and uses its own cookie-based auth.

### Accessing the dashboard

1. Set `ADMIN_PASSWORD` in your environment (Railway → Variables or `.env.local`).
2. Navigate to `https://your-domain.com/admin` — you will be redirected to `/admin/login`.
3. Enter the admin password and click **Sign in**.
4. The session is stored in an `admin_session` cookie (8-hour expiry, HttpOnly, Secure in production).

### Pages

| Page | URL | What it shows |
|------|-----|---------------|
| Dashboard | `/admin` | High-level stats: total users, onboarding complete, gaps flagged, conversations today, reminders sent this week, unresolved alerts, AI-quality-flagged conversations |
| Conversations | `/admin/conversations` | All users with conversations in the last 7 days — AI flag status, quality reason, manual flag, link to full thread |
| Thread View | `/admin/conversation/[userId]` | Full chat history with role labels and timestamps, home_details sidebar, AI quality flag detail, and action buttons (Mark Reviewed / Flag / Unflag) |
| Onboarding Gaps | `/admin/onboarding-gaps` | Users whose home_details had missing fields after onboarding completed — shows which fields, with a Resolve button |
| System Alerts | `/admin/alerts` | All unresolved critical failure alerts (API failures, delivery failures, onboarding stuck, etc.) with a Resolve button |
| Users | `/admin/users` | All homeowners across all tenants with onboarding status, gap flag, conversation count, and last active timestamp |

### Nightly quality review

The AI quality review runs nightly at **02:00 UTC** via an HTTP cron job.

**How it works:**
1. All conversations from the last 24 hours are fetched and grouped by user.
2. For each user with recent activity, their conversation thread and `home_details` record are assembled.
3. The assembled context is sent to Claude (`claude-opus-4-7`) with a structured prompt asking it to check for 7 issue types: missed data collection, missed follow-up, hallucinated coverage, unclear responses, missed onboarding data, incorrect advice, and missed upsells.
4. Claude returns a JSON result `{ flagged: boolean, issues: [...] }`.
5. If flagged, `ai_quality_flag = true` and `ai_quality_reason` (semicolon-joined issue summaries) are written to the user's most recent conversation row.

**Scheduling on Railway:**
1. Railway Dashboard → your service → **Cron Jobs** → New Job
2. Schedule: `0 2 * * *`  (daily at 2am UTC)
3. HTTP Method: `POST`
4. URL: `https://your-domain.com/api/cron/quality-review`
5. Header: `x-cron-secret: <value of CRON_SECRET env var>`

### Interpreting AI quality flags

When a conversation is flagged by the nightly review:
- The flag shows on the **Conversations** page as a red "Yes" badge.
- The **Thread View** shows a red panel listing each issue type and its description.
- Issue types and what they mean:
  - `missed_data_collection` — User mentioned something (e.g. a pool) that should have triggered data gathering but didn't.
  - `missed_followup` — User reported a problem (e.g. AC not cooling) but the AI never offered to open a claim.
  - `hallucinated_coverage` — AI stated something was covered without warranty document context to support it.
  - `unclear_response` — AI response was confusing or likely misunderstood.
  - `missed_onboarding_data` — User volunteered property info that should have been saved to `home_details` but wasn't.
  - `incorrect_advice` — AI gave maintenance advice that was technically wrong or potentially harmful.
  - `missed_upsell` — A maintenance reminder was sent but the AI didn't offer to help source the right product.

### Resolving onboarding gaps

When a user's `home_details` record is incomplete after onboarding:
1. Open **Onboarding Gaps** at `/admin/onboarding-gaps`.
2. Review the list of missing fields for each user.
3. If the gaps are acceptable (e.g. user said they don't have that appliance), click **Mark Resolved** to clear the flag.
4. The `onboarding_gaps` array is preserved for auditing; only `onboarding_gap_flagged` is set to `false`.

---

## Running Tests

```bash
npm test

npm run test:coverage
```

---

## Deploying

This project is deployed on [Railway](https://railway.app). Push to `main` and
Railway will build and deploy automatically. Make sure all env vars are set in
the Railway service before the first deploy.

---

## Project Structure

```
app/
  login/                    # /login — email/password login page
  forgot-password/          # /forgot-password — request a password reset email
  reset-password/           # /reset-password — set a new password (requires reset link session)
  dashboard/                # /dashboard — protected tenant dashboard
    billing/                # /dashboard/billing — billing overview
    users/                  # homeowner list and detail pages
    docs/                   # warranty document upload and management
  auth/
    callback/               # Supabase Auth email confirmation + password reset handler
    confirm/                # Supabase Auth OTP/magic-link confirmation handler
  admin/                    # /admin — password-protected internal monitoring dashboard
    login/                  # /admin/login — admin password form
    conversations/          # /admin/conversations — conversation quality review list
    conversation/[userId]/  # /admin/conversation/[userId] — full thread + action buttons
    onboarding-gaps/        # /admin/onboarding-gaps — incomplete home_details review
    alerts/                 # /admin/alerts — unresolved system alert list
    users/                  # /admin/users — all homeowners across all tenants
  api/
    admin/
      auth/                 # POST — admin login/logout (sets/clears session cookie)
      conversations/[userId]/
        review/             # POST — mark latest conversation as reviewed
        flag/               # POST — manually flag or unflag latest conversation
      onboarding-gaps/[userId]/resolve/  # POST — resolve onboarding gap flag
      alerts/[id]/resolve/  # POST — mark system alert as resolved
    cron/
      quality-review/       # POST — nightly AI quality review (requires x-cron-secret header)
    reminders/              # GET/POST — maintenance reminders collection
      [id]/                 # PATCH/DELETE — individual reminder by ID
    send-message/           # POST — send an SMS message via Twilio
    users/
      [id]/
        phone/              # PATCH — update a homeowner's phone number
        reminders-pause/    # PATCH — pause or unpause reminder sending for one homeowner
        onboarding-check/   # POST — run onboarding completeness validator for a user
    warranty-docs/
      [planName]/           # GET — list warranty documents for a specific plan
    warranty-upload/        # POST — upload a warranty PDF
  sms-consent-proof/        # /sms-consent-proof — A2P 10DLC consent flow documentation
  terms/                    # /terms — Terms of Use
  privacy-policy/           # /privacy-policy — Privacy Policy
components/                 # Marketing landing page sections (Hero, Features, Pricing, etc.)
lib/
  admin-auth.ts             # Admin session cookie helpers (HMAC password hashing, cookie check)
  supabase/
    client.ts               # Supabase browser client
    server.ts               # Supabase server client (cookie-based, for portal routes)
    service.ts              # Supabase service-role client (bypasses RLS, for admin/cron only)
  services/
    alerts.ts               # sendAdminAlert — inserts system_alert and sends SendGrid email
    messaging.ts            # sendMessageToHomeowner — outbound SMS + conversation insert
    onboardingValidator.ts  # validateOnboardingCompleteness — gap detection after onboarding
    qualityMonitor.ts       # runNightlyQualityReview — Claude-powered nightly conversation review
    warrantyDocs.ts         # Warranty document retrieval and search
  embed.ts                  # OpenAI embedding helper for warranty document search
  pdf.ts                    # PDF text extraction helper
  twilio.ts                 # Twilio SMS client (lazy singleton)
supabase/migrations/        # SQL migrations (run manually in Supabase SQL editor)
__tests__/                  # Jest + React Testing Library (one file per component/route)
middleware.ts               # Redirects unauthenticated users away from /dashboard
```

---

## Placeholder Items

| Item | Location |
|------|----------|
| Logo (Footer) | `components/Footer.tsx` — still using placeholder icon/text |
| Contact / booking link | `CTA.tsx` |
| Dashboard UI | `app/dashboard/page.tsx` |
| User invite flow | not yet built |

---

## Tech Stack

- https://nextjs.org — App Router
- https://www.typescriptlang.org
- https://tailwindcss.com
- https://supabase.com — Auth + Postgres database
- https://openai.com — embeddings for warranty document search
- https://anthropic.com — Claude API for nightly AI quality review
- https://twilio.com — SMS delivery
- https://sendgrid.com — Admin alert emails
- https://jestjs.io + https://testing-library.com
