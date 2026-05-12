---
name: SettingsMenu.test
description: Tests for app/dashboard/SettingsMenu — dropdown toggle, menu item links, click-outside close, ARIA attributes
type: project
---

# AI Contract: __tests__/SettingsMenu.test.tsx

## Purpose
Unit tests for `app/dashboard/SettingsMenu.tsx`. Verifies the Settings button renders, dropdown visibility toggles on click, "Change password" link is present and correctly href'd, clicking a menu item or clicking outside closes the dropdown, and ARIA attributes reflect open/closed state.

## Allowed Responsibilities
- Mock `next/navigation` for `useRouter`.
- Assert on button label, `aria-expanded` attribute, dropdown visibility, menu item text and href, and close-on-outside-click behavior.

## Not Allowed
- Do not make real network requests.
- Do not test Supabase auth operations (none exist in this component).

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders a "Settings" button.
- Dropdown is not visible initially.
- Clicking "Settings" opens the dropdown.
- "Change password" link is visible when dropdown is open.
- "Change password" link points to `/dashboard/settings/change-password`.
- Clicking a menu item closes the dropdown.
- Clicking outside the menu closes the dropdown.
- Button has `aria-expanded="false"` when closed.
- Button has `aria-expanded="true"` when open.
