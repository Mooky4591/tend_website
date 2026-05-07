---
name: auth.setup
description: Playwright global auth setup that logs in as E2E_TEST_EMAIL and saves Supabase session cookies to e2e/.auth/user.json for use by authenticated spec files
type: project
---

# AI Contract: e2e/auth.setup.ts

## Purpose
Playwright setup fixture that authenticates once before the authenticated project runs. Reads credentials from environment variables, fills the login form, waits for /dashboard, and persists browser storage state to disk.

## Allowed Responsibilities
- Read E2E_TEST_EMAIL and E2E_TEST_PASSWORD from the environment.
- Navigate to /login, fill the form, and submit.
- Assert that /dashboard is reached.
- Write browser storage state to e2e/.auth/user.json.
- Create the e2e/.auth/ directory if it does not exist.

## Not Allowed
- Do not define test assertions beyond confirming the login succeeded.
- Do not modify application data (database, reminders, messages).
- Do not import from spec files.

## Public Interfaces
- No exports — Playwright discovers this via the `testMatch` pattern in playwright.config.ts.
