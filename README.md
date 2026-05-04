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
| `OPENAI_API_KEY` | OpenAI API key — used for AI-powered features |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID — used for SMS delivery |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token — used for SMS delivery |

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

### Schema overview

```
tenants                   — one row per warranty company
tenant_users              — join table: links Supabase Auth users to a tenant with a role
monthly_billing_snapshots — one row per tenant per month
users                     — homeowners enrolled with a tenant
conversations             — SMS conversation threads per homeowner
reminders                 — scheduled maintenance reminders per homeowner
warranty_documents        — uploaded warranty PDFs per tenant
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
  api/
    reminders/              # GET/POST — maintenance reminders collection
      [id]/                 # PATCH/DELETE — individual reminder by ID
    send-message/           # POST — send an SMS message via Twilio
    warranty-docs/
      [planName]/           # GET — list warranty documents for a specific plan
    warranty-upload/        # POST — upload a warranty PDF
  sms-consent-proof/        # /sms-consent-proof — A2P 10DLC consent flow documentation
  terms/                    # /terms — Terms of Use
  privacy-policy/           # /privacy-policy — Privacy Policy
components/                 # Marketing landing page sections (Hero, Features, Pricing, etc.)
lib/
  supabase/                 # Supabase browser and server client helpers
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
- https://twilio.com — SMS delivery
- https://jestjs.io + https://testing-library.com
