---
name: global.setup
description: Playwright globalSetup entry point that runs the E2E seed script before any tests execute
type: project
---

# AI Contract: e2e/global.setup.ts

## Purpose
Ensures the test database is seeded with known fixture data before Playwright runs any specs. Invoked automatically by Playwright via the `globalSetup` config key.

## Allowed Responsibilities
- Spawn `e2e/seed.ts` via the local `tsx` binary, inheriting `process.env` (which already contains vars loaded by playwright.config.ts).
- Exit with a non-zero code (throw) if the seed script fails, so Playwright aborts rather than running specs against a stale or empty database.

## Not Allowed
- Do not duplicate seed logic here — delegate entirely to seed.ts.
- Do not load env vars directly — rely on playwright.config.ts having already called dotenv.
- Do not perform any database queries or auth operations directly.

## Public Interfaces
- Default export: `async function globalSetup()` — called by Playwright before workers start.
