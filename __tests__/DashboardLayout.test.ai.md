---
name: DashboardLayout.test
description: Tests for app/dashboard/layout — auth redirect, header composition (logo, SettingsMenu, SignOutButton, DashboardNav), children slot
type: project
---

# AI Contract: __tests__/DashboardLayout.test.tsx

## Purpose
Unit tests for `app/dashboard/layout.tsx`. Verifies that unauthenticated users are redirected to `/login`, that authenticated users see the logo, SettingsMenu, SignOutButton, and DashboardNav in the header, and that children are rendered inside a `<main>` element.

## Allowed Responsibilities
- Mock `next/navigation` to capture and throw on `redirect` calls.
- Mock `@/lib/supabase/server` to control `getUser` outcomes.
- Mock `SignOutButton`, `SettingsMenu`, and `DashboardNav` with lightweight stubs to isolate the layout's own composition logic.
- Assert on redirect calls, rendered header elements, navigation landmark, and the main content slot.

## Not Allowed
- Do not make real network requests.
- Do not test the internal behavior of `SignOutButton`, `SettingsMenu`, or `DashboardNav`; those have their own test files.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Unauthenticated users are redirected to `/login`.
- Authenticated users see the logo, SettingsMenu, SignOutButton, and DashboardNav.
- `children` are rendered inside a `<main>` element.
