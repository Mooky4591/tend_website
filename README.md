⏺ # Tendr — Marketing Website

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

  These must also be set in Railway under **Service → Variables** before deploying.

  ---

  ## Database

  ### Running migrations

  Migrations live in `supabase/migrations/`. Run them in order in the
  **Supabase dashboard → SQL Editor**.

  | Migration | What it does |
  |-----------|-------------|
  | `20260428000000_tenant_users.sql` | Creates `tenant_users` join table; enables RLS on `tenants`, `tenant_users`, and `monthly_billing_snapshots` |

  ### Schema overview

  ```
  tenants          — one row per warranty company
  tenant_users     — join table: links Supabase Auth users to a tenant with a role
  monthly_billing_snapshots — one row per tenant per month
  ```

  ---

  ## Auth

  Login is at `/login` (email + password via Supabase Auth).

  After signing in, users are redirected to `/dashboard`. The dashboard looks up
  the user's `tenant_id` from `tenant_users` and loads that company's data.
  RLS ensures a user can only ever read rows belonging to their own tenant.

  ### Creating the first user

  Until an in-app invite flow is built, create users manually:

  1. Supabase dashboard → **Authentication → Users → Invite user**
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
  Railway will build and deploy automatically. Make sure the two env vars above
  are set in the Railway service before the first deploy.

  ---

  ## Project Structure

  ```
  app/
    login/            # /login — email/password login page
    dashboard/        # /dashboard — protected tenant dashboard
    auth/callback/    # Supabase Auth email confirmation handler
  components/         # Marketing page sections
  lib/supabase/       # Supabase browser and server client helpers
  supabase/migrations/# SQL migrations (run manually in Supabase SQL editor)
  __tests__/          # Jest + React Testing Library (one file per component/page)
  middleware.ts       # Redirects unauthenticated users away from /dashboard
  ```

  ---

  ## Placeholder Items

  ┌────────────────────────┬─────────────────────────────────────┐
  │          Item          │              Location               │
  ├────────────────────────┼─────────────────────────────────────┤
  │ Logo                   │ Navigation.tsx, Footer.tsx          │
  ├────────────────────────┼─────────────────────────────────────┤
  │ Brand colors           │ tailwind.config.ts → brand.* values │
  ├────────────────────────┼─────────────────────────────────────┤
  │ Contact / booking link │ CTA.tsx                             │
  ├────────────────────────┼─────────────────────────────────────┤
  │ Dashboard UI           │ app/dashboard/page.tsx              │
  ├────────────────────────┼─────────────────────────────────────┤
  │ User invite flow       │ not yet built                       │
  └────────────────────────┴─────────────────────────────────────┘

  ---

  ## Tech Stack

  - https://nextjs.org — App Router
  - https://www.typescriptlang.org
  - https://tailwindcss.com
  - https://supabase.com — Auth + Postgres database
  - https://jestjs.io + https://testing-library.com
