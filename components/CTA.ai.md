# AI Contract: components/CTA.tsx

## Purpose
Marketing section component (`CTA`) that renders a full-width call-to-action section with a headline, subtitle, "Book a Demo" and "Contact Sales" links, and a fine-print line. Anchored at `id="contact"`.

## Allowed Responsibilities
- Render the CTA section with brand-colored background.
- Provide two `<a>` links (both currently pointing to `mailto:support@trytendr.org`).
- Render the small-print disclaimer text.

## Not Allowed
- Do not add a `'use client'` directive; this is a Server Component.
- Do not add form submission, API calls, or Supabase interactions.
- Do not use `<Link>` from Next.js; these are external/anchor hrefs.

## Public Interfaces
- `export default function CTA(): JSX.Element`

## Required Patterns
- `<section id="contact" aria-labelledby="cta-heading">` is required for the Footer's "Contact" anchor link to work.
- `id="cta-heading"` on the `<h2>`.
- Both CTA links have `focus:outline-none focus:ring-2` focus styles.

## Tests Required
- Section has `id="contact"`.
- "Book a Demo" and "Contact Sales" links are rendered.
- Both links are accessible (have visible focus styles).

## Notes for AI Agents
- The `href="mailto:support@trytendr.org"` is a placeholder. When a real demo booking link (Calendly, HubSpot, etc.) is configured, update the "Book a Demo" href; the comment in the source marks this location.
