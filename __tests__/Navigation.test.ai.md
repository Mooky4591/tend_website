# AI Contract: __tests__/Navigation.test.tsx

## Purpose
Integration tests for `components/Navigation.tsx`. Verifies static rendering (logo, nav links, CTA links), mobile menu open/close behavior, keyboard accessibility (Escape key, focus trap), and ARIA attributes.

## Allowed Responsibilities
- Render `Navigation` and assert on the resulting DOM.
- Simulate user interaction (click, keyboard) via `userEvent`.
- Assert on ARIA attributes (`aria-expanded`, roles, labels).

## Not Allowed
- Do not mock internal state or component internals.
- Do not test implementation details (e.g., state variable names).
- Do not make real network requests.

## Public Interfaces
- No exports — test file only.

## Required Patterns
- Use `screen.getByRole('img', { name: 'Tendr' })` to assert the brand logo (not `getByText`).
- Use `userEvent.setup()` for all user interactions.

## Tests Required
- Renders the Tendr logo.
- Renders all desktop nav link labels (Features, How It Works, Pricing, FAQ).
- Nav links point to correct section anchors (`#features`, `#how-it-works`, `#pricing`, `#faq`).
- "Book a Demo" links point to `#contact`.
- "Sign in" links point to `/login`.
- Logo link has an accessible label.
- Renders a toggle button for mobile navigation.
- Hamburger button starts with `aria-expanded=false`.
- Mobile menu opens when hamburger is clicked.
- Hamburger `aria-expanded` becomes `true` when menu is open.
- Mobile menu closes when a nav link is clicked.
- Mobile menu closes when Book a Demo link is clicked.
- Menu toggles back to closed when hamburger is clicked again.
- Header has the correct `banner` role.
- Main nav has an accessible label.
- Pressing Escape closes the mobile menu and returns focus to the hamburger.
- Mobile menu is a navigation landmark with an accessible label.
- Tab on last focusable item in mobile menu wraps to first (focus trap).
- Shift+Tab on first focusable item in mobile menu wraps to last (focus trap).

## Notes for AI Agents
- Consumed by: CI test suite only.
- If `Navigation` changes its link structure, accessible labels, or mobile menu behavior, update these tests to match.
