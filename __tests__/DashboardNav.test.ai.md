---
name: DashboardNav.test
description: Tests for app/dashboard/DashboardNav — tab rendering, active/inactive styles based on pathname
type: project
---

# AI Contract: __tests__/DashboardNav.test.tsx

## Purpose
Unit tests for `app/dashboard/DashboardNav.tsx`. Verifies all four tabs render, active/inactive CSS styles applied based on current pathname via `usePathname`, and correct handling of exact vs. prefix matches.

## Allowed Responsibilities
- Mock `next/navigation` to control `usePathname` return value.
- Mock `next/link` to render plain anchor tags.
- Assert on rendered tab labels and anchor class names.

## Not Allowed
- Do not make network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders all four tabs (Overview, Homeowners, Billing, Warranty Docs).
- Marks Overview as active when pathname is exactly `/dashboard`.
- Does not mark Overview as active on `/dashboard/homeowners`.
- Marks Homeowners as active when pathname starts with `/dashboard/homeowners`.
- Marks Billing as active when pathname starts with `/dashboard/billing`.
- Marks Warranty Docs as active when pathname starts with `/dashboard/docs`.
- Applies inactive (`border-transparent`) styles to non-active tabs.
