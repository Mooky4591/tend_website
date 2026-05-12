# AI Contract: app/dashboard/SettingsMenu.tsx

## Purpose
Client Component (`SettingsMenu`) that renders a "Settings" button in the dashboard header. Clicking the button opens a dropdown menu with account-related actions. Currently the only menu item is "Change password."

## Allowed Responsibilities
- Render a "Settings" button that toggles a dropdown menu open/closed.
- Render a dropdown menu with `role="menu"` containing account action links.
- Close the dropdown when the user clicks outside the component (via `mousedown` listener).
- Close the dropdown when a menu item is clicked.
- Link to `/dashboard/settings/change-password` for the "Change password" item.

## Not Allowed
- Do not perform any auth operations here; navigation to the relevant page handles those.
- Do not fetch or display user data.
- Do not use the Supabase client.
- Do not add responsibilities beyond toggling the dropdown and rendering menu links.

## Public Interfaces
- `export default function SettingsMenu(): JSX.Element`

## Required Patterns
- `'use client'` directive required.
- Button has `aria-haspopup="true"` and `aria-expanded={open}` for accessibility.
- Dropdown has `role="menu"`; each item has `role="menuitem"`.
- Click-outside closes the menu via a `mousedown` event listener cleaned up on unmount.

## Tests Required
- Renders a "Settings" button.
- Dropdown is not visible initially.
- Clicking "Settings" opens the dropdown.
- "Change password" link is visible when dropdown is open and points to `/dashboard/settings/change-password`.
- Clicking a menu item closes the dropdown.
- Clicking outside the menu closes the dropdown.
- Button has `aria-expanded="false"` when closed and `aria-expanded="true"` when open.

## Notes for AI Agents
- This component is rendered in `app/dashboard/layout.tsx` inside the header, next to `SignOutButton`.
