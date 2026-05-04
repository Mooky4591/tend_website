# AI Contract: components/Navigation.tsx

## Purpose
Marketing site header/navigation component (`Navigation`) that renders a fixed top bar with the Tendr logo, desktop nav links, desktop CTA buttons, and a mobile hamburger menu with keyboard focus trapping (Escape to close, Tab wrapping).

## Allowed Responsibilities
- Render the fixed header with scroll-aware shadow via a `handleScroll` listener.
- Toggle the mobile menu open/closed with `mobileMenuOpen` state.
- Move focus to the first menu item when the mobile menu opens.
- Return focus to the hamburger button when the mobile menu closes.
- Handle Escape key (close menu) and Tab key wrapping inside the mobile menu via `handleMenuKeyDown`.
- Render `navLinks` (Features, How It Works, Pricing, FAQ), Sign in link, and "Book a Demo" CTA.

## Not Allowed
- Do not fetch navigation data; all links are hardcoded in `navLinks`.
- Do not use `<Link>` from Next.js for anchor links (`#features`, etc.); use plain `<a>`.
- Do not use `<Link>` for the Sign in link either — the current implementation uses `<a href="/login">`.
- Do not add authentication state logic here.

## Public Interfaces
- `export default function Navigation(): JSX.Element`

## Required Patterns
- `'use client'` directive required (uses hooks).
- `FOCUSABLE_SELECTORS = 'a[href], button:not([disabled])'` for focus management.
- `role="banner"` on `<header>`.
- Hamburger: `aria-expanded={mobileMenuOpen}`, `aria-controls="mobile-menu"`, dynamic `aria-label`.
- Mobile menu: `id="mobile-menu"`, `aria-label="Navigation menu"`.
- Scroll listener uses `{ passive: true }` and is cleaned up on unmount.
- `closeMobileMenu` uses `useCallback` with an empty dependency array.

## Tests Required
- Desktop nav links are rendered: Features, How It Works, Pricing, FAQ.
- Hamburger button toggles mobile menu visibility.
- Escape key closes the mobile menu.
- Focus returns to hamburger after mobile menu closes.
- Tab at the end of the mobile menu wraps to the first focusable item.
- Shift+Tab at the start wraps to the last focusable item.
- Header gains shadow class when scrolled past 8px.

## Notes for AI Agents
- Focus trapping logic is in `handleMenuKeyDown`. Do not simplify it to a library without ensuring keyboard accessibility is maintained.
- Mobile menu links call `onClick={closeMobileMenu}` to close the menu on selection.
